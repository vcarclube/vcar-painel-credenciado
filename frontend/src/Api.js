import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;

const getUriUploadPath = (filename) => {
  return `${API_BASE}/uploads/files/${encodeURIComponent(filename)}`;
};

const Api = {
    getUriUploadPath,
    auth: async (token) => {
        let forceToken = { headers: {
            authToken: token,
        }};

        return await axios.get(`${API_BASE}/credenciado/auth`, forceToken).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    get: async (token) => {
        
        let forceToken = { headers: {
            authToken: token,
        }};

        return await axios.get(`${API_BASE}/credenciado/get`, forceToken).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getFile: async (filename) => {
        return await axios.get(`${API_BASE}/uploads/files/${filename}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    upload: async (formData) => {
        try {
            const response = await axios.post(
                `${API_BASE}/uploads/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        ...Environment.HEADERS.headers
                    }
                }
            )
            return response.data // axios já retorna JSON
        } catch (err) {
            console.error("Erro no Api.upload:", err)
            throw err
        }
    },
    login: async ({ email, password }) => {
        return await axios.post(`${API_BASE}/credenciado/login`, { email, password }).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    agendamentos: async ({idPontoAtendimento}) => {
        return await axios.get(`${API_BASE}/agendamentos/lista/${idPontoAtendimento}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    reagendar: async ({idSocioVeiculoAgenda, idPontoAtendimento, idSocio, idSocioVeiculo, data, hora, motivo}) => {
        return await axios.post(`${API_BASE}/agendamentos/reagendar`, {idSocioVeiculoAgenda, idPontoAtendimento, idSocio, idSocioVeiculo, data, hora, motivo}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    cancelar: async ({idSocioVeiculoAgenda, motivo, idPontoAtendimento, idSocio, idSocioVeiculo }) => {
        return await axios.post(`${API_BASE}/agendamentos/cancelar`, {idSocioVeiculoAgenda, idPontoAtendimento, idSocio, idSocioVeiculo, motivo}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    iniciar: async ({idSocioVeiculoAgenda, idPontoAtendimentoUsuario, idSocio, data, hora }) => {
        return await axios.post(`${API_BASE}/agendamentos/iniciar`, {idSocioVeiculoAgenda, idPontoAtendimentoUsuario, idSocio, data, hora }, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    listaHorariosDisponiveis: async ({idPontoAtendimento, dataAgendamento, dataAtual, horaAtual}) => {
        return await axios.post(`${API_BASE}/agendamentos/lista-horarios-disponiveis`, {idPontoAtendimento, dataAgendamento, dataAtual, horaAtual}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    atualizarVideoInicial: async ({idSocioVeiculoAgenda, videoInicial}) => {
        return await axios.post(`${API_BASE}/agendamentos/atualizar-video-inicial`, {idSocioVeiculoAgenda, videoInicial}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    atualizarVideoFinal: async ({idSocioVeiculoAgenda, videoFinal}) => {
        return await axios.post(`${API_BASE}/agendamentos/atualizar-video-final`, {idSocioVeiculoAgenda, videoFinal}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getAgendamentoDetails: async ({idSocioVeiculoAgenda}) => {
        return await axios.get(`${API_BASE}/agendamentos/get/${idSocioVeiculoAgenda}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getPontoAtendimentoServicos: async ({idPontoAtendimento}) => {
        return await axios.get(`${API_BASE}/ponto-atendimento/servicos/${idPontoAtendimento}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getServicosVinculadosAgendamento: async ({idSocioVeiculoAgenda}) => {
        return await axios.get(`${API_BASE}/agendamentos/servicos-vinculados/${idSocioVeiculoAgenda}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    vincularServicoAgendamento: async ({idPontoAtendimentoUsuario, idSocioVeiculoAgenda, idServico}) => {
        return await axios.post(`${API_BASE}/agendamentos/vincular-servico`, {idPontoAtendimentoUsuario, idSocioVeiculoAgenda, idServico}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    desvincularServicoAgendamento: async ({idSocioVeiculoAgendaExecucaoServico}) => {
        return await axios.post(`${API_BASE}/agendamentos/desvincular-servico`, {idSocioVeiculoAgendaExecucaoServico}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    adicionaFotoAgendamento: async ({idSocioVeiculoAgenda, idPontoAtendimentoUsuario, foto}) => {
        return await axios.post(`${API_BASE}/agendamentos/adicionar-foto`, {idSocioVeiculoAgenda, idPontoAtendimentoUsuario, foto}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    deletaFotoAgendamento: async ({idSocioVeiculoAgendaExecucaoFoto}) => {
        return await axios.post(`${API_BASE}/agendamentos/deletar-foto`, {idSocioVeiculoAgendaExecucaoFoto}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getFotosAgendamento: async ({idSocioVeiculoAgenda}) => {
        return await axios.get(`${API_BASE}/agendamentos/get-fotos/${idSocioVeiculoAgenda}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getAnotacoesAgendamento: async ({idSocioVeiculoAgenda}) => {
        return await axios.get(`${API_BASE}/agendamentos/get-anotacoes/${idSocioVeiculoAgenda}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    adicionarAnotacaoAgendamento: async ({idSocioVeiculoAgenda, idPontoAtendimentoUsuario, anotacao, data}) => {
        return await axios.post(`${API_BASE}/agendamentos/adicionar-anotacao`, {idSocioVeiculoAgenda, idPontoAtendimentoUsuario, anotacao, data}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    deleteAnotacaoAgendamento: async ({idSocioVeiculoAgendaExecucaoAnotacao}) => {
        return await axios.post(`${API_BASE}/agendamentos/deletar-anotacao`, {idSocioVeiculoAgendaExecucaoAnotacao}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    adicionarNotaFiscalAgendamento: async ({idSocioVeiculoAgenda, idPontoAtendimentoUsuario, notaFiscal, nomeArquivo, data}) => {
        return await axios.post(`${API_BASE}/agendamentos/adicionar-nota-fiscal`, {idSocioVeiculoAgenda, idPontoAtendimentoUsuario, notaFiscal, nomeArquivo, data}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    deletarNotaFiscalAgendamento: async ({idSocioVeiculoAgendaNotaFiscal}) => {
        return await axios.post(`${API_BASE}/agendamentos/deletar-nota-fiscal`, {idSocioVeiculoAgendaNotaFiscal}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getNotasFiscaisAgendamento: async ({idSocioVeiculoAgenda}) => {
        return await axios.get(`${API_BASE}/agendamentos/get-notas-fiscais/${idSocioVeiculoAgenda}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getLaudosAgendamento: async ({idSocioVeiculoAgenda}) => {
        return await axios.get(`${API_BASE}/agendamentos/get-laudos/${idSocioVeiculoAgenda}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    deletarLaudoAgendamento: async ({idSocioVeiculoAgendaLaudo}) => {
        return await axios.post(`${API_BASE}/agendamentos/deletar-laudo`, {idSocioVeiculoAgendaLaudo}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    adicionarLaudoAgendamento: async ({idSocioVeiculoAgenda, idPontoAtendimentoUsuario, laudo, nomeArquivo, data}) => {
        return await axios.post(`${API_BASE}/agendamentos/adicionar-laudo`, {idSocioVeiculoAgenda, idPontoAtendimentoUsuario, laudo, nomeArquivo, data}, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getAvaliacaoMediaPontoAtendimento: async ({idPontoAtendimento}) => {
         return await axios.get(`${API_BASE}/avaliacoes/get-average/${idPontoAtendimento}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getAvaliacoesPontoAtendimento: async ({idPontoAtendimento}) => {
        return await axios.get(`${API_BASE}/avaliacoes/get-all/${idPontoAtendimento}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    getAgendamentoPontoAtendimentoByPlaca: async ({idPontoAtendimento, placa}) => {
        return await axios.get(`${API_BASE}/scanner/get-agendamento-pontoatendimento-by-placa/${idPontoAtendimento}/${placa}`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    }
}

export default Api;