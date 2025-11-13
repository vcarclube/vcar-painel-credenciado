const express = require('express');
const router = express.Router();

const db = require('../database');
const Utils = require('../utils');

router.post('/', async (req, res) => {
  try {
    const { nomeOficina, nomeCompleto, email, whatsapp } = req.body;

    // ✅ Validação de campos obrigatórios
    if (!nomeOficina || !nomeCompleto || !whatsapp) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const idCredenciadoLead = Utils.generateUUID();

    const agora = new Date();

    const dataFormatada = agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24h
    });

    // ✅ Inserção no banco
    const query = `
      INSERT INTO CredenciadosLeads (
        IdCredenciadoLead,
        NomeOficina,
        NomeCompleto,
        Email,
        Whatsapp,
        AtivoInativo,
        DataCadastro
      )
      VALUES (
        @idCredenciadoLead,
        @nomeOficina,
        @nomeCompleto,
        @email,
        @whatsapp,
        'A',
        @dataFormatada
      )
    `;

    const params = { idCredenciadoLead, nomeOficina, nomeCompleto, email, whatsapp, dataFormatada };
    await db.query(query, params);

    // ✅ Montagem da mensagem
    const message = `
⭐ Novo lead cadastrado na base VCarClube

*Nome*: ${nomeCompleto}
*Oficina*: ${nomeOficina}
*Email*: ${email || 'Não informado'}
*whatsapp*: ${whatsapp}
    `.trim();

    // ✅ Lista de destinatários
    const destinatarios = [
      '61981644455', // Andréia
      '61981684455', // Ailton
      '61981010028', // Cintia
      '61991930897', // Marcos
      '61984400040', // Lucas
    ];

    // ✅ Notificação em paralelo
    await Promise.all(
      destinatarios.map(phone => Utils.notificarWhatsapp({ phone, message }))
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erro ao cadastrar lead:', error);
    return res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
  }
});
    
module.exports = router;