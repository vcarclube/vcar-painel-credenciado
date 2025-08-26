const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const router = express.Router();

const { validateOrigin } = require('../middlewares/CorsMiddleware');
const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

const Utils = {
    validateEmail: (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
};

// Rota para validar o token
router.get('/auth', validateToken, async (req, res) => {
    try {
        return res.status(200).json({ message: "Token válido", data: req.user.id });
    } catch (err) {
        return res.status(401).json({ message: "Erro ao recuperar o token", data: null });
    }
});

// Rota para obter dados do usuário
router.get('/get', validateToken, async (req, res) => {
    try {
        const id = req.user.id;
        
        // Consulta SQL para buscar o usuário pelo ID
        const result = await db.query(`
            SELECT 
                A.IdPontoAtendimentoUsuario,
                A.Nome,
                A.Email,
                A.Telefone,
                A.AtivoInativo,
                B.IdUsuarioTipo,
                B.Descricao AS Cargo,
                B.Administrativo,
                B.Atendimento,
                C.IdPontoAtendimento,
                C.Cnpj,
                C.EnderecoCep,
                C.Endereco,
                C.EnderecoCidade,
                C.EnderecoUf,
                C.EnderecoComplemento,
                C.EnderecoBairro,
                C.Latitude,
                C.Longitude,
                C.SegSexInicio,
                C.SegSexFim,
                C.SabadoInicio,
                C.SabadoFim,
                C.DomingoInicio,
                C.DomingoFim,
                C.FeriadoInicio,
                C.FeriadoFim,
                C.Descricao,
                C.RazaoSocial,
                C.QtdeElevadores,
                C.InscricaoEstadual,
                C.NumeroMatricula,
                D.Logotipo,
                D.FotosEstabelecimento
            FROM PontosAtendimentoUsuarios AS A
            INNER JOIN UsuariosTipo AS B ON A.IdUsuarioTipo=B.IdUsuarioTipo
            INNER JOIN PontosAtendimento AS C ON A.IdPontoAtendimento=C.IdPontoAtendimento
            INNER JOIN CredenciadosPreCadastros AS D ON C.IdPontoAtendimento=D.IdSocioPreCadastro
            WHERE IdPontoAtendimentoUsuario=@userId;
        `, { userId: id });
        
        const user = result.recordset[0];
        
        if (!user || user === null) {
            return res.status(404).json({ message: "Usuário não encontrado.", data: null });
        }
        
        return res.status(200).json({
            message: "Usuário recuperado com sucesso!", 
            data: user
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(400).json({ message: error.message, data: null });
    }
});

router.post('/login', validateOrigin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação do email
        if (!Utils.validateEmail(email)) {
            return res.status(401).json({ message: "Email inválido" });
        }

        // Consulta SQL para buscar o usuário pelo email
        const result = await db.query(`
            SELECT IdPontoAtendimentoUsuario, Email, Senha, AtivoInativo FROM PontosAtendimentoUsuarios WHERE Email = @email;
        `, { email });
        
        const user = result.recordset[0];

        // Verifica se o usuário existe
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // Verifica se o usuário está ativo
        if (user.AtivoInativo == "I") {
            return res.status(401).json({ message: "Usuário inativo. Entre em contato com o administrador." });
        }

        // Verifica a senha
        if(password != user.Senha) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: user.IdPontoAtendimentoUsuario, email: user.Email }, 
            process.env.JWT_SECRET,
        );

        return res.status(200).json({ 
            message: "Login realizado com sucesso.", 
            token,
            user: {
                id: user.IdPontoAtendimentoUsuario,
                name: user.Nome,
                email: user.Email
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

module.exports = router;