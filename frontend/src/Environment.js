// Detecta modo de execução automaticamente
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

// Domínio padrão de produção (fallback)
const DEFAULT_PROD_API = "https://vcar-clube-vcar-painel-credenciado-backend.pvuzyy.easypanel.host";

// Resolve a base da API dinamicamente:
// 1) REACT_APP_API_BASE (variável de ambiente do build)
// 2) window.__API_BASE__ (injetado em runtime, se existir)
// 3) localhost em dev, domínio padrão em prod
const API_BASE = (() => {
  const envBase = process.env.REACT_APP_API_BASE;
  if (envBase && envBase.trim()) return envBase.trim();
  if (typeof window !== 'undefined' && window.__API_BASE__) {
    const runtimeBase = String(window.__API_BASE__).trim();
    if (runtimeBase) return runtimeBase;
  }
  return DEVELOPMENT_MODE ? "http://localhost:3001" : DEFAULT_PROD_API;
})();

// HEADERS dinâmicos para sempre pegar o token atual do localStorage
const Environment = {
  API_BASE,
  HEADERS: {
    get headers() {
      return {
        authToken: localStorage.getItem("authToken"),
      };
    }
  },
};

export default Environment;