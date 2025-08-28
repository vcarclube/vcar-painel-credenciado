const express = require("express")
const router = express.Router();
const multer = require("multer")
const fs = require("fs")
const ftp = require("basic-ftp")

const upload = multer({ dest: "uploads/" });

const Utils = require('../utils');

const { validateToken } = require("../middlewares/AuthMiddleware");

router.post("/upload", validateToken, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" })
        }

        const localPath = req.file.path
        const remotePath = Utils.generateUUID() + req.file.originalname

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
    const { filename } = req.params
    const client = new ftp.Client()
    client.ftp.verbose = false

    try {
        await client.access({
            host: "216.158.231.74",
            user: "vcarclub",
            password: "7U@gSNCc",
            secure: false
        })

        await client.cd("/uploads")

        // Cria um stream do FTP para resposta HTTP
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`)
        res.setHeader("Content-Type", "application/octet-stream")

        await client.downloadTo(res, filename) // manda direto pro cliente

    } catch (err) {
        console.error("Erro ao buscar arquivo:", err)
        res.status(404).json({ error: "Arquivo não encontrado" })
    } finally {
        client.close()
    }
})

module.exports = router;