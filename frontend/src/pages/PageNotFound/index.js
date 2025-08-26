import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { Header, Sidebar, BottomNavigation } from '../../components';
import './style.css';

const PageNotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="pagenotfound-container">
      <div className="main-content" style={{margin: '0 auto'}}>
        <div className="content-area">
          <div className="pagenotfound-content">
            <div className="pagenotfound-icon">
              <FaExclamationTriangle />
            </div>
            
            <div className="pagenotfound-text">
              <h1 className="pagenotfound-title">404</h1>
              <h2 className="pagenotfound-subtitle">Página não encontrada</h2>
              <p className="pagenotfound-description">
                Ops! A página que você está procurando não existe ou foi movida.
              </p>
            </div>
            
            <div className="pagenotfound-actions">
              <button 
                className="pagenotfound-btn pagenotfound-btn-primary"
                onClick={handleGoHome}
              >
                <FaHome />
                <span>Ir para o Início</span>
              </button>
              
              <button 
                className="pagenotfound-btn pagenotfound-btn-secondary"
                onClick={handleGoBack}
              >
                <FaArrowLeft />
                <span>Voltar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
