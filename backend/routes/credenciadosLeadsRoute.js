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

    // ✅ Inserção no banco
    const query = `
      INSERT INTO CredenciadosLeads (
        IdCredenciadoLead,
        NomeOficina,
        NomeCompleto,
        Email,
        whatsapp
      )
      VALUES (
        @idCredenciadoLead,
        @nomeOficina,
        @nomeCompleto,
        @email,
        @whatsapp
      )
    `;

    const params = { idCredenciadoLead, nomeOficina, nomeCompleto, email, whatsapp };
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
      '61981648316', // Lucas
      '61981010028', // Cintia
      '61991930897', // Marcos
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