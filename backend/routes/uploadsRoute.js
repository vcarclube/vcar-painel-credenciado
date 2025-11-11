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
const { PassThrough } = require('stream');
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
    maxConnections: parseInt(process.env.FTP_MAX_CONNECTIONS || '20', 10),
    
    // Limpeza periódica de conexões inválidas
    startCleanupTimer() {
        setInterval(async () => {
            console.log('🧹 Verificando conexões inválidas...');
            const toRemove = [];
            
            for (const [id, connection] of this.connections) {
                if (!connection.inUse) {
                    try {
                        await connection.client.pwd();
                    } catch (error) {
                        console.log(`🗑️ Removendo conexão inválida: ${id}`);
                        toRemove.push(id);
                        try {
                            connection.client.close();
                        } catch (closeError) {
                            // Ignorar erro ao fechar conexão já morta
                        }
                    }
                }
            }
            
            toRemove.forEach(id => this.connections.delete(id));
            
            if (toRemove.length > 0) {
                console.log(`🧹 Removidas ${toRemove.length} conexões inválidas`);
            }
        }, 30000); // Verificar a cada 30 segundos
    },
    
    async getConnection() {
        const deadline = Date.now() + 30000; // espere até 30s por uma conexão
        while (true) {
            // Procurar conexão disponível e válida
            for (const [id, connection] of this.connections) {
                if (!connection.inUse) {
                    try {
                        await connection.client.pwd();
                        connection.inUse = true;
                        connection.lastUsed = Date.now();
                        console.log(`♻️ Reutilizando conexão ${id}`);
                        return connection;
                    } catch (testError) {
                        console.log(`🔄 Conexão ${id} inválida, removendo...`);
                        this.connections.delete(id);
                        try { connection.client.close(); } catch (_) {}
                    }
                }
            }

            // Criar nova conexão se não atingiu o limite
            if (this.connections.size < this.maxConnections) {
                const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const client = new ftp.Client();
                client.ftp.verbose = false;
                client.ftp.timeout = 10000; // 10 segundos

                try {
                    await client.access({
                        host: process.env.FTP_HOST,
                        user: process.env.FTP_USER,
                        password: process.env.FTP_PASSWORD,
                        secure: false
                    });

                    const connection = {
                        id: connectionId,
                        client,
                        inUse: true,
                        created: Date.now(),
                        lastUsed: Date.now()
                    };

                    this.connections.set(connectionId, connection);
                    console.log(`🆕 Nova conexão criada: ${connectionId}`);
                    return connection;
                } catch (err) {
                    console.error('Erro ao criar conexão FTP:', err);
                    // Se falhar criação, prossiga esperando
                }
            }

            // Se passou do deadline, estourar
            if (Date.now() > deadline) {
                throw new Error('Pool de conexões esgotado');
            }

            // Aguardar liberação
            await new Promise(r => setTimeout(r, 150));
        }
    },
    
    releaseConnection(connection) {
        if (connection && this.connections.has(connection.id)) {
            connection.inUse = false;
            connection.lastUsed = Date.now();
            console.log(`🔓 Conexão liberada: ${connection.id}`);
        }
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const sanitized = sanitizeFileName(file.originalname);
        cb(null, sanitized)
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
        console.log('📁 Upload iniciado:', file.originalname);
        cb(null, true);
    }
});

const verifyUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Nenhum arquivo foi enviado"
        });
    }
    next();
};

const sanitizeFileName = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 255);
};

