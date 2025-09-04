const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

router.get('/get-all/:idPontoAtendimento', validateToken, async (req, res) => {
    try {
        const { idPontoAtendimento } = req.params;

        const result = await db.query(`
            SELECT 
                A.IdPontoAtendimento, 
                A.IdSocioVeiculoAgenda, 
                A.NumeroOS,
                B.Nota,
                B.Observacoes,
                B.DataLog,
                C.Ano AS AnoVeiculo,
                C.Placa AS PlacaVeiculo,
                D.Descricao AS MarcaVeiculo,
                E.Descricao AS ModeloVeiculo,
                SC.Nome AS Cliente
            FROM SociosVeiculosAgenda AS A
            INNER JOIN SociosVeiculosAgendaAvaliacao AS B 
                ON A.IdSocioVeiculoAgenda = B.IdSocioVeiculoAgenda
            INNER JOIN SociosVeiculos AS C
                ON A.IdSocioVeiculo = C.IdSocioVeiculo
            INNER JOIN Socios AS SC
                ON SC.IdSocio = C.IdSocio
            INNER JOIN Marcas AS D
                ON C.IdMarca = D.IdMarca
            INNER JOIN Veiculos AS E
                ON C.IdVeiculo = E.IdVeiculo
            WHERE A.IdPontoAtendimento = @idPontoAtendimento
            GROUP BY 
                A.IdPontoAtendimento, 
                A.IdSocioVeiculoAgenda,
                A.NumeroOS,
                B.Nota,
                B.Observacoes,
                B.DataLog,
                C.Placa,
                C.Ano,
                D.Descricao,
                E.Descricao,
                SC.Nome
            ORDER BY B.DataLog DESC;
        `, { idPontoAtendimento });

        let all = result.recordset;

        if (all.length > 0) {
            return res.status(200).json(all);
        } else {
            return res.status(200).json([]);
        }

    } catch {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
})

router.get('/get-average/:idPontoAtendimento', validateToken, async (req, res) => {
    try {
        const { idPontoAtendimento } = req.params;

        const result = await db.query(`
            SELECT 
                AVG(A.Nota) AS MediaNotas,
                COUNT(*) AS TotalAvaliacoes
            FROM SociosVeiculosAgendaAvaliacao AS A
            INNER JOIN SociosVeiculosAgenda AS B
                ON A.IdSocioVeiculoAgenda = B.IdSocioVeiculoAgenda
            WHERE B.IdPontoAtendimento = @idPontoAtendimento;
        `, { idPontoAtendimento });

        let average = result.recordset[0];

        if (average) {
            return res.status(200).json(average);
        } else {
            return res.status(200).json({ MediaNotas: 0, TotalAvaliacoes: 0 });
        }
        
    } catch {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
})
    
module.exports = router;