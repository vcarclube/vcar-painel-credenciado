const express = require('express');
const router = express.Router();

const { validateToken } = require('../middlewares/AuthMiddleware');
const { validateOrigin } = require('../middlewares/CorsMiddleware');

const db = require('../database');
const Utils = require('../utils');

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

const inserirFinanceiroEspelho = async (idSocioVeiculoAgenda) => {
    // 1. Criar lista
    const listaFinanceiroEspelho = await Utils.criarListaFinanceiroEspelho(idSocioVeiculoAgenda);

    if (!listaFinanceiroEspelho || listaFinanceiroEspelho.length === 0) {
        return true; // não há nada para inserir
    }

    // 2. Verificar se já existem registros
    const idsExistentesQuery = `
        SELECT IdSocioVeiculoAgenda
        FROM FinanceiroEspelho
        WHERE IdSocioVeiculoAgenda IN (${listaFinanceiroEspelho.map((_, i) => `@id${i}`).join(",")})
    `;

    const paramsIds = {};
    listaFinanceiroEspelho.forEach((x, i) => {
        paramsIds[`id${i}`] = x.IdSocioVeiculoAgenda;
    });

    const registrosExistentes = await db.query(idsExistentesQuery, paramsIds);
    const idsExistentes = registrosExistentes.recordset.map(r => r.IdSocioVeiculoAgenda);

    // 3. Filtrar os que ainda não existem
    const registrosParaInserir = listaFinanceiroEspelho.filter(x => !idsExistentes.includes(x.IdSocioVeiculoAgenda));

    if (registrosParaInserir.length === 0) {
        return true; // todos já existem
    }

    // 4. Montar SQL de insert em batch
    let sqlInsert = `
        INSERT INTO FinanceiroEspelho (
            IdFinanceiroEspelho,
            IdSocioVeiculoAgenda,
            IdSocioVeiculo,
            IdPontoAtendimento,
            IdSocioVeiculoAgendaExecucaoServico,
            RazaoSocial,
            Cnpj,
            Matricula,
            DataAgendamento,
            DataPagamento,
            ValorRepasse,
            PagamentoFeito,
            Placa,
            SocioNome,
            NomeServico,
            StatusAgendamento,
            NumeroOS,
            VeiculoPlaca,
            DataExecucaoOS,
            CodigoEspelho,
            TipoEspelho,
            TipoComissao,
            Descricao
        ) VALUES
    `;

    const valores = registrosParaInserir.map((item, i) => {
        return `(
            @IdFinanceiroEspelho${i},
            @IdSocioVeiculoAgenda${i},
            @IdSocioVeiculo${i},
            @IdPontoAtendimento${i},
            @IdSocioVeiculoAgendaExecucaoServico${i},
            @RazaoSocial${i},
            @Cnpj${i},
            @Matricula${i},
            @DataAgendamento${i},
            @DataPagamento${i},
            @ValorRepasse${i},
            @PagamentoFeito${i},
            @Placa${i},
            @SocioNome${i},
            @NomeServico${i},
            @StatusAgendamento${i},
            @NumeroOS${i},
            @VeiculoPlaca${i},
            @DataExecucaoOS${i},
            @CodigoEspelho${i},
            @TipoEspelho${i},
            @TipoComissao${i},
            @Descricao${i}
        )`;
    }).join(",");

    sqlInsert += valores;

    const paramsInsert = {};
    registrosParaInserir.forEach((item, i) => {
        paramsInsert[`IdFinanceiroEspelho${i}`] = item.IdFinanceiroEspelho;
        paramsInsert[`IdSocioVeiculoAgenda${i}`] = item.IdSocioVeiculoAgenda;
        paramsInsert[`IdSocioVeiculo${i}`] = item.IdSocioVeiculo;
        paramsInsert[`IdPontoAtendimento${i}`] = item.IdPontoAtendimento;
        paramsInsert[`IdSocioVeiculoAgendaExecucaoServico${i}`] = item.IdSocioVeiculoAgendaExecucaoServico || null;
        paramsInsert[`RazaoSocial${i}`] = item.RazaoSocial || null;
        paramsInsert[`Cnpj${i}`] = item.Cnpj || null;
        paramsInsert[`Matricula${i}`] = item.Matricula || null;
        paramsInsert[`DataAgendamento${i}`] = item.DataAgendamento || null;
        paramsInsert[`DataPagamento${i}`] = item.DataPagamento || null;
        paramsInsert[`ValorRepasse${i}`] = item.ValorRepasse || null;
        paramsInsert[`PagamentoFeito${i}`] = item.PagamentoFeito || null;
        paramsInsert[`Placa${i}`] = item.Placa || null;
        paramsInsert[`SocioNome${i}`] = item.SocioNome || null;
        paramsInsert[`NomeServico${i}`] = item.NomeServico || null;
        paramsInsert[`StatusAgendamento${i}`] = item.StatusAgendamento || null;
        paramsInsert[`NumeroOS${i}`] = item.NumeroOS || null;
        paramsInsert[`VeiculoPlaca${i}`] = item.VeiculoPlaca || null;
        paramsInsert[`DataExecucaoOS${i}`] = item.DataExecucaoOS || null;
        paramsInsert[`CodigoEspelho${i}`] = item.CodigoEspelho || null;
        paramsInsert[`TipoEspelho${i}`] = item.TipoEspelho || null;
        paramsInsert[`TipoComissao${i}`] = item.TipoComissao || null;
        paramsInsert[`Descricao${i}`] = item.Descricao || null;
    });

    await db.query(sqlInsert, paramsInsert);

    return true;
};