router.post("/upload", validateToken, upload.single("file"), async (req, res) => {
    const startTime = Date.now();
    let connection;
    
    try {
        console.log('🚀 Iniciando upload para FTP...');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Nenhum arquivo foi enviado"
            });
        }

        const localFilePath = req.file.path;
        const fileName = req.file.filename;
        const originalName = req.file.originalname;
        const fileSize = req.file.size;
        
        console.log(`📄 Arquivo: ${originalName} (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`);
        
        // Obter conexão do pool
        connection = await ftpViewPool.getConnection();
        const { client } = connection;
        
        console.log(`⚡ Conexão FTP obtida em ${Date.now() - startTime}ms`);
        
        // Navegar para o diretório uploads
        try {
            await client.ensureDir('/uploads');
            console.log('📁 Navegado para diretório /uploads');
        } catch (dirError) {
            console.log('📁 Criando diretório /uploads...');
            await client.ensureDir('/uploads');
        }
        
        // Upload para FTP
        const uploadStartTime = Date.now();
        await client.uploadFrom(localFilePath, fileName);
        const uploadTime = Date.now() - uploadStartTime;
        
        console.log(`📤 Upload concluído em ${uploadTime}ms`);
        
        // Limpar arquivo local
        try {
            fs.unlinkSync(localFilePath);
            console.log('🗑️ Arquivo local removido');
        } catch (cleanupErr) {
            console.warn('⚠️ Erro ao remover arquivo local:', cleanupErr.message);
        }
        
        // Liberar conexão
        ftpViewPool.releaseConnection(connection);
        
        const totalTime = Date.now() - startTime;
        console.log(`🎯 Upload total concluído em ${totalTime}ms`);
        
        res.json({
            success: true,
            message: "Arquivo enviado com sucesso",
            filename: fileName,
            file: fileName,
            originalName: originalName,
            size: fileSize,
            uploadTime: totalTime
        });
        
    } catch (error) {
        console.error('❌ Erro no upload:', error);
        
        // Marcar conexão como inválida e removê-la do pool se for erro de conexão
        if (connection && (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT')) {
            console.log('🔄 Removendo conexão inválida do pool...');
            ftpViewPool.connections.delete(connection.id);
            try {
                connection.client.close();
            } catch (closeError) {
                // Ignorar erro ao fechar conexão já morta
            }
        } else if (connection) {
            ftpViewPool.releaseConnection(connection);
        }
        
        // Limpar arquivo local em caso de erro
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.warn('⚠️ Erro ao limpar arquivo local:', cleanupErr.message);
            }
        }
        
        // Retry automático para erros de conexão (apenas uma tentativa)
        if ((error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') && !req.retryAttempt) {
            console.log('🔄 Tentando novamente após erro de conexão...');
            req.retryAttempt = true;
            
            try {
                // Aguardar um pouco e tentar obter nova conexão
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Tentar upload novamente com nova conexão
                const retryConnection = await ftpViewPool.getConnection();
                const { client: retryClient } = retryConnection;
                
                console.log('🔄 Tentativa de retry iniciada...');
                
                // Navegar para o diretório uploads no retry
                try {
                    await retryClient.ensureDir('/uploads');
                    console.log('📁 Navegado para diretório /uploads (retry)');
                } catch (dirError) {
                    console.log('📁 Criando diretório /uploads (retry)...');
                    await retryClient.ensureDir('/uploads');
                }
                
                await retryClient.uploadFrom(localFilePath, fileName);
                
                // Limpar arquivo local
                try {
                    fs.unlinkSync(localFilePath);
                    console.log('🗑️ Arquivo local removido (retry)');
                } catch (cleanupErr) {
                    console.warn('⚠️ Erro ao remover arquivo local (retry):', cleanupErr.message);
                }
                
                // Liberar conexão
                ftpViewPool.releaseConnection(retryConnection);
                
                console.log('✅ Upload concluído com sucesso no retry');
                
                res.json({
                    success: true,
                    message: "Arquivo enviado com sucesso (após retry)",
                    filename: fileName,
                    originalName: originalName,
                    size: fileSize
                });
                return;
                
            } catch (retryError) {
                console.error('❌ Erro no retry:', retryError);
                // Continuar para o tratamento de erro normal
            }
        }
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            res.status(503).json({
                success: false,
                message: "Servidor FTP temporariamente indisponível. Tente novamente em alguns instantes."
            });
        } else if (error.code === 'ENOTFOUND') {
            res.status(503).json({
                success: false,
                message: "Servidor FTP não encontrado"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Erro interno do servidor",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
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

        // Navegar para o diretório uploads
        await client.ensureDir('/uploads');
        await client.cd('/uploads');
        console.log(`📂 Navegado para /uploads`);

        // Verificar arquivo
        let fileInfo;
        try {
            const fileSize = await client.size(filename);
            fileInfo = { size: fileSize, name: filename };
            console.log(`📁 Arquivo: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
        } catch (sizeErr) {
            const fileList = await client.list();
            fileInfo = fileList.find(file => file.name === filename);
            
            console.log(sizeErr)

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

        // Headers básicos para vídeos
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Range");
        res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        res.setHeader("X-Content-Type-Options", "nosniff");
        
        // Cleanup: diferenciar encerramento normal vs abortado
        const releaseOnly = () => {
            if (connection) {
                ftpViewPool.releaseConnection(connection);
                connection = null;
                console.log('🔓 Conexão liberada no finish');
            }
        };
        const forceClose = () => {
            if (connection) {
                try { connection.client.close(); } catch(_) {}
                ftpViewPool.connections.delete(connection.id);
                connection = null;
                console.log('🔌 Conexão encerrada e removida (abort/error)');
            }
        };
        
        res.on('finish', releaseOnly);
        res.on('close', forceClose);
        res.on('error', forceClose);
        
        // SUPORTE GENÉRICO A RANGE (vídeo, imagem, áudio)
        if (range && fileInfo.size && Number.isFinite(fileInfo.size)) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10) || 0;
            const requestedEnd = parts[1] ? parseInt(parts[1], 10) : null;
            const safeEnd = requestedEnd !== null && !Number.isNaN(requestedEnd)
                ? Math.min(requestedEnd, fileInfo.size - 1)
                : fileInfo.size - 1;
            const contentLength = safeEnd - start + 1;

            res.status(206);
            res.setHeader("Content-Range", `bytes ${start}-${safeEnd}/${fileInfo.size}`);
            res.setHeader("Content-Length", contentLength);
            res.setHeader("Cache-Control", "public, max-age=3600");

            console.log(`📦 Range: ${start}-${safeEnd} (${(contentLength / (1024 * 1024)).toFixed(2)}MB)`);

            // Se o cliente pediu um fim explícito, honrar enviando APENAS esse intervalo.
            if (requestedEnd !== null && !Number.isNaN(requestedEnd)) {
                const pt = new PassThrough();
                // Transform para limitar bytes ao contentLength
                const limiter = new stream.Transform({
                    readableHighWaterMark: 64 * 1024,
                    writableHighWaterMark: 64 * 1024,
                    transform(chunk, enc, cb) {
                        if (this.bytesSent === undefined) this.bytesSent = 0;
                        const remaining = contentLength - this.bytesSent;
                        if (remaining <= 0) {
                            return cb();
                        }
                        if (chunk.length <= remaining) {
                            this.bytesSent += chunk.length;
                            cb(null, chunk);
                        } else {
                            this.bytesSent += remaining;
                            cb(null, chunk.slice(0, remaining));
                            this.end();
                        }
                    }
                });

                // Ao terminar o chunk, encerrar o FTP para abortar o restante com segurança
                limiter.on('finish', () => {
                    try { pt.destroy(); } catch (_) {}
                    try { client.close(); } catch (_) {}
                    console.log('✅ Chunk concluído, FTP encerrado para honrar Range');
                });

                // Iniciar download para o PassThrough e encadear limitador -> res
                const downloadPromise = client.downloadTo(pt, filename, start);
                pt.pipe(limiter).pipe(res);

                try {
                    await downloadPromise;
                    console.log(`🎯 Streaming (chunk) iniciado no offset ${start}`);
                } catch (streamErr) {
                    const msg = String(streamErr && streamErr.message || '');
                    if (streamErr.code === 'ERR_STREAM_PREMATURE_CLOSE' || msg.includes('User closed client during task')) {
                        console.log('ℹ️ Streaming abortado pelo cliente (premature close)');
                    } else {
                        console.error('❌ Erro no streaming:', streamErr);
                        if (!res.headersSent) {
                            res.status(500).json({ error: "Erro no streaming" });
                        }
                    }
                }
            } else {
                // Sem fim explícito: enviar até EOF
                try {
                    await client.downloadTo(res, filename, start);
                    console.log(`🎯 Streaming iniciado no offset ${start}`);
                } catch (streamErr) {
                    const msg = String(streamErr && streamErr.message || '');
                    if (streamErr.code === 'ERR_STREAM_PREMATURE_CLOSE' || msg.includes('User closed client during task')) {
                        console.log('ℹ️ Streaming abortado pelo cliente (premature close)');
                    } else {
                        console.error('❌ Erro no streaming:', streamErr);
                        if (!res.headersSent) {
                            res.status(500).json({ error: "Erro no streaming" });
                        }
                    }
                }
            }
            
        } else if (isVideo) {
            // Vídeo sem Range: responder com 206 e Content-Range completo para máxima compatibilidade
            console.log(`🎬 Vídeo sem range, respondendo 206 com faixa completa`);
            
            if (fileInfo.size && Number.isFinite(fileInfo.size)) {
                res.status(206);
                res.setHeader("Content-Range", `bytes 0-${fileInfo.size - 1}/${fileInfo.size}`);
                res.setHeader("Content-Length", fileInfo.size);
            } else {
                // Sem tamanho confiável: cair para 200
                res.status(200);
            }
            res.setHeader("Cache-Control", "public, max-age=3600");

            try {
                await client.downloadTo(res, filename);
                console.log(`🎯 Streaming concluído`);
            } catch (streamErr) {
                const msg = String(streamErr && streamErr.message || '');
                if (streamErr.code === 'ERR_STREAM_PREMATURE_CLOSE' || msg.includes('User closed client during task')) {
                    console.log('ℹ️ Streaming abortado pelo cliente (premature close)');
                } else {
                    console.error('❌ Erro no streaming:', streamErr);
                    if (!res.headersSent) {
                        res.status(500).json({ error: "Erro no streaming" });
                    }
                }
            }
            
        } else {
            // ARQUIVOS NÃO-VÍDEOS (LÓGICA ORIGINAL)
            console.log(`📄 Arquivo não-vídeo: ${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB`);
            
            res.setHeader("Cache-Control", "public, max-age=86400");
            if (fileInfo.size && Number.isFinite(fileInfo.size)) {
                res.setHeader("Content-Length", fileInfo.size);
            }
            
            await client.downloadTo(res, filename);
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`🎯 Processamento concluído em ${totalTime}ms`);
        
    } catch (err) {
        console.error("❌ Erro:", err);
        
        if (connection) {
            try {
                ftpViewPool.releaseConnection(connection);
            } catch (e) {
                console.error('Erro ao liberar conexão:', e);
            }
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

// Limpeza periódica de conexões inativas
setInterval(() => {
    const now = Date.now();
    const maxIdleTime = 5 * 60 * 1000; // 5 minutos
    
    for (const [id, connection] of ftpViewPool.connections) {
        if (!connection.inUse && (now - connection.lastUsed) > maxIdleTime) {
            try {
                connection.client.close();
                ftpViewPool.connections.delete(id);
                console.log(`🧹 Conexão inativa removida: ${id}`);
            } catch (err) {
                console.error('Erro ao fechar conexão inativa:', err);
            }
        }
    }
}, 60000); // Verificar a cada minuto

// Cleanup ao encerrar processo
process.on('SIGTERM', () => {
    console.log('🛑 Encerrando servidor...');
    for (const [id, connection] of ftpViewPool.connections) {
        try {
            connection.client.close();
            console.log(`🔌 Conexão fechada: ${id}`);
        } catch (err) {
            console.error('Erro ao fechar conexão:', err);
        }
    }
});

// Inicializar limpeza periódica de conexões
ftpViewPool.startCleanupTimer();

module.exports = router;
