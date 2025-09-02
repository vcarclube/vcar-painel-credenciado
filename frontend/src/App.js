import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { MainContext } from "./helpers/MainContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './global.css';

import { Login, PageNotFound, Loading, Privacy, Terms, Agenda, ExecucaoOS, Avaliacoes, RetornoServico, DadosBancarios, DadosCadastrais, EspelhoFinanceiro, Scanner, Suporte } from './pages';
import Api from './Api';

const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error('useMainContext deve ser usado dentro de um MainContextProvider');
  }
  return context;
};

const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useMainContext();
  const location = useLocation();
  if (loading) {
    return <Loading />;
  }
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicRoute = ({ children, restricted = false }) => {
  const { authenticated, loading } = useMainContext();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (authenticated && restricted) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  return children;
};

function App() {

  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simular verificação de token ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setAuthenticated(true);
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      setLoading(false);
    };

    // Simular delay de carregamento
    setTimeout(checkAuth, 1000);
  }, []);

  const login = async (email, password) => {
    // Validação de entrada
    if (!email || !password) {
      toast.error('Email e senha são obrigatórios');
      return;
    }

    try {
      // 1. Fazer login
      const loginResponse = await Api.login({ email, password });

      if (loginResponse.status !== 200) {
        const errorMessage = loginResponse?.response?.data?.message || 'Erro no login';
        toast.error(errorMessage);
        return;
      }

      // 2. Sucesso no login
      toast.success(loginResponse.data?.message);
      const token = loginResponse.data?.token;
      await localStorage.setItem('authToken', token);
      let _token = await localStorage.getItem('authToken');

      // 3. Verificar autenticação
      const authResponse = await Api.auth(_token);
      if (authResponse.status !== 200) {
        toast.error('Erro na verificação de autenticação');
        return;
      }

      // 4. Buscar dados do usuário
      const userResponse = await Api.get(_token);
      if (userResponse.status !== 200) {
        toast.error('Erro ao buscar dados do usuário');
        return;
      }

      // 5. Finalizar processo de login
      localStorage.setItem('userData', JSON.stringify(userResponse.data?.data));
      setAuthenticated(true);

      window.location.reload();

    } catch (error) {
      console.error('Erro durante o login:', error);
      const errorMessage = error?.response?.data?.message || 'Erro interno do servidor';
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setAuthenticated(false);
  };

  const contextValue = {
    authenticated,
    user,
    setUser,
    loading,
    login,
    logout,
  };


  return (
    <MainContext.Provider value={contextValue}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute restricted>
                <Login />
              </PublicRoute>
            }
          />

          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Rotas privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Agenda />
              </PrivateRoute>
            }
          />
          <Route
            path="/execucao-os/:idSocioVeiculoAgenda"
            element={
              <PrivateRoute>
                <ExecucaoOS />
              </PrivateRoute>
            }
          />
          <Route
            path="/avaliacoes"
            element={
              <PrivateRoute>
                <Avaliacoes />
              </PrivateRoute>
            }
          />
          <Route
            path="/retorno-servico"
            element={
              <PrivateRoute>
                <RetornoServico />
              </PrivateRoute>
            }
          />
          <Route
            path="/dados-bancarios"
            element={
              <PrivateRoute>
                <DadosBancarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/dados-cadastrais"
            element={
              <PrivateRoute>
                <DadosCadastrais />
              </PrivateRoute>
            }
          />
          <Route
            path="/espelho"
            element={
              <PrivateRoute>
                <EspelhoFinanceiro />
              </PrivateRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <PrivateRoute>
                <Scanner />
              </PrivateRoute>
            }
          />
          {/*<Route
            path="/suporte"
            element={
              <PrivateRoute>
                <Suporte />
              </PrivateRoute>
            }
          />*/}

          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 999999 }}
        />
      </Router>
    </MainContext.Provider>
  );
}

export default App;
