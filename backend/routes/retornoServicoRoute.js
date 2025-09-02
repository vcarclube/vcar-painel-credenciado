const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');

const db = require('../database');
const Utils = require('../utils');

// Listar todos os retornos de serviço
router.get('/lista/:idPontoAtendimento', validateToken, async (req, res) => {
  try {
    const { idPontoAtendimento } = req.params;
    
    if (!idPontoAtendimento) {
      return res.status(400).json({ 
        message: 'ID do ponto de atendimento é obrigatório' 
      });
    }

    const query = `
      SELECT 
        rs.IdRetornoServico, 
        rs.Tipo, 
        rs.Descricao, 
        rs.Videos, 
        rs.Fotos, 
        rs.IdSocioVeiculoAgenda, 
        rs.IdSocioVeiculo, 
        rs.IdServico, 
        rs.IdFinanceiroEspelho, 
        rs.Status, 
        rs.MotivoStatus, 
        rs.DataLog, 
        sv.Placa as PlacaVeiculo, 
        MO.Descricao as NomeServico, 
        fe.SocioNome as NomeSocio, 
        sva.NumeroOS, 
        sva.DataAgendamento 
      FROM RetornosServicos rs 
      INNER JOIN SociosVeiculosAgenda sva ON rs.IdSocioVeiculoAgenda = sva.IdSocioVeiculoAgenda 
      INNER JOIN SociosVeiculos sv ON rs.IdSocioVeiculo = sv.IdSocioVeiculo 
      INNER JOIN Motivacoes AS MO ON sva.IdMotivacao=MO.IdMotivacao
      LEFT JOIN Servicos s ON rs.IdServico = s.IdServico 
      LEFT JOIN FinanceiroEspelho fe ON rs.IdFinanceiroEspelho = fe.IdFinanceiroEspelho 
      WHERE sva.IdPontoAtendimento = @idPontoAtendimento
      ORDER BY rs.DataLog DESC
    `;

    const result = await db.query(query, {
      idPontoAtendimento
    });

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Erro ao listar retornos de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Buscar retorno específico
router.get('/:idRetornoServico', validateToken, async (req, res) => {
  try {
    const { idRetornoServico } = req.params;
    
    if (!idRetornoServico) {
      return res.status(400).json({ 
        message: 'ID do retorno de serviço é obrigatório' 
      });
    }

    const query = `
      SELECT 
        rs.IdRetornoServico, 
        rs.Tipo, 
        rs.Descricao, 
        rs.Videos, 
        rs.Fotos, 
        rs.IdSocioVeiculoAgenda, 
        rs.IdSocioVeiculo, 
        rs.IdServico, 
        rs.IdFinanceiroEspelho, 
        rs.Status, 
        rs.MotivoStatus, 
        rs.DataLog, 
        sv.Placa as PlacaVeiculo, 
        s.Descricao as NomeServico, 
        fe.SocioNome as NomeSocio, 
        sva.NumeroOS, 
        sva.DataAgendamento, 
        sva.ValorServico 
      FROM RetornosServicos rs 
      INNER JOIN SociosVeiculosAgenda sva ON rs.IdSocioVeiculoAgenda = sva.IdSocioVeiculoAgenda 
      INNER JOIN SociosVeiculos sv ON rs.IdSocioVeiculo = sv.IdSocioVeiculo 
      INNER JOIN Servicos s ON rs.IdServico = s.IdServico 
      LEFT JOIN FinanceiroEspelho fe ON rs.IdFinanceiroEspelho = fe.IdFinanceiroEspelho 
      WHERE rs.IdRetornoServico = @idRetornoServico
    `;

    const result = await db.query(query, {
      idRetornoServico
    });

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Retorno de serviço não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Erro ao buscar retorno de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Adicionar novo retorno de serviço
router.post('/adicionar', validateToken, async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ 
        message: 'Dados do retorno são obrigatórios' 
      });
    }

    const {
      Tipo,
      Descricao,
      Videos,
      Fotos,
      IdSocioVeiculoAgenda,
      Status,
      MotivoStatus
    } = data;

    // Gerar novo ID
    const IdRetornoServico = Utils.generateUUID();
    const DataLog = new Date();

    const { IdSocioVeiculo } = await Utils.getSocioVeiculoByIdSocioVeiculoAgenda(IdSocioVeiculoAgenda);
    const { IdMotivacao } = await Utils.getMotivacaoIdSocioVeiculoAgenda(IdSocioVeiculoAgenda);
    const { IdFinanceiroEspelho } = await Utils.getFinanceiroEspelhoIdSocioVeiculoAgenda(IdSocioVeiculoAgenda);

    console.log(IdMotivacao);

    if (!IdSocioVeiculo) {
      return res.status(400).json({ 
        message: 'Sócio veículo não encontrado' 
      });
    }

    if(!IdMotivacao) {
      return res.status(400).json({ 
        message: 'Motivação não encontrada' 
      });
    }

    const query = `
      INSERT INTO RetornosServicos 
      (IdRetornoServico, Tipo, Descricao, Videos, Fotos, IdSocioVeiculoAgenda, 
       IdSocioVeiculo, IdServico, IdFinanceiroEspelho, Status, MotivoStatus, DataLog) 
      VALUES 
      (@IdRetornoServico, @Tipo, @Descricao, @Videos, @Fotos, @IdSocioVeiculoAgenda, 
       @IdSocioVeiculo, @IdMotivacao, @IdFinanceiroEspelho, @Status, @MotivoStatus, @DataLog)
    `;

    await db.query(query, {
      IdRetornoServico,
      Tipo,
      Descricao: Descricao || null,
      Videos: Videos || null,
      Fotos: Fotos || null,
      IdSocioVeiculoAgenda,
      IdSocioVeiculo,
      IdMotivacao,
      IdFinanceiroEspelho: IdFinanceiroEspelho || null,
      Status: Status || 'ABERTO',
      MotivoStatus: MotivoStatus || null,
      DataLog
    });

    res.json({
      success: true,
      message: 'Retorno de serviço criado com sucesso',
      data: { IdRetornoServico }
    });

  } catch (error) {
    console.error('Erro ao criar retorno de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Atualizar retorno de serviço
router.post('/atualizar', validateToken, async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.IdRetornoServico) {
      return res.status(400).json({ 
        message: 'ID do retorno e dados são obrigatórios' 
      });
    }

    const {
      IdRetornoServico,
      Tipo,
      Descricao,
      Videos,
      Fotos,
      Status,
      MotivoStatus
    } = data;

    // Verificar se o registro existe
    const checkQuery = 'SELECT COUNT(1) as count FROM RetornosServicos WHERE IdRetornoServico = @IdRetornoServico';
    const checkResult = await db.query(checkQuery, { IdRetornoServico });
    
    if (checkResult.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Retorno de serviço não encontrado'
      });
    }

    const query = `
      UPDATE RetornosServicos SET 
        Tipo = @Tipo,
        Descricao = @Descricao,
        Videos = @Videos,
        Fotos = @Fotos,
        Status = @Status,
        MotivoStatus = @MotivoStatus
      WHERE IdRetornoServico = @IdRetornoServico
    `;

    await db.query(query, {
      IdRetornoServico,
      Tipo,
      Descricao: Descricao || null,
      Videos: Videos || null,
      Fotos: Fotos || null,
      Status,
      MotivoStatus: MotivoStatus || null
    });

    res.json({
      success: true,
      message: 'Retorno de serviço atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar retorno de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Atualizar apenas arquivos (fotos e vídeos)
router.post('/atualizar-arquivos', validateToken, async (req, res) => {
  try {
    const { IdRetornoServico, fotos, videos } = req.body;
    
    if (!IdRetornoServico) {
      return res.status(400).json({ 
        message: 'ID do retorno é obrigatório' 
      });
    }

    const query = `
      UPDATE RetornosServicos SET 
        Fotos = @fotos,
        Videos = @videos
      WHERE IdRetornoServico = @IdRetornoServico
    `;

    await db.query(query, {
      IdRetornoServico,
      fotos: fotos || null,
      videos: videos || null
    });

    res.json({
      success: true,
      message: 'Arquivos atualizados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar arquivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Deletar retorno de serviço
router.post('/deletar', validateToken, async (req, res) => {
  try {
    const { idRetornoServico } = req.body;
    
    if (!idRetornoServico) {
      return res.status(400).json({ 
        message: 'ID do retorno é obrigatório' 
      });
    }

    // Verificar se o registro existe
    const checkQuery = 'SELECT COUNT(1) as count FROM RetornosServicos WHERE IdRetornoServico = @idRetornoServico';
    const checkResult = await db.query(checkQuery, { idRetornoServico });
    
    if (checkResult.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Retorno de serviço não encontrado'
      });
    }

    const query = 'DELETE FROM RetornosServicos WHERE IdRetornoServico = @idRetornoServico';
    
    await db.query(query, { idRetornoServico });

    res.json({
      success: true,
      message: 'Retorno de serviço excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir retorno de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Listar agendamentos disponíveis

router.get('/agendamentos-disponiveis/:idPontoAtendimento', validateToken, async (req, res) => {
  try {
    const { idPontoAtendimento } = req.params;

    let query = `
        SELECT 
            IdSocioVeiculoAgenda,
            IdSocioVeiculo,
            IdMotivacao,
            NumeroOS,
            DataAgendamento,
            ValorServico,
            Placa,
            NomeServico,
            SocioNome,
            ValorRepasse,
            IdFinanceiroEspelho
        FROM (
            SELECT 
                sva.IdSocioVeiculoAgenda,
                sva.IdSocioVeiculo,
                MO.IdMotivacao,
                sva.NumeroOS,
                sva.DataAgendamento,
                sva.ValorServico,
                sv.Placa,
                CAST(MO.Descricao AS NVARCHAR(MAX)) as NomeServico,
                CAST(ss.Nome AS NVARCHAR(MAX)) as SocioNome,
                fe.ValorRepasse,
                fe.IdFinanceiroEspelho,
                ROW_NUMBER() OVER (PARTITION BY sva.IdSocioVeiculoAgenda ORDER BY fe.IdFinanceiroEspelho) as rn
            FROM SociosVeiculosAgenda sva
            INNER JOIN SociosVeiculos sv ON sva.IdSocioVeiculo = sv.IdSocioVeiculo
            INNER JOIN Socios ss ON sv.IdSocio = ss.IdSocio 
            INNER JOIN FinanceiroEspelho fe ON sva.IdSocioVeiculoAgenda = fe.IdSocioVeiculoAgenda
            INNER JOIN Motivacoes MO ON sva.IdMotivacao = MO.IdMotivacao
            WHERE sva.StatusAgendamento = 'C'
            AND sva.IdPontoAtendimento = @idPontoAtendimento
        ) t
        WHERE rn = 1
        ORDER BY DataAgendamento DESC;
    `;

    console.log(query);

    const result = await db.query(query, {idPontoAtendimento});

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Listar pontos de atendimento
router.get('/pontos-atendimento', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        IdPontoAtendimento, 
        RazaoSocial, 
        Cnpj, 
        Descricao, 
        EnderecoCidade, 
        EnderecoUf, 
        EnderecoBairro, 
        AtivoInativo 
      FROM PontosAtendimento 
      WHERE AtivoInativo = 'A' 
      ORDER BY RazaoSocial
    `;

    const result = await db.query(query);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Erro ao buscar pontos de atendimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;