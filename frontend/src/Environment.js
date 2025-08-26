const DEVELOPMENT_MODE = false;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "http://localhost:3001",
    HEADERS: { 
        headers: { 
            authToken: localStorage.getItem("authToken"),
        } 
    },
}

export default Environment;