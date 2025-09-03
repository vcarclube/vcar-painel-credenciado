const db = require('./database')
const ftp = require("basic-ftp")
const fs = require("fs")

const DEVELOPMENT_MODE = true;

const formatarData = (data, hora) => {
    const d = new Date(data);
    let formatted = d.toLocaleDateString("pt-BR");
    if (hora) {
        formatted += " " + hora;
    }
    return formatted;
}

const formatarDataHora = (data) => {
    const d = new Date(data);
    return d.toLocaleString("pt-BR");
}

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const formatHourString = (dateStr) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);

    const brasiliaOffsetMs = (DEVELOPMENT_MODE ? 0 : 3) * 60 * 60 * 1000;
    const dateBrasilia = new Date(date.getTime() - brasiliaOffsetMs);

    const hours = String(dateBrasilia.getUTCHours()).padStart(2, '0');
    const minutes = String(dateBrasilia.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dateBrasilia.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

const gerarNumeroAleatorio = () => {
  const numero = Math.floor(Math.random() * 1_000_000_000);
  return numero.toString().padStart(9, "0");
}

async function uploadToFTP(localPath, remotePath, onProgress) {
    const client = new ftp.Client()
    client.ftp.verbose = true

    try {
        await client.access({
            host: "216.158.231.74",
            user: "vcarclub",
            password: "7U@gSNCc",
            secure: false
        })

        console.log("Conectado ao FTP")

        // Cria a pasta /uploads caso não exista
        await client.ensureDir("/uploads")
        await client.cd("/uploads")

        // Callback de progresso
        client.trackProgress(info => {
            if (onProgress) {
                const progress = Math.round((info.bytes / info.bytesOverall) * 100)
                onProgress(progress)
            }
        })

        // Faz upload
        await client.uploadFrom(localPath, remotePath)

        console.log("Upload concluído")
    } catch (err) {
        console.error("Erro no FTP:", err)
        throw err
    } finally {
        client.close()
    }
}

module.exports = {
    generateUUID,
    formatHourString,
    uploadToFTP,
    formatarData,
    formatarDataHora,
    gerarNumeroAleatorio,
    getAgendamentoById: async (idSocioVeiculoAgenda) => {
        let result = await db.query(`
            SELECT *
            FROM SociosVeiculosAgenda
            WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        `, { idSocioVeiculoAgenda });
        return result.recordset[0];
    },
    getSocioById: async (idSocio) => {
        let result = await db.query(`
            SELECT IdSocio, Cpf, Nome, Email, Telefone, FcmToken
            FROM Socios
            WHERE IdSocio = @idSocio
        `, { idSocio });
        return result.recordset[0];
    },
    getSocioVeiculoById: async (idSocioVeiculo) => {
        let result = await db.query(`
            SELECT 
                A.IdSocioVeiculo, A.IdSocio, A.IdMarca, A.IdVeiculo, A.Ano, A.Placa, A.Litragem,
                B.Descricao AS MarcaVeiculo,
                C.Descricao AS VeiculoModelo
            FROM SociosVeiculos AS A
            INNER JOIN Marcas AS B ON A.IdMarca = B.IdMarca
            INNER JOIN Veiculos AS C ON A.IdVeiculo = C.IdVeiculo
            WHERE A.IdSocioVeiculo = @idSocioVeiculo
        `, { idSocioVeiculo });
        return result.recordset[0];
    },
    getPontoAtendimentoById: async (idPontoAtendimento) => {
        let result = await db.query(`
            SELECT A.*, B.*
            FROM PontosAtendimento AS A
            INNER JOIN PontosAtendimentoUsuarios AS B ON A.IdPontoAtendimento=B.IdPontoAtendimento
            WHERE A.IdPontoAtendimento = @idPontoAtendimento
        `, { idPontoAtendimento });
        return result.recordset[0];
    },
    getMotivacaoById: async (idMotivacao) => {
        let result = await db.query(`
            SELECT *
            FROM Motivacoes
            WHERE IdMotivacao = @idMotivacao
        `, { idMotivacao });
        return result.recordset[0];
    },
    getAgendamentoExecucao: async (idSocioVeiculoAgenda) => {
        let result = await db.query(`
            SELECT 
            A.* ,
            B.Nome AS ExecutorInicio,
            C.Nome AS ExecutorFim
            FROM SociosVeiculosAgendaExecucao AS A
            LEFT JOIN PontosAtendimentoUsuarios AS B ON A.IdUsuarioInicio = B.IdPontoAtendimentoUsuario
            LEFT JOIN PontosAtendimentoUsuarios AS C ON A.IdUsuarioFim = C.IdPontoAtendimentoUsuario
            WHERE A.IdSocioVeiculoAgenda = @idSocioVeiculoAgenda`, { idSocioVeiculoAgenda });
        return result.recordset[0];
    },
    getSocioVeiculoByIdSocioVeiculoAgenda: async (idSocioVeiculoAgenda) => {
        let result = await db.query(`
            SELECT IdSocioVeiculo
            FROM SociosVeiculosAgenda
            WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        `, { idSocioVeiculoAgenda });
        return result.recordset[0];
    },
    getMotivacaoIdSocioVeiculoAgenda: async (idSocioVeiculoAgenda) => {
        let result = await db.query(`
            SELECT IdMotivacao
            FROM SociosVeiculosAgenda
            WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        `, { idSocioVeiculoAgenda });
        return result.recordset[0];
    },
    getFinanceiroEspelhoIdSocioVeiculoAgenda: async (idSocioVeiculoAgenda) => {
        let result = await db.query(`
            SELECT IdFinanceiroEspelho
            FROM FinanceiroEspelho
            WHERE IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
        `, { idSocioVeiculoAgenda });
        return result.recordset[0];
    },
    notificarPontoAtendimento: async (data) => {
        const { idPontoAtendimento, titulo, conteudo, canais = 0, tipo = 1, lido } = data;
        let idNotificacao = generateUUID();
        await db.query(`
            INSERT INTO NotificacaoPontoAtendimento 
            (IdNotificacao, IdPontoAtendimento, Titulo, Conteudo, Canais, Tipo, Lido) 
            VALUES (@idNotificacao, @idPontoAtendimento, @titulo, @conteudo, @canais, @tipo, @lido)
        `, { idNotificacao: idNotificacao, idPontoAtendimento, titulo, conteudo, canais, tipo, lido });
        return true;
    },
    notificarWhatsapp: async (modelo) => {
        try {
            const instaciaZapi = '3CE4B754983A50C28047EEE17BD0D626';
            const tokenZapi = '292527328B6AC28FA057BFE5';
            const clientToken = 'Fa9be4d3c3cff47cb84b5d28e5ce3d58aS';

            // Tratar número de telefone destino
            modelo.phone = (modelo.phone || "").replace(/[()]/g, "");
            modelo.phone = modelo.phone.replace(/-/g, "");
            modelo.phone = modelo.phone.replace(/\s/g, "");
            modelo.phone = modelo.phone.trim();
            if (modelo.phone.length <= 11) modelo.phone = "55" + modelo.phone;
            modelo.phone = modelo.phone.replace(/\+/g, "");

            // Enviar Dados
            let url = `https://api.z-api.io/instances/${instaciaZapi}/token/${tokenZapi}/send-text`;

            if (modelo.linkUrl && modelo.linkUrl.trim() !== "") {
                const linkEncurtado = await encurtadorUrl(modelo.linkUrl);
                modelo.message = linkEncurtado;
                modelo.linkUrl = linkEncurtado;
                url = `https://api.z-api.io/instances/${instaciaZapi}/token/${tokenZapi}/send-link`;
            }

            const dados = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Token': clientToken
                },
                body: JSON.stringify(modelo)
            };

            const response = await fetch(url, dados);

            return response.ok
                ? "ok"
                : `Erro ao enviar: ${response.status} - ${response.statusText}`;

        } catch (ex) {
            throw new Error(`Erro ao enviar: ${ex.message}`);
        }
    },
    notificarFirebaseCloudMessaging: async (firebaseMessageSocioRequest) => {
        try {
            const apiBaseUrl = 'https://vcar-clube-vcar-cloud-message.pvuzyy.easypanel.host/api/firebase';

            const endpoint = `${apiBaseUrl}/enviarFirebasePushNotification`;

            const requestBody = {
                idSocio: firebaseMessageSocioRequest.idSocio,
                title: firebaseMessageSocioRequest.title,
                body: firebaseMessageSocioRequest.body
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseContent = await response.text();

            console.log(responseContent);

            if (response.ok) {
                const result = JSON.parse(responseContent);
                console.log(`Sucesso: ${result.success}`);
                return result.success;
            } else {
                console.log(`Erro HTTP: ${response.status} - ${responseContent}`);
                return false;
            }

        } catch (error) {
            // Tratamento específico para diferentes tipos de erro
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log(`Erro de rede ao enviar notificação única: ${error.message}`);
            } else if (error.name === 'AbortError') {
                console.log(`Timeout ao enviar notificação única: ${error.message}`);
            } else {
                console.log(`Erro inesperado ao enviar notificação única: ${error.message}`);
            }
            return false;
        }
    },
    getServicoByNameReserva: async () => {
        let result = await db.query(`
                SELECT
                A.IdServico,
                A.Descricao,
                LEFT(CONVERT(VARCHAR, TempoMedio),5) AS TempoMedio,
                A.IdUsuario,
                A.DataLog,
                A.AtivoInativo,
                A.ValorServico,
                A.ValorRepasse,
                A.Observacoes,
                B.Nome,
                A.LimiteAnual,
                A.ValorAdicional,
                A.Visivel,
                A.Garantia,
                A.TipoVeiculo,
                A.Tipo,
                A.FornecidoPelaVcar
                FROM Servicos AS A
                JOIN Usuarios AS B
                ON A.IdUsuario = B.IdUsuario
                WHERE A.AtivoInativo = 'A' AND A.Tipo='RESERVA';
            `, {});
        
        return result.recordset[0];
    },
    getServicoTrocaDeOleoByVeiculoTipo: async (motivacaoTrocaDeOleo, tipoVeiculo) => {
        let result = await db.query(`
                SELECT IdServico FROM Servicos WHERE Tipo=@motivacaoTrocaDeOleo AND TipoVeiculo=@tipoVeiculo AND AtivoInativo='A';
            `, {motivacaoTrocaDeOleo, tipoVeiculo});
        return result.recordset[0];
    },
    getSocioVeiculoCapacidadeLitros: async (idSocioVeiculo) => {
        let result = await db.query(`
            SELECT Litragem 
            FROM SociosVeiculos 
            WHERE IdSocioVeiculo = @idSocioVeiculo;
        `, {idSocioVeiculo});
        return result.recordset[0];
    },
    criarListaFinanceiroEspelho: async (idSocioVeiculoAgenda) => {
        let result = await db.query(`
            SELECT
                A.IdSocioVeiculoAgenda,
                A.IdSocioVeiculo,
                A.IdPontoAtendimento,
                A.DataAgendamento,
                A.HoraAgendamento,
                A.StatusAgendamento,
                A.ValorServico,
                A.NumeroOS,
                
                -- Dados do Ponto de Atendimento
                B.RazaoSocial,
                B.Cnpj,
                B.NumeroMatricula AS Matricula,
                
                -- Dados da Execução dos Serviços
                C.IdSocioVeiculoAgendaExecucaoServico,
                C.IdServico,
                C.PagamentoFeito,
                C.DataPagamento,
                
                -- Dados do Serviço
                D.Descricao AS NomeServico,
                D.ValorRepasse,
                
                -- Dados do Veículo
                E.Placa,
                
                -- Dados do Sócio
                F.IdSocio,
                F.Nome AS SocioNome,
                F.Cpf AS Cpf,
                
                -- Dados da Execução Principal
                G.IdSocioVeiculoAgendaExecucao,
                G.DataHoraInicio,
                G.DataHoraFim,
                
                -- Para o ORDER BY
                C.DataLog
            FROM SociosVeiculosAgenda A
            INNER JOIN PontosAtendimento B 
                ON A.IdPontoAtendimento = B.IdPontoAtendimento
            INNER JOIN SociosVeiculosAgendaExecucaoServicos C 
                ON A.IdSocioVeiculoAgenda = C.IdSocioVeiculoAgenda 
                AND C.StatusAprovacao = 'A'
            INNER JOIN Servicos D 
                ON C.IdServico = D.IdServico
            INNER JOIN SociosVeiculos E 
                ON A.IdSocioVeiculo = E.IdSocioVeiculo
            INNER JOIN Socios F 
                ON E.IdSocio = F.IdSocio
            LEFT JOIN SociosVeiculosAgendaExecucao G 
                ON A.IdSocioVeiculoAgenda = G.IdSocioVeiculoAgenda
            WHERE A.IdSocioVeiculoAgenda = @idSocioVeiculoAgenda
            AND A.StatusAgendamento = 'C'
            ORDER BY C.IdServico, C.DataLog
        `, { idSocioVeiculoAgenda });

        if (!result.recordset || result.recordset.length === 0) {
            return [];
        }

        const listaFinanceiroEspelho = result.recordset.map(item => {
            return {
                IdFinanceiroEspelho: generateUUID(),
                IdSocioVeiculoAgenda: item.IdSocioVeiculoAgenda,
                IdSocioVeiculo: item.IdSocioVeiculo,
                IdPontoAtendimento: item.IdPontoAtendimento,
                IdSocioVeiculoAgendaExecucaoServico: item.IdSocioVeiculoAgendaExecucaoServico ?? null,
                RazaoSocial: item.RazaoSocial || null,
                Cnpj: item.Cnpj || null,
                SocioNome: item.SocioNome || null,
                Matricula: item.Matricula || null,
                Placa: item.Placa || null,
                VeiculoPlaca: item.Placa || null,
                NomeServico: item.NomeServico || null,
                NumeroOS: item.NumeroOS || null,
                StatusAgendamento: item.StatusAgendamento || null,
                ValorRepasse: item.ValorRepasse ?? item.ValorServico ?? null,
                PagamentoFeito: item.PagamentoFeito ?? "N",
                DataAgendamento: item.DataAgendamento,
                DataPagamento: item.DataPagamento,
                DataExecucaoOS: item.DataHoraFim,
                CodigoEspelho: gerarNumeroAleatorio(),
                TipoEspelho: "Mensal",
                TipoComissao: "Básica",
                Descricao: "Comissao Basica Serviço - V1"
            };
        });

        return listaFinanceiroEspelho;
    },
    getAgendamentosByPontoAtendimento: async (idPontoAtendimento, dataAgendamento) => {
        let result = await db.query(`
            SELECT 
                sva.IdSocioVeiculoAgenda,
                sva.DataAgendamento,
                sva.HoraAgendamento,
                s.IdServico,
                s.Descricao,
                s.TempoMedio
            FROM SociosVeiculosAgenda sva
            INNER JOIN SociosVeiculosAgendaExecucaoServicos svaes 
                ON sva.IdSocioVeiculoAgenda = svaes.IdSocioVeiculoAgenda
            LEFT JOIN Servicos s 
                ON svaes.IdServico = s.IdServico
            WHERE sva.IdPontoAtendimento = @idPontoAtendimento 
                AND sva.DataAgendamento = @dataAgendamento 
                AND sva.StatusAgendamento = 'A'
            ORDER BY sva.IdSocioVeiculoAgenda
        `, { idPontoAtendimento, dataAgendamento });

        // Agrupar os resultados por agendamento
        const agendamentosMap = new Map();

        result.recordset.forEach(row => {
            const agendamentoId = row.IdSocioVeiculoAgenda;

            // Se o agendamento ainda não existe no Map, criar
            if (!agendamentosMap.has(agendamentoId)) {
                const agendamento = { 
                    DataAgendamento: row.DataAgendamento,
                    HoraAgendamento: row.HoraAgendamento,
                    servicosVinculados: []
                };
                agendamentosMap.set(agendamentoId, agendamento);
            }

            // Adicionar serviço SOMENTE se existir
            if (row.IdServico != null) {
                agendamentosMap.get(agendamentoId).servicosVinculados.push({
                    IdServico: row.IdServico,
                    Descricao: row.Descricao,
                    TempoMedio: formatHourString(row.TempoMedio)
                });
            }
        });

        return Array.from(agendamentosMap.values());
    },
    formatDateUS: (dateString) => {
        let dateParts = dateString?.split('/');
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    },
    formatDateString: (dateString) => {
        if (!dateString) return '';

        let date = new Date(dateString);
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        let year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },
    definirHorasInicioFimPorDiaDaSemana: (pontoAtendimento, dataString) => {
        let horaSelecionadaInicio = null;
        let horaSelecionadaFim = null;

        // Parse manual para yyyy-mm-dd como fuso de Brasília (UTC-3)
        const [ano, mes, dia] = dataString.split('-').map(Number);

        // Criar data ajustada para 03:00 UTC (equivalente à meia-noite em Brasília, UTC-3)
        const dataBrasilia = new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0));
        const diaSemana = dataBrasilia.getUTCDay(); // 0 (domingo) a 6 (sábado)

        const horaSegSexInicio = formatHourString(pontoAtendimento?.SegSexInicio);
        const horaSegSexFim = formatHourString(pontoAtendimento?.SegSexFim);
        const horaSabadoInicio = formatHourString(pontoAtendimento?.SabadoInicio);
        const horaSabadoFim = formatHourString(pontoAtendimento?.SabadoFim);
        const horaDomingoInicio = formatHourString(pontoAtendimento?.DomingoInicio);
        const horaDomingoFim = formatHourString(pontoAtendimento?.DomingoFim);

        if (diaSemana >= 1 && diaSemana <= 5) { // Segunda a sexta
            horaSelecionadaInicio = horaSegSexInicio;
            horaSelecionadaFim = horaSegSexFim;
        } else if (diaSemana === 6) { // Sábado
            horaSelecionadaInicio = horaSabadoInicio;
            horaSelecionadaFim = horaSabadoFim;
        } else if (diaSemana === 0) { // Domingo
            horaSelecionadaInicio = horaDomingoInicio;
            horaSelecionadaFim = horaDomingoFim;
        }

        return { horaSelecionadaInicio, horaSelecionadaFim };
    }

}