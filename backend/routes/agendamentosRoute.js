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

router.post('/reagendar', async (req, res) => {
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

router.post('/cancelar', async (req, res) => {
  try {
    const { idSocioVeiculoAgenda, motivo } = req.body;
    if (!idSocioVeiculoAgenda || !motivo ) {
      return res.status(400).json({ 
        message: 'Dados incompletos' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
})

module.exports = router;