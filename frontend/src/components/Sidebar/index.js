import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({
    operacoes: false,
    financeiro: false,
    informacoes: false
  });

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/logo_black.png" alt="Logo" className="logo-image" />
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {/* Agenda */}
        <div className="sidebar-item" onClick={() => navigate('/')}>
          <div className={`sidebar-link ${(location.pathname === '/' || location.pathname.includes('execucao-os')) ? 'active' : ''}`}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Agenda</span>
          </div>
        </div>

        {/* Avaliações */}
        <div className="sidebar-item" onClick={() => navigate('/avaliacoes')}>
          <div className={`sidebar-link ${(location.pathname === '/avaliacoes') ? 'active' : ''}`}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
            <span>Avaliações</span>
          </div>
        </div>

        {/* Dropdown Operações */}
        <div className="sidebar-item">
          <div 
            className={`sidebar-link dropdown-toggle ${openDropdowns.operacoes ? 'active-dropdown' : ''}`}
            onClick={() => toggleDropdown('operacoes')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Operações</span>
            <svg className={`dropdown-arrow ${openDropdowns.operacoes ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          {openDropdowns.operacoes && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate('/retorno-servico')}>
                <span>Retorno de Serviço</span>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Financeiro */}
        <div className="sidebar-item">
          <div 
            className={`sidebar-link dropdown-toggle ${openDropdowns.financeiro ? 'active-dropdown' : ''}`}
            onClick={() => toggleDropdown('financeiro')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Financeiro</span>
            <svg className={`dropdown-arrow ${openDropdowns.financeiro ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          {openDropdowns.financeiro && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate('/espelho')}>
                <span>Espelho</span>
              </div>
              <div className="dropdown-item" onClick={() => navigate('/dados-bancarios')}>
                <span>Dados Bancários</span>
              </div>
            </div>
          )}
        </div>

        {/* Suporte */}
        <div className="sidebar-item">
          <div className="sidebar-link">
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 11a3 3 0 1 1 6 0c0 2-3 3-3 3"></path>
              <circle cx="12" cy="17" r=".02"></circle>
            </svg>
            <span>Suporte</span>
          </div>
        </div>

        {/* Dropdown Informações */}
        <div className="sidebar-item">
          <div 
            className={`sidebar-link dropdown-toggle ${openDropdowns.informacoes ? 'active-dropdown' : ''}`}
            onClick={() => toggleDropdown('informacoes')}
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Informações</span>
            <svg className={`dropdown-arrow ${openDropdowns.informacoes ? 'rotated' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          {openDropdowns.informacoes && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <span>Contratos</span>
              </div>
              <div className="dropdown-item">
                <span>Política de Privacidade</span>
              </div>
              <div className="dropdown-item">
                <span>Termos de Uso</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