const finalizarExecucao = async (idSocioVeiculoAgenda, usuarioId, responsavel = null, observacao = null, km = null) => {
    const agora = new Date().toISOString().slice(0, 19).replace("T", " ");

    // 1) Atualizar execução
    await db.query(`
        UPDATE SociosVeiculosAgendaExecucao
        SET IdUsuarioFim = @usuarioId,
            DataHoraFim  = @agora
        WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        AND DataHoraFim IS NULL;
    `, { usuarioId, agora, idSocioVeiculoAgenda });

    // 2) Atualizar agendamento (status + valor do serviço)
    await db.query(`
        UPDATE SociosVeiculosAgenda
        SET StatusAgendamento = 'C',
            ResponsavelFinalizacao = @responsavel,
            ObservacaoFinalizacao = @observacao,
            KmFinalizacao = @km,
            ValorServico = (
                SELECT ValorServico
                FROM Servicos
                WHERE IdServico = (
                    SELECT IdServico
                    FROM SociosVeiculosAgenda
                    WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
                )
            )
        WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        AND StatusAgendamento <> 'C';
    `, { idSocioVeiculoAgenda, responsavel, observacao, km });

    // 3) Buscar vendas efetivadas
    const vendasEfetivadasResult = await db.query(`
        SELECT C.IdSocioVeiculoComissao
        FROM SociosVeiculosAgenda A
        JOIN SociosVeiculos A1 ON A.IdSocioVeiculo = A1.IdSocioVeiculo
        JOIN SociosVeiculosComissoes C ON A.IdSocioVeiculo = C.IdSocioVeiculo
        WHERE A.IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        AND A1.Status <> 'I'
        AND C.DataPagamento IS NULL
        AND C.IdSocioComissao1 IS NOT NULL
    `, { idSocioVeiculoAgenda });

    vendasEfetivadas = vendasEfetivadasResult?.recordset;

    // 4) Se tiver vendas, gerar inserts no extrato
    for (const venda of vendasEfetivadas) {
        const params = { idSocioVeiculoComissao: venda.IdSocioVeiculoComissao, agora };

        await db.query(`
            INSERT INTO SociosParceirosExtrato(IdSocioParceiro, Valor, IdSocioVeiculoComissao, TipoMovimento, DataLog)
            SELECT (SELECT IdSocioParceiro FROM SociosParceiros WHERE IdSocio = A.IdSocioComissao1),
                   A.ValorComissao1,
                   A.IdSocioVeiculoComissao,
                   'E',
                   @agora
            FROM SociosVeiculosComissoes A
            WHERE A.IdSocioVeiculoComissao = @idSocioVeiculoComissao
            AND A.ValorComissao1 IS NOT NULL;

            INSERT INTO SociosParceirosExtrato(IdSocioParceiro, Valor, IdSocioVeiculoComissao, TipoMovimento, DataLog)
            SELECT (SELECT IdSocioParceiro FROM SociosParceiros WHERE IdSocio = A.IdSocioComissao2),
                   A.ValorComissao2,
                   A.IdSocioVeiculoComissao,
                   'E',
                   @agora
            FROM SociosVeiculosComissoes A
            WHERE A.IdSocioVeiculoComissao = @idSocioVeiculoComissao
            AND A.ValorComissao2 IS NOT NULL;

            INSERT INTO SociosParceirosExtrato(IdSocioParceiro, Valor, IdSocioVeiculoComissao, TipoMovimento, DataLog)
            SELECT (SELECT IdSocioParceiro FROM SociosParceiros WHERE IdSocio = A.IdSocioComissao3),
                   A.ValorComissao3,
                   A.IdSocioVeiculoComissao,
                   'E',
                   @agora
            FROM SociosVeiculosComissoes A
            WHERE A.IdSocioVeiculoComissao = @idSocioVeiculoComissao
            AND A.ValorComissao3 IS NOT NULL;

            UPDATE SociosVeiculosComissoes
            SET DataPagamento = GETDATE()
            WHERE IdSocioVeiculoComissao = @idSocioVeiculoComissao;
        `, params);
    }

    await inserirFinanceiroEspelho(idSocioVeiculoAgenda);

    return true;
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
        A.VideoInicial,
        A.VideoFinal,
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
        MT.Descricao AS Motivacao, 
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
        LEFT JOIN Motivacoes AS MT
          ON MT.IdMotivacao = A.IdMotivacao
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

router.post('/lista-horarios-disponiveis', validateOrigin, async (req, res) => {
  try{
    const { idPontoAtendimento, dataAgendamento, dataAtual, horaAtual } = req.body;

    if (!idPontoAtendimento || !dataAgendamento || !dataAtual || !horaAtual) {
      return res.status(400).json({ 
        message: 'Dados incompletos' 
      });
    }
    
    let dataUS = Utils.formatDateUS(dataAtual);

    let pontoAtendimento = await Utils.getPontoAtendimentoById(idPontoAtendimento);
    let agendamentos = await Utils.getAgendamentosByPontoAtendimento(idPontoAtendimento, dataAgendamento);
    let qtdeElevadores = pontoAtendimento?.QtdeElevadores;

    let { horaSelecionadaInicio, horaSelecionadaFim } = Utils.definirHorasInicioFimPorDiaDaSemana(pontoAtendimento, dataAgendamento);  

    if(horaSelecionadaInicio == null || horaSelecionadaFim == null || horaSelecionadaInicio == undefined || horaSelecionadaFim == undefined || horaSelecionadaInicio == "" || horaSelecionadaFim == ""){
      return res.status(200).json([]);
    }

    if(qtdeElevadores <= 0){
      return res.status(400).json({ 
        message: 'Ponto de atendimento não possui elevadores' 
      });
    }

    if (!pontoAtendimento) {
      return res.status(400).json({ 
        message: 'Ponto de atendimento não encontrado' 
      });
    }

    //console.log('=== DEBUG INFO ===');
    //console.log('Quantidade de elevadores:', qtdeElevadores);
    //console.log('Agendamentos encontrados:', agendamentos.length);
    //console.log('Agendamentos:', agendamentos);
    //console.log('Horário funcionamento:', horaSelecionadaInicio, 'às', horaSelecionadaFim);

    // Função para converter tempo HH:MM:SS em minutos
    function timeToMinutes(timeString) {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      return hours * 60 + minutes + Math.floor(seconds / 60);
    }

    // Função para extrair hora de um datetime ISO
    function extractTimeFromISO(isoString) {
      const date = new Date(isoString);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}:00`;
    }

    // Função para converter minutos em formato HH:MM
    function minutesToTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Função para verificar se a data do agendamento é a mesma da data solicitada
    function isSameDate(dateISO, dateString) {
      const agendamentoDate = new Date(dateISO);
      const solicitadaDate = new Date(dateString);
      
      return agendamentoDate.getUTCFullYear() === solicitadaDate.getUTCFullYear() &&
             agendamentoDate.getUTCMonth() === solicitadaDate.getUTCMonth() &&
             agendamentoDate.getUTCDate() === solicitadaDate.getUTCDate();
    }

    // Converter horários para minutos
    const inicioMinutos = timeToMinutes(horaSelecionadaInicio);
    const fimMinutos = timeToMinutes(horaSelecionadaFim);
    const horaAtualMinutos = timeToMinutes(horaAtual);

    // Verificar se o horário cruza a meia-noite
    const cruzaMeiaNoite = inicioMinutos > fimMinutos;
    
    let totalMinutosFuncionamento;
    if (cruzaMeiaNoite) {
      totalMinutosFuncionamento = (24 * 60 - inicioMinutos) + fimMinutos;
    } else {
      totalMinutosFuncionamento = fimMinutos - inicioMinutos;
    }

    if (totalMinutosFuncionamento <= 0) {
      return res.status(400).json({ 
        message: 'Horário de funcionamento inválido' 
      });
    }

    // Criar matriz de ocupação dos elevadores (intervalos de 30 minutos)
    const totalIntervalos = Math.ceil(totalMinutosFuncionamento / 30);
    const ocupacaoElevadores = Array(totalIntervalos).fill().map(() => Array(qtdeElevadores).fill(false));

    //console.log('Total de intervalos criados:', totalIntervalos);

    // Função para verificar se um horário está dentro do funcionamento
    function isHorarioValido(minutos) {
      if (cruzaMeiaNoite) {
        return minutos >= inicioMinutos || minutos <= fimMinutos;
      } else {
        return minutos >= inicioMinutos && minutos <= fimMinutos;
      }
    }

    // Função para converter minutos absolutos para índice do array
    function minutosParaIndice(minutos) {
      if (cruzaMeiaNoite) {
        if (minutos >= inicioMinutos) {
          return Math.floor((minutos - inicioMinutos) / 30);
        } else {
          const minutosNoite = 24 * 60 - inicioMinutos;
          return Math.floor((minutosNoite + minutos) / 30);
        }
      } else {
        return Math.floor((minutos - inicioMinutos) / 30);
      }
    }

    // Processar agendamentos existentes
    agendamentos.forEach((agendamento, index) => {
      //console.log(`\n--- Processando agendamento ${index + 1} ---`);
      
      // Verificar se o agendamento é para a data solicitada
      if (!isSameDate(agendamento.DataAgendamento, dataAgendamento)) {
        //console.log('Agendamento de data diferente, pulando...');
        return;
      }

      if (agendamento.servicosVinculados && agendamento.servicosVinculados.length > 0) {
        // Extrair hora do agendamento
        const horaAgendamento = extractTimeFromISO(agendamento.HoraAgendamento);
        const inicioAgendamentoMinutos = timeToMinutes(horaAgendamento);
        
        //console.log('Hora do agendamento:', horaAgendamento, '(', inicioAgendamentoMinutos, 'minutos)');
        
        // Verificar se o horário do agendamento está dentro do funcionamento
        if (!isHorarioValido(inicioAgendamentoMinutos)) {
          console.log('Agendamento fora do horário de funcionamento, pulando...');
          return;
        }
        
        // Calcular tempo total dos serviços em minutos
        let tempoTotalMinutos = 0;
        agendamento.servicosVinculados.forEach(servico => {
          const tempoServico = timeToMinutes(servico.TempoMedio);
          tempoTotalMinutos += tempoServico;
          //console.log(`Serviço: ${servico.Descricao} - Tempo: ${servico.TempoMedio} (${tempoServico} min)`);
        });
        
        //console.log('Tempo total dos serviços:', tempoTotalMinutos, 'minutos');
        
        // Calcular intervalos ocupados
        const inicioIntervalo = minutosParaIndice(inicioAgendamentoMinutos);
        const duracaoIntervalos = Math.ceil(tempoTotalMinutos / 30);
        
        //console.log('Início intervalo:', inicioIntervalo);
        //console.log('Duração em intervalos:', duracaoIntervalos);
        //console.log('Intervalos a ocupar:', inicioIntervalo, 'até', inicioIntervalo + duracaoIntervalos - 1);
        
        // Encontrar elevador disponível e marcar como ocupado
        let elevadorEncontrado = false;
        
        // Primeiro, verificar se há algum elevador disponível em TODOS os intervalos necessários
        for (let elevador = 0; elevador < qtdeElevadores; elevador++) {
          let elevadorDisponivel = true;
          
          // Verificar se este elevador está livre em todos os intervalos necessários
          for (let intervalo = inicioIntervalo; intervalo < inicioIntervalo + duracaoIntervalos && intervalo < totalIntervalos; intervalo++) {
            if (intervalo >= 0 && ocupacaoElevadores[intervalo][elevador]) {
              elevadorDisponivel = false;
              break;
            }
          }
          
          // Se encontrou um elevador disponível, ocupar todos os intervalos
          if (elevadorDisponivel) {
            for (let intervalo = inicioIntervalo; intervalo < inicioIntervalo + duracaoIntervalos && intervalo < totalIntervalos; intervalo++) {
              if (intervalo >= 0) {
                ocupacaoElevadores[intervalo][elevador] = true;
                console.log(`Ocupando elevador ${elevador + 1} no intervalo ${intervalo}`);
              }
            }
            elevadorEncontrado = true;
            console.log(`Agendamento alocado no elevador ${elevador + 1}`);
            break;
          }
        }
        
        if (!elevadorEncontrado) {
          console.log('ATENÇÃO: Não foi possível alocar o agendamento - todos os elevadores ocupados!');
        }
      }
    });

    // Debug: mostrar matriz de ocupação
    console.log('\n=== MATRIZ DE OCUPAÇÃO ===');
    for (let i = 0; i < Math.min(totalIntervalos, 20); i++) { // Mostrar apenas os primeiros 20 para não poluir
      const horarioMinutos = cruzaMeiaNoite ? 
        (i * 30 < (24 * 60 - inicioMinutos) ? 
          inicioMinutos + (i * 30) : 
          (i * 30) - (24 * 60 - inicioMinutos)) :
        inicioMinutos + (i * 30);
      
      const horario = minutesToTime(horarioMinutos);
      const ocupacao = ocupacaoElevadores[i].map(ocupado => ocupado ? 'X' : 'O').join(' ');
      console.log(`${horario}: [${ocupacao}]`);
    }

    // Gerar horários disponíveis
    let horasDisponiveis = [];
    
    for (let i = 0; i < totalIntervalos; i++) {
      let horarioMinutos;
      
      if (cruzaMeiaNoite) {
        const minutosDesdeInicio = i * 30;
        const minutosNoite = 24 * 60 - inicioMinutos;
        
        if (minutosDesdeInicio < minutosNoite) {
          horarioMinutos = inicioMinutos + minutosDesdeInicio;
        } else {
          horarioMinutos = minutosDesdeInicio - minutosNoite;
        }
      } else {
        horarioMinutos = inicioMinutos + (i * 30);
      }
      
      // Verificar se é horário futuro (se for o dia atual)
      const isDataAtual = dataAgendamento === dataAtual;
      const isFuturo = !isDataAtual || horarioMinutos >= horaAtualMinutos;
      
      // Verificar se há pelo menos um elevador disponível
      const elevatoresDisponiveis = ocupacaoElevadores[i].filter(ocupado => !ocupado).length;
      const temElevadorDisponivel = elevatoresDisponiveis > 0;
      
      // Verificar se está dentro do horário de funcionamento
      const dentroHorarioFuncionamento = isHorarioValido(horarioMinutos);
      
      if (isFuturo && temElevadorDisponivel && dentroHorarioFuncionamento) {
        horasDisponiveis.push(minutesToTime(horarioMinutos));
      }
    }

    //console.log('\n=== RESULTADO ===');
    //console.log('Horários disponíveis encontrados:', horasDisponiveis.length);
    //console.log('Primeiros 10 horários:', horasDisponiveis.slice(0, 10));

    return res.status(200).json(horasDisponiveis);

  }catch (error) {
    console.log(error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/reagendar', validateToken, async (req, res) => {
  try {
    const { idSocioVeiculoAgenda, idPontoAtendimento, idSocio, idSocioVeiculo, data, hora, motivo } = req.body;
    if (!idSocioVeiculoAgenda || !idPontoAtendimento || !idSocio || !idSocioVeiculo || !data || !hora || !motivo) {
      return res.status(400).json({ 
        message: 'Dados incompletos' 
      });
    }

    let agendamento = await Utils.getAgendamentoById(idSocioVeiculoAgenda);
    let pontoAtendimento = await Utils.getPontoAtendimentoById(idPontoAtendimento);
    let socio = await Utils.getSocioById(idSocio);
    let socioVeiculo = await Utils.getSocioVeiculoById(idSocioVeiculo);
    let motivacao = await Utils.getMotivacaoById(agendamento?.IdMotivacao);

    console.log(agendamento, pontoAtendimento, socio, socioVeiculo, motivacao);

    await Utils.notificarPontoAtendimento({
      idPontoAtendimento,
      titulo: 'Reagendamento',
      conteudo: `Foi feito um reagendamento do sócio ${socio.Nome} no ${pontoAtendimento.Descricao} para ${Utils.formatDateString(data)} ás ${hora}. Motivo: ${motivo}`,
      lido: false
    });

    await Utils.notificarWhatsapp({
      phone: socio.Telefone,
      message: `
📆 Olá, ${socio.Nome}👋, Informamos que seu serviço foi reagendado pela oficina.

🗺 *Local*: ${pontoAtendimento.Descricao}
🚗 *Carro*: ${socioVeiculo.Placa}
⭐ *Serviço*: ${motivacao?.Descricao || `(não informado)`}
📅 *Data*: ${Utils.formatDateString(data)}
🕐 *Hora*: ${hora}

🛑 *Motivo*: ${motivo}, caso não concorde com a data proposta pela oficina, basta reagendar uma data disponível pelo app 😉!
      `
    });

    await Utils.notificarFirebaseCloudMessaging({
      idSocio: socio.IdSocio,
      title: 'Reagendamento',
      body: `Olá ${socio.Nome}👋, Informamos que seu serviço foi reagendado pela ${pontoAtendimento.Descricao} para ${Utils.formatDateString(data)} ás ${hora}.`
    });

    await db.query(`
            UPDATE SociosVeiculosAgenda
            SET DataAgendamento = @data,
                HoraAgendamento = @hora,
                MotivoReagendamento = @motivo
            WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
        `, { idSocioVeiculoAgenda, data, hora, motivo });

    return res.status(200).json({
       message: 'Reagendamento realizado com sucesso' 
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.post('/cancelar', validateToken, async (req, res) => {
  try {
    const { idSocioVeiculoAgenda, idPontoAtendimento, idSocio, idSocioVeiculo, motivo } = req.body;
    if (!idSocioVeiculoAgenda || !idPontoAtendimento || !idSocio || !idSocioVeiculo || !motivo ) {
      return res.status(400).json({ 
        message: 'Dados incompletos' 
      });
    }

    let agendamento = await Utils.getAgendamentoById(idSocioVeiculoAgenda);
    let pontoAtendimento = await Utils.getPontoAtendimentoById(idPontoAtendimento);
    let socio = await Utils.getSocioById(idSocio);
    let socioVeiculo = await Utils.getSocioVeiculoById(idSocioVeiculo);
    let motivacao = await Utils.getMotivacaoById(agendamento?.IdMotivacao);

    await Utils.notificarPontoAtendimento({
      idPontoAtendimento,
      titulo: 'Cancelamento',
      conteudo: `Foi feito um cancelamento do sócio ${socio.Nome} no ${pontoAtendimento.Descricao} para ${Utils.formatDateString(agendamento.DataAgendamento)} ás ${agendamento.HoraAgendamento}. Motivo: ${motivo}`,
      lido: false
    });

    await Utils.notificarWhatsapp({
      phone: socio.Telefone,
      message: `
📆 Olá, ${socio.Nome}👋, Informamos que seu agendamennto foi cancelado pela oficina.

🗺 *Local*: ${pontoAtendimento.Descricao}
🚗 *Carro*: ${socioVeiculo.Placa}
⭐ *Serviço*: ${motivacao?.Descricao || `(não informado)`}
📅 *Data*: ${Utils.formatDateString(agendamento.DataAgendamento)}
🕐 *Hora*: ${Utils.formatHourString(agendamento.HoraAgendamento)}

🛑 *Motivo*: ${motivo}
      `
    });

    await Utils.notificarFirebaseCloudMessaging({
      idSocio: socio.IdSocio,
      title: 'Cancelamento',
      body: `Olá ${socio.Nome}👋, Informamos que seu agendnamento foi cancelado pela ${pontoAtendimento.Descricao}, ${motivo}`
    });

    await db.query(`
            UPDATE SociosVeiculosAgenda
            SET MotivoCancelamento = @motivo, StatusAgendamento = 'E'
            WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
        `, { idSocioVeiculoAgenda, motivo });

    return res.status(200).json({
      message: 'Cancelamento realizado com sucesso'
    });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

router.post('/iniciar', validateToken, async (req, res) => {
  try {
    const { idSocioVeiculoAgenda, idPontoAtendimentoUsuario, idSocio, data, hora } = req.body;
    
    if (!idSocioVeiculoAgenda || !idPontoAtendimentoUsuario) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda e idPontoAtendimentoUsuario são obrigatórios' 
      });
    }

    const idSocioVeiculoAgendaExecucaoGenerated = Utils.generateUUID();

    const query = `
      INSERT INTO SociosVeiculosAgendaExecucao(IdSocioVeiculoAgendaExecucao, IdSocioVeiculoAgenda, IdUsuarioInicio, DataHoraInicio)
      SELECT @idExecucao, @idAgenda, @idUsuario, @dataHora
      FROM Sequencial AS A
      LEFT JOIN SociosVeiculosAgendaExecucao AS B
        ON B.IdSocioVeiculoAgenda = @idAgendaCheck
      WHERE A.Id = 1
      AND B.IdSocioVeiculoAgenda IS NULL
    `;

    let dataUS = Utils.formatDateUS(data);

    await db.query(query, {
      idExecucao: idSocioVeiculoAgendaExecucaoGenerated,
      idAgenda: idSocioVeiculoAgenda,
      idUsuario: idPontoAtendimentoUsuario,
      dataHora: `${dataUS} ${hora}`,
      idAgendaCheck: idSocioVeiculoAgenda
    });

    let agendamento = await Utils.getAgendamentoById(idSocioVeiculoAgenda);
    let socio = await Utils.getSocioById(idSocio);
    let motivacao = await Utils.getMotivacaoById(agendamento?.IdMotivacao);

    await Utils.notificarWhatsapp({
      phone: socio.Telefone,
      message: `
📆 Olá, ${socio.Nome}👋, Informamos que seu serviço de *${motivacao?.Descricao }* já foi iniciado em ${data} ás ${hora}.
      `
    });

    await Utils.notificarFirebaseCloudMessaging({
      idSocio: socio.IdSocio,
      title: 'Serviço iniciado',
      body: `Olá ${socio.Nome}👋, Informamos que seu serviço de *${motivacao?.Descricao }* já foi iniciado em ${data} ás ${hora}.`
    });

    return res.status(200).json({
      message: 'Execução iniciada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao iniciar execução:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/concluir', validateToken, async (req, res) => {
    try {
        const { idSocioVeiculoAgenda, idPontoAtendimentoUsuario, idSocio, responsavel, observacao, km } = req.body;
        
        if (!idSocioVeiculoAgenda || !idPontoAtendimentoUsuario || !idSocio ) {
            return res.status(400).json({ 
                message: 'Dados incompletos: idSocioVeiculoAgenda, idPontoAtendimentoUsuario e data são obrigatórios' 
            });
        }

        await finalizarExecucao(idSocioVeiculoAgenda, idPontoAtendimentoUsuario, responsavel, observacao, km);

        let agendamento = await Utils.getAgendamentoById(idSocioVeiculoAgenda);
        let socio = await Utils.getSocioById(idSocio);
        let motivacao = await Utils.getMotivacaoById(agendamento?.IdMotivacao);

        await Utils.notificarWhatsapp({
          phone: socio.Telefone,
          message: `📆 Olá, ${socio.Nome}👋, Informamos que seu agendamento de *${motivacao?.Descricao }* foi concluído.`
        });

        await Utils.notificarFirebaseCloudMessaging({
          idSocio: socio.IdSocio,
          title: 'Serviço iniciado',
          body: `📆 Olá, ${socio.Nome}👋, Informamos que seu agendamento de *${motivacao?.Descricao }* foi concluído.`
        });

        return res.status(200).json({
          message: 'Execução finalizada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao concluir agendamento:', error);
        return res.status(500).json({ 
            message: 'Erro interno do servidor' 
        });
    }
})

router.post('/atualizar-video-inicial', validateToken, async (req, res) => {
  try {
    const { idSocioVeiculoAgenda, videoInicial } = req.body;
    
    if (!idSocioVeiculoAgenda || !videoInicial) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda e videoInicial são obrigatórios' 
      });
    }
    await db.query(`
      UPDATE SociosVeiculosAgenda
      SET VideoInicial = @videoInicial
      WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
    `, { idSocioVeiculoAgenda, videoInicial });
    return res.status(200).json({
      message: 'Video inicial atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar video inicial:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

router.post('/atualizar-video-final', validateToken, async (req, res) => {
  try {
    const { idSocioVeiculoAgenda, videoFinal } = req.body;
    
    if (!idSocioVeiculoAgenda || !videoFinal) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda e videoFinal são obrigatórios' 
      });
    }
    await db.query(`
      UPDATE SociosVeiculosAgenda
      SET VideoFinal = @videoFinal
      WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
    `, { idSocioVeiculoAgenda, videoFinal });
    return res.status(200).json({
      message: 'Video final atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar video final:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

router.get('/get/:idSocioVeiculoAgenda', validateToken, async (req, res) => {
  try {
    const { idSocioVeiculoAgenda } = req.params;
    if (!idSocioVeiculoAgenda) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda é obrigatório' 
      });
    }
    
    let agendamento = await Utils.getAgendamentoById(idSocioVeiculoAgenda);
    let socioVeiculo = await Utils.getSocioVeiculoById(agendamento?.IdSocioVeiculo);
    let socio = await Utils.getSocioById(socioVeiculo?.IdSocio);
    let motivo = await Utils.getMotivacaoById(agendamento?.IdMotivacao);
    let execucao = await Utils.getAgendamentoExecucao(idSocioVeiculoAgenda);

    return res.status(200).json({
      agendamento,
      socio,
      socioVeiculo,
      motivo,
      execucao
    });
    
  } catch (error) {
    console.error('Erro ao obter agendamento:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
});

router.get('/servicos-vinculados/:idSocioVeiculoAgenda', validateToken, async (req, res) => {
    try {
        const { idSocioVeiculoAgenda } = req.params;

        let result = await db.query(`
            SELECT 
              A.*,
              A.StatusAprovacao AS status,
              A.IdSocioVeiculoAgendaExecucaoServico AS id,
              B.IdServico AS value,
              B.Descricao + ' - ' + B.TipoVeiculo AS label, 
              B.Observacoes AS description,
              B.FornecidoPelaVcar AS FornecidoPelaVcar
            FROM SociosVeiculosAgendaExecucaoServicos AS A
            INNER JOIN Servicos AS B ON A.IdServico=B.IdServico
            WHERE A.idSocioVeiculoAgenda=@idSocioVeiculoAgenda;
        `, { idSocioVeiculoAgenda });
      
        const servicos = result.recordset;

        return res.status(200).json({
            servicos: servicos.filter(s => { return!s.label.includes("RESERVA DE AGENDA")})
        });

    } catch (error) {
        console.error('Erro ao buscar serviços vinculados:', error);
        return res.status(400).json({ message: error.message, data: null });
    }
})

router.post('/vincular-servico', validateToken , async (req, res) => {
  try{
    const { idPontoAtendimentoUsuario, idSocioVeiculoAgenda, idServico, numeroOS, descricao, video, fotos = [], foto1, foto2, foto3 } = req.body;
    if (!idPontoAtendimentoUsuario || !idSocioVeiculoAgenda || !idServico || !numeroOS) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idPontoAtendimentoUsuario, idSocioVeiculoAgenda, idServico e numeroOS são obrigatórios' 
      });
    }

    let idSocioVeiculoAgendaExecucaoServicoGenerated = Utils.generateUUID();

    // Mapear fotos enviadas para Foto1..Foto3
    const fotosArray = Array.isArray(fotos) ? fotos : [];
    const Foto1 = foto1 || fotosArray[0] || null;
    const Foto2 = foto2 || fotosArray[1] || null;
    const Foto3 = foto3 || fotosArray[2] || null;
    const Video = video || null;

    await db.query(`
      INSERT INTO SociosVeiculosAgendaExecucaoServicos (
        IdSocioVeiculoAgendaExecucaoServico,
        IdSocioVeiculoAgenda,
        IdServico,
        IdUsuario,
        StatusAprovacao,
        DataLog,
        PagamentoFeito,
        Foto1,
        Foto2,
        Foto3,
        Video,
        Observacoes
      )
      VALUES (
        @idSocioVeiculoAgendaExecucaoServicoGenerated,
        @idSocioVeiculoAgenda,
        @idServico,
        @idPontoAtendimentoUsuario,
        'P',
        GETDATE(),
        'N',
        @Foto1,
        @Foto2,
        @Foto3,
        @Video,
        @Observacoes
      );
    `, { 
      idSocioVeiculoAgendaExecucaoServicoGenerated,
      idSocioVeiculoAgenda,
      idPontoAtendimentoUsuario,
      idServico,
      Foto1,
      Foto2,
      Foto3,
      Video,
      Observacoes: descricao || null
    });

    let credenciado = await Utils.getPontoAtendimentoByUsuario(idPontoAtendimentoUsuario);
    let servico = await Utils.getServicoById(idServico);
    let { IdSocioVeiculo } = await Utils.getSocioVeiculoByIdSocioVeiculoAgenda(idSocioVeiculoAgenda);
    let socioVeiculo = await Utils.getSocioVeiculoById(IdSocioVeiculo);
    let socio = await Utils.getSocioById(socioVeiculo?.IdSocio);

    // ✅ Montagem da mensagem
    const message = `✅ Nova solicitação de aprovação de serviço
    
*Credenciado*: ${credenciado.Descricao}
*Nº OS*: ${numeroOS}
*Serviço*: ${servico.Descricao}
*Sócio*: ${socio.Nome}
*Veículo*: ${socioVeiculo?.MarcaVeiculo} - ${socioVeiculo?.VeiculoModelo}`;
    
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

    return res.status(200).json({
      message: 'Serviço vinculado com sucesso',
      idSocioVeiculoAgendaExecucaoServico: idSocioVeiculoAgendaExecucaoServicoGenerated,
      media: { Foto1, Foto2, Foto3, Video }
    });

  } catch (error) {
    console.error('Erro ao inserir serviço:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/desvincular-servico', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgendaExecucaoServico } = req.body;
    if (!idSocioVeiculoAgendaExecucaoServico) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgendaExecucaoServico é obrigatório' 
      });
    }
    await db.query(`
      DELETE FROM SociosVeiculosAgendaExecucaoServicos
      WHERE IdSocioVeiculoAgendaExecucaoServico = @idSocioVeiculoAgendaExecucaoServico;
    `, { idSocioVeiculoAgendaExecucaoServico });
    return res.status(200).json({
      message: 'Serviço desvinculado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desvincular serviço:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.get('/get-fotos/:idSocioVeiculoAgenda', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda } = req.params;
    if (!idSocioVeiculoAgenda) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda é obrigatório' 
      });
    }
    let result = await db.query(`
      SELECT 
        A.*
      FROM SociosVeiculosAgendaExecucaoFotos AS A
      WHERE A.idSocioVeiculoAgenda=@idSocioVeiculoAgenda;
    `, { idSocioVeiculoAgenda });

    const fotos = result.recordset;

    return res.status(200).json({
      fotos
    });
  }catch (error) {
    console.error('Erro ao regatar fotos:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/adicionar-foto', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda, idPontoAtendimentoUsuario, foto } = req.body;
    if (!idSocioVeiculoAgenda || !foto) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda e foto são obrigatórios' 
      });
    }

    let idSocioVeiculoAgendaExecucaoFotoGenerated = Utils.generateUUID();

    await db.query(`
      INSERT INTO SociosVeiculosAgendaExecucaoFotos (
        IdSocioVeiculoAgendaExecucaoFoto,
        IdSocioVeiculoAgenda,
        IdUsuario,
        Foto,
        DataLog
      )
      VALUES (
        @idSocioVeiculoAgendaExecucaoFotoGenerated,
        @idSocioVeiculoAgenda,
        @idPontoAtendimentoUsuario,
        @foto,
        GETDATE()
      );
    `, { 
      idSocioVeiculoAgendaExecucaoFotoGenerated,
      idSocioVeiculoAgenda,
      idPontoAtendimentoUsuario,
      foto
    });

    return res.status(200).json({
      message: 'Foto adicionada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao adicionar foto:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/deletar-foto', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgendaExecucaoFoto } = req.body;
    if (!idSocioVeiculoAgendaExecucaoFoto) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgendaExecucaoFoto é obrigatório' 
      });
    }
    await db.query(`
      DELETE FROM SociosVeiculosAgendaExecucaoFotos
      WHERE IdSocioVeiculoAgendaExecucaoFoto = @idSocioVeiculoAgendaExecucaoFoto;
    `, { idSocioVeiculoAgendaExecucaoFoto });
    return res.status(200).json({
      message: 'Foto desvinculada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desvincular foto:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/adicionar-anotacao', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda, idPontoAtendimentoUsuario, anotacao, data } = req.body;
    if (!idSocioVeiculoAgenda || !idPontoAtendimentoUsuario || !anotacao || !data) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda, idPontoAtendimentoUsuario e anotação são obrigatórios' 
      });
    }
    let idSocioVeiculoAgendaExecucaoAnotacaoGenerated = Utils.generateUUID();
    await db.query(`
      INSERT INTO SociosVeiculosAgendaExecucaoAnotacoes (
        IdSocioVeiculoAgendaExecucaoAnotacao,
        IdSocioVeiculoAgenda,
        IdUsuario,
        Anotacao,
        DataLog
      )
      VALUES (
        @idSocioVeiculoAgendaExecucaoAnotacaoGenerated,
        @idSocioVeiculoAgenda,
        @idPontoAtendimentoUsuario,
        @anotacao,
        @data
      );
    `, { 
      idSocioVeiculoAgendaExecucaoAnotacaoGenerated,
      idSocioVeiculoAgenda,
      idPontoAtendimentoUsuario,
      anotacao,
      data
    });

    return res.status(200).json({
      message: 'Anotação adicionada com sucesso'
    });

  }catch (error) {
    console.error('Erro ao adicionar anotações:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/deletar-anotacao', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgendaExecucaoAnotacao } = req.body;
    if (!idSocioVeiculoAgendaExecucaoAnotacao) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgendaExecucaoAnotacao é obrigatório' 
      });
    }
    await db.query(`
      DELETE FROM SociosVeiculosAgendaExecucaoAnotacoes
      WHERE IdSocioVeiculoAgendaExecucaoAnotacao = @idSocioVeiculoAgendaExecucaoAnotacao;
    `, { idSocioVeiculoAgendaExecucaoAnotacao });
    return res.status(200).json({
      message: 'Anotação desvinculada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desvincular anotação:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.get('/get-anotacoes/:idSocioVeiculoAgenda', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda } = req.params;
    if (!idSocioVeiculoAgenda) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda é obrigatório' 
      });
    }
    const anotacoes = await db.query(`
      SELECT * FROM SociosVeiculosAgendaExecucaoAnotacoes
      WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
    `, { idSocioVeiculoAgenda });
    return res.status(200).json({
      message: 'Anotações recuperadas com sucesso',
      anotacoes: anotacoes?.recordset
    });
  } catch (error) {
    console.error('Erro ao recuperar anotações:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.get('/get-notas-fiscais/:idSocioVeiculoAgenda', validateToken, async (req, res) => {
  try{

    const { idSocioVeiculoAgenda } = req.params;
    if (!idSocioVeiculoAgenda) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda é obrigatório' 
      });
    }
    const notasFiscais = await db.query(`
      SELECT * FROM SociosVeiculosAgendaNotasFiscais
      WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
    `, { idSocioVeiculoAgenda });
    
    return res.status(200).json({
      message: 'Notas fiscais recuperadas com sucesso',
      notas: notasFiscais?.recordset
    });

  }catch (error) {
    console.error('Erro ao recuperar notais fiscais:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/adicionar-nota-fiscal', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda, idPontoAtendimentoUsuario, notaFiscal, nomeArquivo, data } = req.body;
    if (!idSocioVeiculoAgenda || !idPontoAtendimentoUsuario || !notaFiscal || !nomeArquivo || !data) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda, idPontoAtendimentoUsuario, notaFiscal, nomeArquivo e data são obrigatórios' 
      });
    }

    let idSocioVeiculoAgendaNotaFiscalGenerated = Utils.generateUUID();

    await db.query(`
      INSERT INTO SociosVeiculosAgendaNotasFiscais (
        IdSocioVeiculoAgendaNotaFiscal,
        IdSocioVeiculoAgenda,
        IdUsuario,
        DataLog,
        Arquivo,
        NomeArquivo
      )
      VALUES (
        @idSocioVeiculoAgendaNotaFiscalGenerated,
        @idSocioVeiculoAgenda,
        @idPontoAtendimentoUsuario,
        @data,
        @notaFiscal,
        @nomeArquivo
      );
    `, { 
      idSocioVeiculoAgendaNotaFiscalGenerated,
      idSocioVeiculoAgenda,
      idPontoAtendimentoUsuario,
      data,
      notaFiscal,
      nomeArquivo
    });

    return res.status(200).json({
      message: 'Nota fiscal adicionada com sucesso',
      notaFiscal: idSocioVeiculoAgendaNotaFiscalGenerated
    });

  }catch (error) {
    console.error('Erro ao adicionar nota fiscal:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/deletar-nota-fiscal', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgendaNotaFiscal } = req.body;
    if (!idSocioVeiculoAgendaNotaFiscal) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgendaNotaFiscal é obrigatório' 
      });
    }
    await db.query(`
      DELETE FROM SociosVeiculosAgendaNotasFiscais
      WHERE IdSocioVeiculoAgendaNotaFiscal = @idSocioVeiculoAgendaNotaFiscal;
    `, { idSocioVeiculoAgendaNotaFiscal });
    return res.status(200).json({
      message: 'Nota fiscal deletada com sucesso'
    });
  }catch (error) {
    console.error('Erro ao deletar nota fiscal:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.get('/get-laudos/:idSocioVeiculoAgenda', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda } = req.params;
    if (!idSocioVeiculoAgenda) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda é obrigatório' 
      });
    }
    const laudos = await db.query(`
      SELECT * FROM SociosVeiculosAgendaLaudos
      WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda;
    `, { idSocioVeiculoAgenda });
    return res.status(200).json({
      message: 'Laudos recuperados com sucesso',
      laudos: laudos?.recordset
    });
  }catch (error) {
    console.error('Erro ao recuperar laudos:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/adicionar-laudo', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgenda, idPontoAtendimentoUsuario, nomeArquivo, data } = req.body;
    if (!idSocioVeiculoAgenda || !idPontoAtendimentoUsuario || !nomeArquivo || !data) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgenda, idPontoAtendimentoUsuario, laudo, nomeArquivo e data são obrigatórios' 
      });
    }
    let idSocioVeiculoAgendaLaudoGenerated = Utils.generateUUID();
    await db.query(`
      INSERT INTO SociosVeiculosAgendaLaudos (
        IdSocioVeiculoAgendaLaudo,
        IdSocioVeiculoAgenda,
        IdUsuario,
        DataLog,
        Arquivo,
        NomeArquivo
      )
      VALUES (
        @idSocioVeiculoAgendaLaudoGenerated,
        @idSocioVeiculoAgenda,
        @idPontoAtendimentoUsuario,
        @data,
        @nomeArquivo,
        @nomeArquivo
      );
    `, { 
      idSocioVeiculoAgendaLaudoGenerated,
      idSocioVeiculoAgenda,
      idPontoAtendimentoUsuario,
      data,
      nomeArquivo,
      nomeArquivo
    });
    return res.status(200).json({
      message: 'Laudo adicionado com sucesso',
      laudo: idSocioVeiculoAgendaLaudoGenerated
    });
  }catch (error) {
    console.error('Erro ao adicionar laudo:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

router.post('/deletar-laudo', validateToken, async (req, res) => {
  try{
    const { idSocioVeiculoAgendaLaudo } = req.body;
    if (!idSocioVeiculoAgendaLaudo) {
      return res.status(400).json({ 
        message: 'Dados incompletos: idSocioVeiculoAgendaLaudo é obrigatório' 
      });
    }
    await db.query(`
      DELETE FROM SociosVeiculosAgendaLaudos
      WHERE IdSocioVeiculoAgendaLaudo = @idSocioVeiculoAgendaLaudo;
    `, { idSocioVeiculoAgendaLaudo });
    return res.status(200).json({
      message: 'Laudo deletado com sucesso'
    });
  }catch (error) {
    console.error('Erro ao deletar laudo:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
})

// Rota para listar motivações disponíveis
router.get('/lista-motivacoes', validateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * 
      FROM Motivacoes 
      WHERE AtivoInativo = 'A' 
      ORDER BY CAST(Descricao AS NVARCHAR(MAX)) DESC;
    `);
    
    let motivacoes = result.recordset;

    return res.status(200).json({
      motivacoes
    });
  } catch (error) {
    console.error('Erro ao buscar motivações:', error);
    return res.status(400).json({ message: error.message, data: null });
  }
});

module.exports = router;