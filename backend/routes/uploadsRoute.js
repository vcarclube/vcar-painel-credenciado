const express = require("express")
const router = express.Router();
const multer = require("multer")
const fs = require("fs")
const ftp = require("basic-ftp")
const Utils = require('../utils');
const { validateToken } = require("../middlewares/AuthMiddleware");
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const zlib = require('react-zlib-js');
const path = require("path");

const statAsync = promisify(fs.stat);

// Garantir que a pasta existe
const uploadDir = 'uploads/temp/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const ftpViewPool = {
    connections: new Map(),
    maxConnections: 5,
    
    async getConnection() {
        const connectionKey = `${Date.now()}_${Math.random()}`;
        
        // Limpar conexões antigas (mais de 30s)
        const now = Date.now();
        for (const [key, conn] of this.connections.entries()) {
            if (now - conn.created > 30000) {
                try {
                    conn.client.close();
                } catch (e) {}
                this.connections.delete(key);
            }
        }
        
        // Criar nova conexão otimizada
        const client = new ftp.Client();
        client.ftp.verbose = false;
        
        await client.access({
            host: "216.158.231.74",
            user: "vcarclub",
            password: "7U@gSNCc",
            secure: false,
            connTimeout: 5000,      // Timeout reduzido
            pasvTimeout: 5000,
            keepalive: 60000,       // Keep-alive longo
            // Configurações TCP otimizadas
            socket: {
                timeout: 30000,
                keepAlive: true,
                noDelay: true
            }
        });
        
        await client.cd("/uploads");
        
        const connection = {
            client,
            created: now,
            key: connectionKey
        };
        
        this.connections.set(connectionKey, connection);
        return connection;
    },
    
    releaseConnection(connection) {
        // Manter conexão viva por um tempo
        setTimeout(() => {
            if (this.connections.has(connection.key)) {
                try {
                    connection.client.close();
                } catch (e) {}
                this.connections.delete(connection.key);
            }
        }, 30000); // 30 segundos
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB
        fieldSize: 100 * 1024 * 1024,
        files: 1,
        fields: 10
    },
    fileFilter: (req, file, cb) => {
        console.log(`📤 Recebendo arquivo: ${file.originalname} (${file.mimetype})`);
        cb(null, true);
    }
});

const verifyUpload = (req, res, next) => {
    if (req.file) {
        console.log(`✅ Arquivo salvo: ${req.file.path} (${req.file.size} bytes)`);
        
        // Verificação adicional
        if (req.file.size === 0) {
            fs.unlinkSync(req.file.path); // Remover arquivo vazio
            return res.status(400).json({ error: "Arquivo vazio recebido" });
        }
    }
    next();
};

const sanitizeFileName = (filename) => {
  return filename
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .replace(/\s+/g, "_") // troca espaços por "_"
    .replace(/[^a-zA-Z0-9._-]/g, ""); // mantém apenas letras, números, ., _, -
};

