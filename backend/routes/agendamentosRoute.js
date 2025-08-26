const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');

// Função auxiliar para construir filtros dinamicamente
const buildWhereClause = (filters) => {
  const conditions = [];
  const params = {};

  // Condições básicas sempre aplicadas
  conditions.push("A.StatusAgendamento IS NOT NULL");
  conditions.push("(PontosAtendimentoUsuarios.IdPontoAtendimentoUsuario IS NOT NULL OR UserAuth.IdUsuario IS NOT NULL)");

  // Filtros dinâmicos
  if (filters.tipoPontoAtendimento && filters.tipoPontoAtendimento !== "0") {
    conditions.push("J1.RedePropria = @tipoPontoAtendimento");
    params.tipoPontoAtendimento = filters.tipoPontoAtendimento;
  }

  if (filters.status && filters.status !== "0") {
    if (filters.status === "E") {
      conditions.push("G.IdSocioVeiculoAgenda IS NOT NULL AND A.StatusAgendamento = 'A'");
    } else {
      conditions.push("A.StatusAgendamento = @status");
      params.status = filters.status;
    }
  } else {
    conditions.push("A.StatusAgendamento <> 'E'");
  }

  if (filters.idPontoAtendimento) {
    conditions.push("A.IdPontoAtendimento = @idPontoAtendimento");
    params.idPontoAtendimento = filters.idPontoAtendimento;
  }

  if (filters.placa && filters.placa !== "0") {
    conditions.push("B.Placa = @placa");
    params.placa = filters.placa;
  }

  if (filters.idSocio) {
    conditions.push("C.IdSocio = @idSocio");
    params.idSocio = filters.idSocio;
  }

  if (filters.dataInicio) {
    conditions.push("CAST(A.DataAgendamento AS DATE) >= @dataInicio");
    params.dataInicio = filters.dataInicio;
  }

  if (filters.dataFim) {
    conditions.push("CAST(A.DataAgendamento AS DATE) <= @dataFim");
    params.dataFim = filters.dataFim;
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};

router.get('/lista/:idPontoAtendimento', validateToken, async (req, res) => {
  try {
    // Validações de entrada
    const { idPontoAtendimento } = req.params;
    const { 
      tipoPontoAtendimento, 
      status, 
      placa, 
      idSocio, 
      dataInicio, 
      dataFim 
    } = req.query;

    if (!idPontoAtendimento) {
      return res.status(400).json({ 
        message: 'ID do ponto de atendimento é obrigatório' 
      });
    }

    // Verificar se o usuário tem acesso
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'Usuário não autenticado' 
      });
    }

    // Construir filtros
    const filters = {
      tipoPontoAtendimento,
      status,
      idPontoAtendimento,
      placa,
      idSocio,
      dataInicio,
      dataFim
    };

    const { whereClause, params } = buildWhereClause(filters);

    // Query SQL limpa e parametrizada
    const query = `
      SELECT
        A.IdSocioVeiculoAgenda,
        A.IdSocioVeiculo,
        A.IdServico,
        A.NumeroOS,
        A.IdPontoAtendimento,
        FORMAT(A.DataAgendamento,'dd/MM/yyyy') AS DataAgendamento,
        LEFT(CONVERT(VARCHAR, A.HoraAgendamento), 5) AS HoraAgendamento,
        UPPER(B.Placa) AS Placa,
        B.Litragem,
        B.Ano,
        B.TipoVeiculo,
        VMT.Descricao AS MotorTipoDescricao,
        C.Nome,
        C.Telefone,
        C.IdSocio,
        C.Cpf,
        D.Descricao AS Motivacao, 
        D.Observacoes,
        E.Descricao AS Veiculo,
        F.Descricao AS Marca,
        A.StatusAgendamento,
        G.IdSocioVeiculoAgendaExecucao,
        FORMAT(G.DataHoraInicio,'dd/MM/yyyy HH:mm') AS DataHoraInicio,
        FORMAT(G.DataHoraFim,'dd/MM/yyyy HH:mm') AS DataHoraFim,
        ISNULL(H.Nome, H1.Nome) AS NomeInicio,
        ISNULL(I.Nome, I1.Nome) AS NomeFim,
        D.ValorServico,
        D.ValorRepasse,
        J1.Descricao AS DescricaoPontoAtendimento,
        (
          SELECT COUNT(*) 
          FROM SociosVeiculosAgendaExecucaoServicos AS X 
          WHERE X.StatusAprovacao = 'P' 
            AND X.IdSocioVeiculoAgenda = A.IdSocioVeiculoAgenda
        ) AS QtdePendencias
      FROM SociosVeiculosAgenda AS A
        INNER JOIN SociosVeiculos AS B
          ON A.IdSocioVeiculo = B.IdSocioVeiculo
        INNER JOIN Socios AS C
          ON B.IdSocio = C.IdSocio
        INNER JOIN Servicos AS D
          ON A.IdServico = D.IdServico
        INNER JOIN Veiculos AS E
          ON B.IdVeiculo = E.IdVeiculo
        INNER JOIN Marcas AS F
          ON E.IdMarca = F.IdMarca
        INNER JOIN PontosAtendimento AS J1
          ON A.IdPontoAtendimento = J1.IdPontoAtendimento
        LEFT JOIN VeiculosMotorTipo AS VMT
          ON B.IdVeiculoMotorTipo = VMT.IdVeiculoMotorTipo
        LEFT JOIN SociosVeiculosAgendaExecucao AS G
          ON A.IdSocioVeiculoAgenda = G.IdSocioVeiculoAgenda
        LEFT JOIN Usuarios AS H
          ON G.IdUsuarioInicio = H.IdUsuario
        LEFT JOIN Usuarios AS I
          ON G.IdUsuarioFim = I.IdUsuario
        LEFT JOIN PontosAtendimentoUsuarios AS H1
          ON G.IdUsuarioInicio = H1.IdPontoAtendimentoUsuario
        LEFT JOIN PontosAtendimentoUsuarios AS I1
          ON G.IdUsuarioFim = I1.IdPontoAtendimentoUsuario
        LEFT JOIN PontosAtendimentoUsuarios
          ON A.IdPontoAtendimento = PontosAtendimentoUsuarios.IdPontoAtendimento
          AND PontosAtendimentoUsuarios.IdPontoAtendimentoUsuario = @codigoUsuario
        LEFT JOIN Usuarios AS UserAuth
          ON UserAuth.IdUsuario = @codigoUsuario
          AND UserAuth.AtivoInativo = 'A'
      ${whereClause}
      ORDER BY A.StatusAgendamento, A.DataAgendamento, A.HoraAgendamento;
    `;

    // Adicionar parâmetro do usuário
    params.codigoUsuario = req.user.id;

    // Executar query
    const result = await db.query(query, params);

    // Verificar se há resultados
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(200).json({
        message: 'Nenhum agendamento encontrado',
        data: [],
        total: 0
      });
    }

    // Retornar todos os resultados
    return res.status(200).json({
      message: 'Agendamentos encontrados com sucesso',
      data: result.recordset,
      total: result.recordset.length
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    
    // Retornar erro mais específico em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message,
        stack: error.stack
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;