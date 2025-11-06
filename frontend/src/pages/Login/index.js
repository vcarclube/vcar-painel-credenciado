import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MainContext } from '../../helpers/MainContext';
import { Button, Input } from '../../components';
import './style.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { authenticated, login } = useContext(MainContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      // Redirecionamento será feito automaticamente pelo Navigate
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <img src="/logo_black.png" alt="Logo" className="login-logo" />
            <h1 className="login-title">Bem-vindo de volta</h1>
            <p className="login-subtitle">Faça login em sua conta para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <div className="password-input-container">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Lembrar de mim
              </label>
              <a style={{display: 'none'}} href="#" className="forgot-password">Esqueceu a senha?</a>
            </div>

            <Button
              type="submit"
              className="login-button"
              disabled={loading || !email || !password}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="login-footer">
            <p>Não tem uma conta? <a href="https://credenciado.vcarclube.com.br/precadastro.html" className="signup-link">Cadastre-se</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
