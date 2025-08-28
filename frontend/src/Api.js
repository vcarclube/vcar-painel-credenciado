import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;

const getUriUploadPath = (filename) => {
    return `${API_BASE}/uploads/files/${filename}`;
}

const Api = {
    getUriUploadPath,
    auth: async (token) => {
        let forceToken = Environment.HEADERS || { headers: {
            authToken: token || localStorage.getItem('authToken'),
        }};

        return await axios.get(`${API_BASE}/credenciado/auth`, forceToken).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    get: async (token) => {
        
        let forceToken = Environment.HEADERS || { headers: {
            authToken: token || localStorage.getItem('authToken'),
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
    }
}

export default Api;