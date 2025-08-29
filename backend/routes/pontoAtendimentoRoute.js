const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');
const Utils = require('../utils');

router.get('/servicos/:idPontoAtendimento', validateToken, async (req, res) => {
  try {
    const { idPontoAtendimento } = req.params;
    if (!idPontoAtendimento) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idPontoAtendimento é obrigatório' 
      });
    }
    
    let result = await db.query(`
        SELECT 
            A.IdServico,
            B.IdServico AS value,
            B.Descricao + ' - ' + B.TipoVeiculo AS label, 
            B.Observacoes AS description
        FROM PontosAtendimentoServicos AS A 
        INNER JOIN Servicos AS B ON A.IdServico=B.IdServico
        WHERE A.IdPontoAtendimento=@idPontoAtendimento AND A.AtivoInativo='A';
    `, { idPontoAtendimento });

    let servicos = result.recordset;

    return res.status(200).json({
      servicos
    });
  } catch (error) {
    console.error('Erro ao obter servicos:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

module.exports = router;