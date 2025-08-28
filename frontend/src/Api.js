import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;

const Api = {
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
    cancelar: async ({idSocioVeiculoAgenda, motivo}) => {
        return await axios.post(`${API_BASE}/agendamentos/cancelar`, {idSocioVeiculoAgenda, motivo}, Environment.HEADERS).then(async (response) => {
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
    }
}

export default Api;