router.post("/upload", validateToken, upload.single("file"), async (req, res) => {
    const startTime = Date.now();
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const localPath = req.file.path;
        
        // MÚLTIPLAS VERIFICAÇÕES DO ARQUIVO LOCAL
        console.log(`📋 Arquivo recebido: ${req.file.originalname}`);
        console.log(`📍 Caminho: ${localPath}`);
        console.log(`📊 Tamanho reportado pelo multer: ${req.file.size} bytes`);
        
        // Verificação 1: Stats do arquivo
        const stats = await statAsync(localPath);
        console.log(`📊 Tamanho real no disco: ${stats.size} bytes`);
        
        if (stats.size === 0) {
            await fs.unlinkSync(localPath);
            return res.status(400).json({ error: "Arquivo salvo está vazio" });
        }
        
        if (stats.size !== req.file.size) {
            console.warn(`⚠️ Diferença de tamanho: multer=${req.file.size}, disco=${stats.size}`);
        }
        
        // Verificação 2: Tentar ler primeiros bytes
        try {
            const fd = fs.openSync(localPath, 'r');
            const buffer = Buffer.alloc(1024);
            const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
            fs.closeSync(fd);
            
            console.log(`📖 Primeiros ${bytesRead} bytes lidos com sucesso`);
            
            if (bytesRead === 0) {
                throw new Error("Não foi possível ler dados do arquivo");
            }
        } catch (readErr) {
            console.error("❌ Erro ao ler arquivo:", readErr);
            await fs.unlinkSync(localPath);
            return res.status(400).json({ error: "Arquivo corrompido ou ilegível" });
        }

        const remotePath = Utils.generateUUID() + sanitizeFileName(req.file.originalname);
        
        console.log(`🚀 Iniciando upload para: ${remotePath}`);

        // Upload com retry automático
        let uploadSuccess = false;
        let lastError;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`🔄 Tentativa ${attempt}/3`);
                
                await Utils.ultraFastUploadToFTP(localPath, remotePath, (progress, speed) => {
                    console.log(`⚡ Progresso: ${progress}% | Velocidade: ${speed} MB/s`);
                });
                
                uploadSuccess = true;
                break;
                
            } catch (uploadErr) {
                lastError = uploadErr;
                console.error(`❌ Tentativa ${attempt} falhou:`, uploadErr.message);
                
                if (attempt < 3) {
                    console.log(`⏳ Aguardando 2s antes da próxima tentativa...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        if (!uploadSuccess) {
            await fs.unlinkSync(localPath);
            throw lastError || new Error("Upload falhou após 3 tentativas");
        }
        
        const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`🎯 UPLOAD TOTAL CONCLUÍDO EM ${uploadTime}s`);

        // Resposta de sucesso
        res.json({ 
            success: true, 
            file: remotePath,
            originalSize: stats.size,
            uploadTime: uploadTime
        });

        // Cleanup em background
        fs.unlinkSync(localPath).catch(err => {
            console.warn("Aviso: Erro ao deletar arquivo temporário:", err.message);
        });

    } catch (err) {
        console.error("❌ Erro na rota /upload:", err);
        
        // Cleanup de emergência
        if (req.file?.path) {
            fs.unlinkSync(req.file.path).catch(() => {});
        }
        
        return res.status(500).json({ 
            error: "Erro no upload",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

router.get("/files/:filename", async (req, res) => {
    const startTime = Date.now();
    const { filename } = req.params;
    const range = req.headers.range;
    
    let connection;
    
    try {
        console.log(`🚀 Solicitação: ${filename} | Range: ${range || 'completo'}`);
        
        connection = await ftpViewPool.getConnection();
        const { client } = connection;
        
        console.log(`⚡ Conexão obtida em ${Date.now() - startTime}ms`);

        // Verificar arquivo
        let fileInfo;
        try {
            const fileSize = await client.size(filename);
            fileInfo = { size: fileSize, name: filename };
            console.log(`�� Arquivo: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
        } catch (sizeErr) {
            const fileList = await client.list();
            fileInfo = fileList.find(file => file.name === filename);
            
            if (!fileInfo) {
                ftpViewPool.releaseConnection(connection);
                return res.status(404).json({ error: "Arquivo não encontrado" });
            }
        }

        // Detecção de tipo
        const fileExtension = filename.toLowerCase().split('.').pop();
        const isVideo = ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', '3gp'].includes(fileExtension);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension);
        const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(fileExtension);
        
        let contentType = "application/octet-stream";
        if (isVideo) {
            contentType = `video/${fileExtension === 'mov' ? 'quicktime' : fileExtension}`;
        } else if (isImage) {
            contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        } else if (isAudio) {
            contentType = `audio/${fileExtension}`;
        }

        // Headers básicos
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Content-Type-Options", "nosniff");
        
        // LÓGICA ESPECIAL PARA VÍDEOS GRANDES
        if (isVideo && fileInfo.size > 100 * 1024 * 1024) { // > 100MB
            console.log(`🎬 Vídeo grande detectado: ${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB`);
            
            // Cache mais agressivo para vídeos grandes
            res.setHeader("Cache-Control", "public, max-age=604800, immutable"); // 7 dias
            
            if (range) {
                // RANGE REQUEST OTIMIZADO PARA VÍDEOS GRANDES
                console.log(`📹 Range request: ${range}`);
                
                const parts = range.replace(/bytes=/, "").split("-");
                let start = parseInt(parts[0], 10) || 0;
                let end = parts[1] ? parseInt(parts[1], 10) : fileInfo.size - 1;
                
                // Chunk size adaptativo baseado no tamanho do arquivo
                let chunkSize;
                if (fileInfo.size > 1000 * 1024 * 1024) { // > 1GB
                    chunkSize = 50 * 1024 * 1024; // 50MB chunks
                } else if (fileInfo.size > 500 * 1024 * 1024) { // > 500MB
                    chunkSize = 25 * 1024 * 1024; // 25MB chunks
                } else {
                    chunkSize = 10 * 1024 * 1024; // 10MB chunks
                }
                
                // Ajustar end se necessário
                if (end - start + 1 > chunkSize) {
                    end = start + chunkSize - 1;
                }
                
                // Garantir que não exceda o arquivo
                if (end >= fileInfo.size) {
                    end = fileInfo.size - 1;
                }
                
                const contentLength = end - start + 1;
                
                res.status(206);
                res.setHeader("Content-Range", `bytes ${start}-${end}/${fileInfo.size}`);
                res.setHeader("Content-Length", contentLength);
                
                console.log(`�� Chunk: ${start}-${end} (${(contentLength / (1024 * 1024)).toFixed(2)}MB)`);
                
                // STREAMING OTIMIZADO COM CONTROLE PRECISO
                try {
                    // Posicionar no arquivo usando REST
                    if (start > 0) {
                        await client.send(`REST ${start}`);
                        console.log(`📍 Posicionado em: ${start} bytes`);
                    }
                    
                    // Criar stream controlado
                    const controlledStream = new PassThrough({
                        highWaterMark: 256 * 1024 // 256KB buffer
                    });
                    
                    let bytesStreamed = 0;
                    let streamEnded = false;
                    
                    // Cleanup function
                    const cleanup = () => {
                        if (!streamEnded) {
                            streamEnded = true;
                            controlledStream.destroy();
                        }
                        if (connection) {
                            ftpViewPool.releaseConnection(connection);
                            connection = null;
                        }
                    };
                    
                    // Event listeners para cleanup
                    res.on('close', cleanup);
                    res.on('error', cleanup);
                    res.on('finish', cleanup);
                    
                    // Iniciar download FTP
                    const ftpDownload = client.downloadToWritableStream(filename);
                    
                    ftpDownload.on('data', (chunk) => {
                        if (streamEnded) return;
                        
                        const remainingBytes = contentLength - bytesStreamed;
                        
                        if (remainingBytes <= 0) {
                            if (!streamEnded) {
                                streamEnded = true;
                                controlledStream.end();
                            }
                            return;
                        }
                        
                        if (chunk.length <= remainingBytes) {
                            bytesStreamed += chunk.length;
                            controlledStream.write(chunk);
                        } else {
                            const partialChunk = chunk.slice(0, remainingBytes);
                            bytesStreamed += partialChunk.length;
                            controlledStream.write(partialChunk);
                            
                            if (!streamEnded) {
                                streamEnded = true;
                                controlledStream.end();
                            }
                        }
                        
                        // Verificar se completou
                        if (bytesStreamed >= contentLength && !streamEnded) {
                            streamEnded = true;
                            controlledStream.end();
                        }
                    });
                    
                    ftpDownload.on('end', () => {
                        if (!streamEnded) {
                            streamEnded = true;
                            controlledStream.end();
                        }
                    });
                    
                    ftpDownload.on('error', (err) => {
                        console.error('❌ Erro no download FTP:', err);
                        if (!streamEnded) {
                            streamEnded = true;
                            controlledStream.destroy(err);
                        }
                    });
                    
                    // Pipe para resposta
                    controlledStream.pipe(res);
                    
                    console.log(`🎯 Streaming iniciado: ${start}-${end}`);
                    
                } catch (streamErr) {
                    console.error('❌ Erro no streaming:', streamErr);
                    throw streamErr;
                }
                
            } else {
                // DOWNLOAD COMPLETO PARA VÍDEOS GRANDES (NÃO RECOMENDADO)
                console.log(`⚠️ Download completo solicitado para vídeo grande`);
                
                res.setHeader("Content-Length", fileInfo.size);
                res.setHeader("Cache-Control", "public, max-age=3600"); // Cache menor para downloads completos
                
                const cleanup = () => {
                    if (connection) {
                        ftpViewPool.releaseConnection(connection);
                        connection = null;
                    }
                };
                
                res.on('close', cleanup);
                res.on('error', cleanup);
                res.on('finish', cleanup);
                
                await client.downloadTo(res, filename);
            }
            
        } else {
            // ARQUIVOS MENORES OU NÃO-VÍDEOS (LÓGICA ORIGINAL)
            console.log(`📄 Arquivo padrão: ${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB`);
            
            res.setHeader("Cache-Control", "public, max-age=86400");
            
            if (range && (isVideo || isAudio)) {
                // Range request para arquivos menores
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10) || 0;
                let end = parts[1] ? parseInt(parts[1], 10) : fileInfo.size - 1;
                
                const maxChunkSize = 5 * 1024 * 1024; // 5MB para arquivos menores
                if (end - start + 1 > maxChunkSize) {
                    end = start + maxChunkSize - 1;
                }
                
                const contentLength = end - start + 1;
                
                res.status(206);
                res.setHeader("Content-Range", `bytes ${start}-${end}/${fileInfo.size}`);
                res.setHeader("Content-Length", contentLength);
                
                if (start > 0) {
                    await client.send(`REST ${start}`);
                }
                
                // Stream simples para arquivos menores
                const ftpStream = await client.downloadToWritableStream(filename);
                let bytesRead = 0;
                
                ftpStream.on('data', (chunk) => {
                    const remaining = contentLength - bytesRead;
                    if (remaining <= 0) return;
                    
                    if (chunk.length <= remaining) {
                        bytesRead += chunk.length;
                        res.write(chunk);
                    } else {
                        const partial = chunk.slice(0, remaining);
                        bytesRead += partial.length;
                        res.write(partial);
                    }
                    
                    if (bytesRead >= contentLength) {
                        res.end();
                        ftpStream.destroy();
                    }
                });
                
                ftpStream.on('end', () => res.end());
                ftpStream.on('error', (err) => {
                    console.error('Erro no stream:', err);
                    if (!res.headersSent) {
                        res.status(500).end();
                    }
                });
                
            } else {
                // Download completo para arquivos pequenos
                res.setHeader("Content-Length", fileInfo.size);
                
                const cleanup = () => {
                    if (connection) {
                        ftpViewPool.releaseConnection(connection);
                        connection = null;
                    }
                };
                
                res.on('close', cleanup);
                res.on('error', cleanup);
                res.on('finish', cleanup);
                
                await client.downloadTo(res, filename);
            }
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`🎯 Processamento concluído em ${totalTime}ms`);
        
    } catch (err) {
        console.error("❌ Erro:", err);
        
        if (connection) {
            try {
                connection.client.close();
            } catch (e) {}
        }
        
        if (!res.headersSent) {
            if (err.code === 550 || err.message.includes('not found')) {
                res.status(404).json({ error: "Arquivo não encontrado" });
            } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                res.status(503).json({ error: "Servidor temporariamente indisponível" });
            } else {
                res.status(500).json({ error: "Erro interno do servidor" });
            }
        }
    }
});

process.on('SIGTERM', () => {
    console.log('🧹 Limpando pool de conexões FTP...');
    for (const [key, conn] of ftpViewPool.connections.entries()) {
        try {
            conn.client.close();
        } catch (e) {}
    }
    ftpViewPool.connections.clear();
});

module.exports = router;