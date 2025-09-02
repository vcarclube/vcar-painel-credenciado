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
      servicos: servicos.filter(s => { return!s.label.includes("RESERVA DE AGENDA")})
    });
  } catch (error) {
    console.error('Erro ao obter servicos:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.get('/get-dados-bancarios/:idPontoAtendimento', validateToken, async (req, res) => {
  try{
    let { idPontoAtendimento } = req.params;
    if (!idPontoAtendimento) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idPontoAtendimento é obrigatório' 
      });
    }
    let result = await db.query(`
      SELECT 
        IdDadoBancario,
        TipoChavePix,
        ChavePix,
        Banco,
        NumeroAgencia,
        NumeroConta,
        TipoConta,
        NomeTitular,
        DocumentoTitular,
        DataCadastro,
        IdPontoAtendimento,
        Selecionado
      FROM PontosAtendimentoDadosBancarios
      WHERE IdPontoAtendimento=@idPontoAtendimento;
    `, { idPontoAtendimento });
    let dadosBancarios = result.recordset;
    return res.status(200).json({
      dadosBancarios: dadosBancarios
    });
  } catch (error) {
    console.error('Erro ao obter dados bancários:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.post('/add-dado-bancario', validateToken, async (req, res) => {
  try{
    let { TipoChavePix, ChavePix, Banco, NumeroAgencia, NumeroConta, TipoConta, NomeTitular, DocumentoTitular, IdPontoAtendimento, Selecionado } = req.body;
    if (!IdPontoAtendimento) {
      return res.status(400).json({ 
        message: 'Dados incompletos: IdPontoAtendimento é obrigatório' 
      });
    }
    if (!NomeTitular || !DocumentoTitular) {
      return res.status(400).json({ 
        message: 'Dados incompletos: NomeTitular e DocumentoTitular são obrigatórios' 
      });
    }
    
    // Validação: deve ter dados PIX OU dados bancários
    const temDadosPix = TipoChavePix && ChavePix;
    const temDadosBancarios = Banco && NumeroAgencia && NumeroConta && TipoConta;
    
    if (!temDadosPix && !temDadosBancarios) {
      return res.status(400).json({ 
        message: 'Dados incompletos: É necessário informar dados PIX (TipoChavePix e ChavePix) OU dados bancários (Banco, NumeroAgencia, NumeroConta e TipoConta)' 
      });
    }
    if(Selecionado === 'S'){
      await db.query(`
        UPDATE PontosAtendimentoDadosBancarios
        SET
          Selecionado = 'N'
        WHERE IdPontoAtendimento = @IdPontoAtendimento
      `, { IdPontoAtendimento });
    }
    let result = await db.query(`
      INSERT INTO PontosAtendimentoDadosBancarios (
        TipoChavePix,
        ChavePix,
        Banco,
        NumeroAgencia,
        NumeroConta,
        TipoConta,
        NomeTitular,
        DocumentoTitular,
        IdPontoAtendimento,
        Selecionado
      )
      VALUES (
        @TipoChavePix,
        @ChavePix,
        @Banco,
        @NumeroAgencia,
        @NumeroConta,
        @TipoConta,
        @NomeTitular,
        @DocumentoTitular,
        @IdPontoAtendimento,
        @Selecionado
      )
    `, { TipoChavePix, ChavePix, Banco, NumeroAgencia, NumeroConta, TipoConta, NomeTitular, DocumentoTitular, IdPontoAtendimento, Selecionado });
    if (result.rowsAffected[0] === 0) {
      return res.status(400).json({ 
        message: 'Erro ao adicionar dado bancário' 
      });
    }
    return res.status(200).json({
      message: 'Dado bancário adicionado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar dado bancário:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.post('/edit-dado-bancario', validateToken, async (req, res) => {
  try{
    let { IdDadoBancario, TipoChavePix, ChavePix, Banco, NumeroAgencia, NumeroConta, TipoConta, NomeTitular, DocumentoTitular, IdPontoAtendimento, Selecionado } = req.body;
    if (!IdDadoBancario) {
      return res.status(400).json({ 
        message: 'Dados incompletos: IdDadoBancario é obrigatório' 
      });
    }
    if (!IdPontoAtendimento) {
      return res.status(400).json({ 
        message: 'Dados incompletos: IdPontoAtendimento é obrigatório' 
      });
    }
    if (!NomeTitular || !DocumentoTitular) {
      return res.status(400).json({ 
        message: 'Dados incompletos: NomeTitular e DocumentoTitular são obrigatórios' 
      });
    }
    
    // Validação: deve ter dados PIX OU dados bancários
    const temDadosPix = TipoChavePix && ChavePix;
    const temDadosBancarios = Banco && NumeroAgencia && NumeroConta && TipoConta;
    
    if (!temDadosPix && !temDadosBancarios) {
      return res.status(400).json({ 
        message: 'Dados incompletos: É necessário informar dados PIX (TipoChavePix e ChavePix) OU dados bancários (Banco, NumeroAgencia, NumeroConta e TipoConta)' 
      });
    }
    if(Selecionado === 'S'){
      await db.query(`
        UPDATE PontosAtendimentoDadosBancarios
        SET
          Selecionado = 'N'
        WHERE IdPontoAtendimento = @IdPontoAtendimento
      `, { IdPontoAtendimento });
    }
    let result = await db.query(`
      UPDATE PontosAtendimentoDadosBancarios
      SET
        TipoChavePix = @TipoChavePix,
        ChavePix = @ChavePix,
        Banco = @Banco,
        NumeroAgencia = @NumeroAgencia,
        NumeroConta = @NumeroConta,
        TipoConta = @TipoConta,
        NomeTitular = @NomeTitular,
        DocumentoTitular = @DocumentoTitular,
        IdPontoAtendimento = @IdPontoAtendimento,
        Selecionado = @Selecionado
      WHERE IdDadoBancario = @IdDadoBancario
    `, { IdDadoBancario, TipoChavePix, ChavePix, Banco, NumeroAgencia, NumeroConta, TipoConta, NomeTitular, DocumentoTitular, IdPontoAtendimento, Selecionado });
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        message: 'Dado bancário não encontrado ou não foi possível editar' 
      });
    }
    return res.status(200).json({
      message: 'Dado bancário editado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao editar dado bancário:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.post('/delete-dado-bancario', validateToken, async (req, res) => {
  try{
    let { IdDadoBancario } = req.body;
    if (!IdDadoBancario) {
      return res.status(400).json({ 
        message: 'Dados incompletos: IdDadoBancario é obrigatório' 
      });
    }
    let result = await db.query(`
      DELETE FROM PontosAtendimentoDadosBancarios
      WHERE IdDadoBancario = @IdDadoBancario
    `, { IdDadoBancario });
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        message: 'Dado bancário não encontrado ou não foi possível excluir' 
      });
    }
    return res.status(200).json({
      message: 'Dado bancário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir dado bancário:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.get('/dados-cadastrais/:idPontoAtendimento', validateToken, async (req, res) => {
  try {
    
    const { idPontoAtendimento } = req.params;

    if (!idPontoAtendimento) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idPontoAtendimento é obrigatório' 
      });
    }

    const result = await db.query(`
      SELECT 
        Cnpj,
        RazaoSocial,
        InscricaoEstadual,
        QtdeElevadores,
        EnderecoCep,
        Endereco,
        EnderecoCidade,
        EnderecoUf,
        EnderecoComplemento,
        EnderecoBairro,
        SegSexInicio,
        SegSexFim,
        SabadoInicio,
        SabadoFim,
        DomingoInicio,
        DomingoFim,
        FeriadoInicio,
        FeriadoFim,
        Descricao
      FROM PontosAtendimento 
      WHERE IdPontoAtendimento = @IdPontoAtendimento
    `, { idPontoAtendimento });

    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        message: 'Ponto de atendimento não encontrado' 
      });
    }

    return res.status(200).json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erro ao buscar dados cadastrais:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/atualizar-dados-cadastrais', validateToken, async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({
        message: 'Dados são obrigatórios'
      });
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const queryParams = { IdPontoAtendimento: data.IdPontoAtendimento };

    // Campos permitidos para atualização
    const allowedFields = [
      'Cnpj', 'EnderecoCep', 'Endereco', 'EnderecoCidade', 'EnderecoUf', 
      'EnderecoComplemento', 'EnderecoBairro', 'RazaoSocial', 'QtdeElevadores',
      'InscricaoEstadual', 'SegSexInicio', 'SegSexFim', 'SabadoInicio', 
      'SabadoFim', 'DomingoInicio', 'DomingoFim', 'FeriadoInicio', 
      'FeriadoFim', 'Descricao'
    ];

    // Adicionar campos que foram enviados para atualização
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        updateFields.push(`${field} = @${field}`);
        queryParams[field] = data[field];
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'Nenhum campo válido para atualização foi fornecido'
      });
    }

    const query = `
      UPDATE PontosAtendimento 
      SET ${updateFields.join(', ')}
      WHERE IdPontoAtendimento = @IdPontoAtendimento
    `;

    await db.query(query, queryParams);

    return res.status(200).json({
      message: 'Dados atualizados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar dados cadastrais:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;