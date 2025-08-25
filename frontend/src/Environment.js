const DEVELOPMENT_MODE = false;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "http://localhost:3001",
    HEADERS: { 
        headers: { 
            VCAR_CREDENCIADO_DATA : localStorage.getItem("VCAR_CREDENCIADO_DATA")
        } 
    },
}

export default Environment;