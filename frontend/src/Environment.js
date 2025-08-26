const DEVELOPMENT_MODE = false;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "https://vcar-clube-vcar-painel-credenciado-backend.pvuzyy.easypanel.host/",
    HEADERS: { 
        headers: { 
            authToken: localStorage.getItem("authToken"),
        } 
    },
}

export default Environment;