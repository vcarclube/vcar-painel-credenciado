const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');
const db = require('../database');
const Utils = require('../utils');

router.get('/lista/:idPontoAtendimento', validateToken, async (req, res) => {
  try {
    const { idPontoAtendimento } = req.params;
    if (!idPontoAtendimento) {
      return res.status(400).json({ message: 'ID do ponto de atendimento é obrigatório' });
    }

    const result = await db.query(`
      SELECT 
        IdPontoAtendimentoUsuario,
        Nome,
        Email,
        Telefone,
        Senha,
        IdUsuario,
        DataLog,
        AtivoInativo,
        IdPontoAtendimento,
        IdUsuarioTipo
      FROM PontosAtendimentoUsuarios
      WHERE IdPontoAtendimento = @idPontoAtendimento AND AtivoInativo = 'A';
    `, { idPontoAtendimento });

    return res.status(200).json({ data: result.recordset || [] });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/tipos', validateToken, async (req, res) => {
  try {
      const result = await db.query(`
           SELECT
            A.IdUsuarioTipo,
            A.Descricao,
            A.Administrativo,
            A.Atendimento,
            A.IdUsuario,
            A.DataLog,
            A.AtivoInativo,
            B.Nome
            FROM UsuariosTipo AS A
            JOIN Usuarios     AS B
              ON A.IdUsuario = B.IdUsuario
            WHERE A.AtivoInativo = 'A'
            ORDER BY A.Descricao
      `);
      return res.status(200).json({ data: result.recordset || [] });
  } catch (error) {
      console.error('Erro ao listar tipos de usuários:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.post('/adicionar', validateToken, async (req, res) => {
  try {
    const { Nome, Email, Telefone, Senha, IdPontoAtendimento, IdUsuarioTipo } = req.body;
    if (!Nome || !Email || !IdPontoAtendimento || !IdUsuarioTipo) {
      return res.status(400).json({ success: false, message: 'Dados obrigatórios faltando' });
    }

    let idUsuario = 'BB12FEC6-7E33-409A-B897-466ADA9CAEFF';

    const exists = await db.query(`
      SELECT TOP 1 IdPontoAtendimentoUsuario FROM PontosAtendimentoUsuarios WHERE Email = @Email AND AtivoInativo = 'A'
    `, { Email });
    if (exists.recordset && exists.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    const senhaGerada = Math.floor(100000 + Math.random() * 900000).toString();

    const insert = await db.query(`
      INSERT INTO PontosAtendimentoUsuarios (Nome, Email, Telefone, Senha, IdPontoAtendimento, IdUsuarioTipo, AtivoInativo, DataLog, IdUsuario)
      VALUES (@Nome, @Email, @Telefone, @SenhaGerada, @IdPontoAtendimento, @IdUsuarioTipo, 'A', GETDATE(), @IdUsuario);
      SELECT SCOPE_IDENTITY() AS IdPontoAtendimentoUsuario;
    `, { Nome, Email, Telefone, SenhaGerada: senhaGerada, IdPontoAtendimento, IdUsuarioTipo, idUsuario });

    const newId = insert.recordset && insert.recordset[0] ? insert.recordset[0].IdPontoAtendimentoUsuario : null;

    if (Telefone && Telefone.trim() !== '') {
      const encodedEmail = encodeURIComponent(Email);
      const encodedSenha = encodeURIComponent(senhaGerada);
      const directUrl = `https://painel.vcarclube.com.br/login?email=${encodedEmail}&senha=${encodedSenha}`;
      const message = `👋 Seja muito bem-vindo, ${Nome}! 🤩

Seu acesso ao painel da VCar já está disponível! 🚗💻

🔐 Email: ${Email}
🔑 Senha: ${senhaGerada}

Se precisar de ajuda, estamos por aqui! 😉

Link do painel: ${directUrl}

Atenciosamente,
Equipe VCar 💚`;
      try {
        await Utils.notificarWhatsapp({ phone: Telefone, message });
      } catch (notifyErr) {
        console.error('Erro ao enviar WhatsApp de acesso:', notifyErr);
      }
    }

    return res.status(200).json({ success: true, id: newId });
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/atualizar', validateToken, async (req, res) => {
  try {
    const { IdPontoAtendimentoUsuario, Nome, Email, Telefone, IdPontoAtendimento, IdUsuarioTipo } = req.body;
    if (!IdPontoAtendimentoUsuario) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    await db.query(`
      UPDATE PontosAtendimentoUsuarios
      SET Nome = @Nome,
          Email = @Email,
          Telefone = @Telefone,
          IdPontoAtendimento = @IdPontoAtendimento,
          IdUsuarioTipo = @IdUsuarioTipo,
          DataLog = GETDATE()
      WHERE IdPontoAtendimentoUsuario = @IdPontoAtendimentoUsuario;
    `, { IdPontoAtendimentoUsuario, Nome, Email, Telefone, IdPontoAtendimento, IdUsuarioTipo });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/deletar', validateToken, async (req, res) => {
  try {
    const { IdPontoAtendimentoUsuario } = req.body;
    if (!IdPontoAtendimentoUsuario) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    await db.query(`
      UPDATE PontosAtendimentoUsuarios
      SET AtivoInativo = 'I', DataLog = GETDATE()
      WHERE IdPontoAtendimentoUsuario = @IdPontoAtendimentoUsuario;
    `, { IdPontoAtendimentoUsuario });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;