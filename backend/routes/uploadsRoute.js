const express = require("express")
const router = express.Router();
const multer = require("multer")
const fs = require("fs")
const ftp = require("basic-ftp")
const upload = multer({ dest: "uploads/" });
const Utils = require('../utils');
const { validateToken } = require("../middlewares/AuthMiddleware");
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const zlib = require('react-zlib-js');

const sanitizeFileName = (filename) => {
  return filename
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .replace(/\s+/g, "_") // troca espaços por "_"
    .replace(/[^a-zA-Z0-9._-]/g, ""); // mantém apenas letras, números, ., _, -
};

router.post("/upload", validateToken, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" })
        }

        const localPath = req.file.path
        const remotePath = Utils.generateUUID() + sanitizeFileName(req.file.originalname)

        // Faz upload para FTP
        await Utils.uploadToFTP(localPath, remotePath, (progress) => {
            console.log(`Progresso: ${progress}%`)
        })

        // Apaga o arquivo temporário
        fs.unlinkSync(localPath)

        return res.json({ success: true, file: remotePath })
    } catch (err) {
        console.error("Erro na rota /upload:", err)
        return res.status(500).json({ error: "Erro no upload" })
    }
})


router.get("/files/:filename", async (req, res) => {
    const { filename } = req.params;
    const { compress = 'true', quality = 'medium' } = req.query;
    
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        // Configuração otimizada para velocidade
        await client.access({
            host: "216.158.231.74",
            user: "vcarclub",
            password: "7U@gSNCc",
            secure: false,
            connTimeout: 15000,
            pasvTimeout: 15000,
            keepalive: 30000
        });

        await client.cd("/uploads");

        // Verificar se arquivo existe e obter informações
        const fileList = await client.list();
        const fileInfo = fileList.find(file => file.name === filename);
        
        if (!fileInfo) {
            client.close(); // Fechar aqui se arquivo não existe
            return res.status(404).json({ error: "Arquivo não encontrado" });
        }

        // Detectar tipo de arquivo
        const fileExtension = filename.toLowerCase().split('.').pop();
        const isVideo = ['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(fileExtension);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
        
        // Configurar headers baseados no tipo
        let contentType = "application/octet-stream";
        if (isVideo) {
            contentType = `video/${fileExtension === 'mov' ? 'quicktime' : fileExtension}`;
        } else if (isImage) {
            contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        }

        // Headers de resposta otimizados
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("Accept-Ranges", "bytes");

        // Compressão condicional
        const shouldCompress = compress === 'true' && 
                              !isVideo && 
                              fileInfo.size > 1024 && 
                              req.headers['accept-encoding']?.includes('gzip');

        if (shouldCompress) {
            res.setHeader("Content-Encoding", "gzip");
            
            const gzipLevel = quality === 'fast' ? 1 : quality === 'high' ? 9 : 6;
            const gzipStream = zlib.createGzip({
                level: gzipLevel,
                chunkSize: 16 * 1024
            });

            // Criar stream passthrough para o FTP
            const ftpStream = new stream.PassThrough();
            
            // Configurar eventos para fechar cliente após download
            ftpStream.on('end', () => {
                client.close();
            });
            
            ftpStream.on('error', (err) => {
                console.error('Erro no stream FTP:', err);
                client.close();
            });

            // Pipeline: FTP → Gzip → Response
            const downloadPromise = client.downloadTo(ftpStream, filename);
            const pipelinePromise = pipeline(ftpStream, gzipStream, res);
            
            // Aguardar ambos completarem
            await Promise.all([downloadPromise, pipelinePromise]);
            
        } else {
            // Stream direto sem compressão
            
            // Configurar eventos de resposta para fechar cliente
            res.on('finish', () => {
                client.close();
            });
            
            res.on('error', (err) => {
                console.error('Erro na resposta:', err);
                client.close();
            });
            
            res.on('close', () => {
                client.close();
            });

            await client.downloadTo(res, filename);
        }

    } catch (err) {
        //console.error("Erro ao buscar arquivo:", err);
        
        // Fechar cliente em caso de erro
        try {
            client.close();
        } catch (closeErr) {
            c//onsole.error("Erro ao fechar cliente:", closeErr);
        }
        
        if (!res.headersSent) {
            if (err.code === 550) {
                res.status(404).json({ error: "Arquivo não encontrado" });
            } else if (err.code === 'ECONNREFUSED') {
                res.status(503).json({ error: "Servidor temporariamente indisponível" });
            } else {
                res.status(500).json({ error: "Erro interno do servidor" });
            }
        }
    }
    // Removido o finally - cliente é fechado nos eventos apropriados
});

// Função auxiliar para Range Requests (se necessário)
async function handleRangeRequest(client, filename, fileInfo, range, res) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileInfo.size - 1;
    const chunksize = (end - start) + 1;

    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileInfo.size}`);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", chunksize);

    try {
        // Para range requests, baixamos o arquivo completo e fazemos slice
        // (Não é ideal para arquivos muito grandes, mas funciona)
        const chunks = [];
        const tempStream = new stream.Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });

        await client.downloadTo(tempStream, filename);
        const buffer = Buffer.concat(chunks);
        const slice = buffer.slice(start, end + 1);
        
        res.end(slice);
        client.close();
        
    } catch (err) {
        client.close();
        //throw err;
    }
}

module.exports = router;