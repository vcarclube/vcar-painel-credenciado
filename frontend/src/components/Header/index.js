import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainContext } from '../../helpers/MainContext';
import './style.css';

export default function Header() {
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(MainContext);
  const dropdownRef = useRef(null);
  const [descricao, setDescricao] = useState(null);
  const [logoSrc, setLogoSrc] = useState(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ler 'Descricao' e 'Logotipo' do localStorage.userData
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDescricao(parsed?.Descricao || null);
        setLogoSrc('https://adm.vcarclube.com.br/'+parsed?.Logotipo || null);
      }
    } catch (e) {
      // Ignorar erros de parse
    }
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-logo-mobile" onClick={() => {navigate('/')}}>
          <img src="/logo_black.png" alt="Logo" className="logo-mobile" />
        </div>
        <div className="header-user" ref={dropdownRef}>
          <div className="user-info" onClick={toggleDropdown}>
            <img 
              src={logoSrc || user.Logotipo || user.avatar || '/logo_black.png'} 
              alt={user.name} 
              className="user-avatar"
            />
            <span className="user-name">{descricao || user.name}</span>
            <svg 
              className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <img 
                  src={logoSrc || user.Logotipo || user.avatar || '/logo_black.png'} 
                  alt={user.name} 
                  className="dropdown-avatar"
                />
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{user.name}</span>
                  <span className="dropdown-email">{user.email}</span>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu-header">
                <button className="dropdown-item" style={{padding: '16px 8px', display: 'flex', gap: '10px', alignItems: 'center'}} onClick={() => navigate('/dados-cadastrais')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <div>Dados Cadastrais</div>
                </button>
                
                <button className="dropdown-item logout" style={{padding: '16px 8px', display: 'flex', gap: '10px', alignItems: 'center'}} onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <div>Sair</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}