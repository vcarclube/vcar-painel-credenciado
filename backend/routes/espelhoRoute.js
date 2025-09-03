const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

router.post('/lista', validateToken, async (req, res) => {
    try {
        const { idPontoAtendimento, idSocio, dataInicio, dataFim, pagamentoFeito } = req.body;

        let sql = `
            SELECT
                FE.IdFinanceiroEspelho,
                FE.IdSocioVeiculoAgenda,
                FE.IdSocioVeiculo,
                FE.IdPontoAtendimento,
                FE.IdSocioVeiculoAgendaExecucaoServico,
                FE.RazaoSocial,
                FE.Cnpj,
                FE.Matricula,
                FE.DataAgendamento,
                FE.DataPagamento,
                FE.ValorRepasse,
                FE.PagamentoFeito,
                FE.Placa,
                FE.SocioNome,
                FE.NomeServico,
                FE.StatusAgendamento,
                FE.NumeroOS,
                FE.VeiculoPlaca,
                FE.DataExecucaoOS,
                FE.CodigoEspelho,
                FE.TipoEspelho,
                FE.TipoComissao,
                FE.Descricao,
                FE.IdDadoBancario,
                FE.ComprovantePagamento
            FROM FinanceiroEspelho FE
            INNER JOIN PontosAtendimento PA 
                ON FE.IdPontoAtendimento = PA.IdPontoAtendimento
            WHERE PA.RedePropria = 'N'
        `;

        const params = {};

        if (idPontoAtendimento) {
            sql += " AND FE.IdPontoAtendimento = @idPontoAtendimento";
            params.idPontoAtendimento = idPontoAtendimento;
        }

        if (idSocio) {
            sql += ` AND FE.IdSocioVeiculo IN (
                SELECT IdSocioVeiculo 
                FROM SociosVeiculos 
                WHERE IdSocio = @idSocio
            )`;
            params.idSocio = idSocio;
        }

        if (dataInicio && dataFim) {
            sql += `
                AND CAST(SUBSTRING(FE.DataAgendamento, 7, 4) + '-' +
                         SUBSTRING(FE.DataAgendamento, 4, 2) + '-' +
                         SUBSTRING(FE.DataAgendamento, 1, 2) AS DATE)
                BETWEEN @dataInicio AND @dataFim
            `;
            params.dataInicio = dataInicio;
            params.dataFim = dataFim;
        }

        if (pagamentoFeito) {
            sql += " AND FE.PagamentoFeito = @pagamentoFeito";
            params.pagamentoFeito = pagamentoFeito;
        }

        sql += " ORDER BY FE.RazaoSocial, FE.DataAgendamento, FE.Placa;";

        const result = await db.query(sql, params);

        return res.status(200).json(result.recordset.filter(item => {
            return item.IdPontoAtendimento == idPontoAtendimento;
        }));
    } catch (error) {
        console.error('Erro ao buscar financeiro:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});
    
module.exports = router;