const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');
const Utils = require('../utils');

router.get('/get-agendamento-pontoatendimento-by-placa/:idPontoAtendimento/:placa', validateToken, async (req, res) => {
    try {
        const { idPontoAtendimento, placa } = req.params;

        const result = await db.query(`
            SELECT 
                S.Nome AS NomeSocio,
                SVA.IdSocioVeiculoAgenda,
                SVA.IdSocioVeiculo,
                SVA.IdPontoAtendimento,
                SVA.DataAgendamento,
                SVA.HoraAgendamento,
                SVA.StatusAgendamento,
                SVA.NumeroOS,
                SV.Ano AS AnoVeiculo,
                SV.Placa AS PlacaVeiculo,
                SV.Litragem AS LitragemVeiculo,
                M.Descricao AS MarcaVeiculo,
                V.Descricao AS ModeloVeiculo,
                SVAE.DataHoraInicio AS InicioExecucaoOS
            FROM Socios AS S
            INNER JOIN SociosVeiculos SV
                ON SV.IdSocio = S.IdSocio
            LEFT JOIN SociosVeiculosAgenda AS SVA
                ON SVA.IdSocioVeiculo = SV.IdSocioVeiculo 
                AND SVA.StatusAgendamento = 'A'
                AND SVA.IdPontoAtendimento = @idPontoAtendimento
            LEFT JOIN SociosVeiculosAgendaExecucao AS SVAE
                ON SVA.IdSocioVeiculoAgenda = SVAE.IdSocioVeiculoAgenda
            INNER JOIN Marcas AS M
                ON SV.IdMarca = M.IdMarca
            INNER JOIN Veiculos AS V
                ON SV.IdVeiculo = V.IdVeiculo
            WHERE 
                REPLACE(SV.Placa, '-', '') = REPLACE(@placa, '-', '')  
                AND SV.Status='A'
            ORDER BY SVA.DataAgendamento DESC;
        `, { idPontoAtendimento, placa });

        let all = result.recordset;

        if (all.length > 0) {
            return res.status(200).json(all[0]);
        } else {
            return res.status(200).json(false);
        }
    } catch (error) {  // Corrigido: adicionada a variável 'error'
        console.error('Erro no login:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

router.post("/enviar-convite", validateToken, async (req, res) => {
    try {
        const { telefone, placa } = req.body;

        await Utils.notificarWhatsapp({
      phone: telefone,
      message: `
🚗💚 Proteja seu carro '${placa}' com quem entende de cuidado!

Venha fazer parte da VCarClube, o plano de saúde veicular feito pra quem ama o seu carro! 🛠️🔧
Com benefícios exclusivos, assistência 24h e muito mais!

Seja um sócio agora mesmo 👉 https://socio.vcarclube.com.br/

💚 Seu carro merece esse cuidado!
      `
    });

    return res.status(200).json({ message: "Convite enviado com sucesso!" });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
})
    
module.exports = router;