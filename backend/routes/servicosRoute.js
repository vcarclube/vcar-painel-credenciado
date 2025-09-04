const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

router.post('/verificar-limite-anual', validateToken, async (req, res) => {
    try {
        console.log(req.body);

        const { idSocioVeiculo } = req.body;

        // Buscar sócio veículo
        const socioVeiculoResult = await db.query(`
            SELECT * FROM SociosVeiculos WHERE IdSocioVeiculo = @idSocioVeiculo
        `, { idSocioVeiculo });

        const socioVeiculo = socioVeiculoResult.recordset[0];
        if (!socioVeiculo) {
            return res.json({
                podeUsar: false,
                mensagem: "Veículo não encontrado.",
                servicos: []
            });
        }

        const tipoVeiculo = socioVeiculo.TipoVeiculo?.trim().toUpperCase();
        const anoAtual = new Date().getFullYear();

        // Buscar serviços ativos
        const servicosDisponiveisResult = await db.query(`
            SELECT 
                IdServico,
                IdUsuario,
                Descricao,
                CONVERT(VARCHAR(8), TempoMedio, 108) AS TempoMedio, 
                Observacoes,
                CAST(ValorServico AS VARCHAR(20)) AS ValorServico, 
                LimiteAnual,
                FornecidoPelaVcar,
                Garantia,
                CAST(ValorAdicional AS VARCHAR(20)) AS ValorAdicional, 
                CAST(ValorRepasse AS VARCHAR(20)) AS ValorRepasse,    
                CONVERT(VARCHAR(19), DataLog, 120) AS DataLog,   
                AtivoInativo,
                Visivel,
                TipoVeiculo,
                Tipo
            FROM dbo.Servicos 
            WHERE AtivoInativo = 'A'
        `);

        const servicosDisponiveis = servicosDisponiveisResult.recordset;

        const agendamentosResult = await db.query(`
            SELECT 
                A.IdServico,
                B.DataAgendamento,
                B.StatusAgendamento,
                A.StatusAprovacao
            FROM SociosVeiculosAgendaExecucaoServicos AS A
            INNER JOIN SociosVeiculosAgenda AS B ON A.IdSocioVeiculoAgenda = B.IdSocioVeiculoAgenda
            WHERE A.StatusAprovacao = 'A'
              AND (B.StatusAgendamento = 'A' OR B.StatusAgendamento = 'C')
              AND B.IdSocioVeiculo = @idSocioVeiculo
              AND YEAR(B.DataAgendamento) = @anoAtual
        `, { idSocioVeiculo, anoAtual });

        const agendamentos = agendamentosResult.recordset;

        // Contar usos por serviço
        const usosPorServico = {};
        for (const agendamento of agendamentos) {
            const servicoId = agendamento.IdServico;
            if (!servicoId) continue;

            usosPorServico[servicoId] = (usosPorServico[servicoId] || 0) + 1;
        }

        // Montar lista de serviços
        const listaServicos = servicosDisponiveis.map(s => {
            const usadas = usosPorServico[s.IdServico] || 0;
            const limite = s.LimiteAnual;
            const podeUsar = limite > 0 && usadas < limite;
            const restante = Math.max(0, limite - usadas);

            return {
                idServico: s.IdServico,
                nomeServico: s.Descricao,
                fornecidoPelaVcar: s.FornecidoPelaVcar || "N",
                tipoVeiculo: s.TipoVeiculo,
                tipo: s.Tipo,
                quantidadeUsada: usadas,
                limiteAnual: limite,
                restante,
                podeUsar
            };
        });

        const algumServicoDisponivel = listaServicos.some(s => s.podeUsar);

        return res.json({
            algumServicoDisponivelParaUso: algumServicoDisponivel,
            mensagem: algumServicoDisponivel
                ? "Serviços disponíveis encontrados."
                : "Nenhum serviço disponível, todos atingiram o limite anual.",
            anoReferencia: anoAtual,
            tipoVeiculo,
            totalAgendamentos: agendamentos.length,
            servicos: listaServicos
        });

    } catch (error) {
        console.error('Erro ao verificar limite anual:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

router.post('/verificar-garantia', validateToken, async (req, res) => {
    try {
        const { idSocioVeiculo, idServico } = req.body;

        const sql = `
            SELECT TOP 1
                A.IdPontoAtendimento,
                A.DataAgendamento,
                C.Descricao,
                C.IdServico,
                C.Garantia,
                D.IdSocioVeiculo
            FROM 
                SociosVeiculosAgenda AS A
                INNER JOIN SociosVeiculosAgendaExecucaoServicos AS B ON A.IdSocioVeiculoAgenda = B.IdSocioVeiculoAgenda
                INNER JOIN Servicos AS C ON B.IdServico = C.IdServico
                INNER JOIN SociosVeiculos AS D ON A.IdSocioVeiculo = D.IdSocioVeiculo
            WHERE 
                B.StatusAprovacao = 'A'
                AND A.StatusAgendamento = 'C'
                AND D.IdSocioVeiculo = @idSocioVeiculo
                AND C.IdServico = @idServico
            ORDER BY A.DataAgendamento DESC;
        `;

        const result = await db.query(sql, {
            idSocioVeiculo,
            idServico
        });

        const row = result.recordset[0];

        if (!row) {
            return res.json({ garantiaValida: false });
        }

        const dataAgendamento = new Date(row.DataAgendamento);
        const garantia = row.Garantia;

        if(garantia <= 0){
            return res.json({ garantiaValida: false });
        }

        const dataLimiteGarantia = new Date(dataAgendamento);
        dataLimiteGarantia.setDate(dataAgendamento.getDate() + garantia);

        const dataAtual = new Date();

        const garantiaValida = dataAtual <= dataLimiteGarantia;

        return res.json({ garantiaValida, garantia, dataLimiteGarantia });
    } catch (error) {
        console.error('Erro ao verificar garantia:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

module.exports = router;