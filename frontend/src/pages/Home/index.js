import React from 'react';
import { Header, Sidebar, BottomNavigation } from '../../components';
import './style.css';

function Home() {
  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <div className="welcome-section">
            <h1>Bem-vindo ao Painel</h1>
            <p>Gerencie suas operações de forma eficiente e organizada.</p>
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="card-content">
                <h3>Agenda</h3>
                <p>Visualize e gerencie seus compromissos</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
              </div>
              <div className="card-content">
                <h3>Avaliações</h3>
                <p>Acompanhe o feedback dos clientes</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="card-content">
                <h3>Financeiro</h3>
                <p>Controle suas finanças e relatórios</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 11a3 3 0 1 1 6 0c0 2-3 3-3 3"></path>
                  <circle cx="12" cy="17" r=".02"></circle>
                </svg>
              </div>
              <div className="card-content">
                <h3>Suporte</h3>
                <p>Obtenha ajuda quando precisar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

export default Home;
