import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiPlay, FiCalendar, FiX } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import CancelModal from '../../components/Modal/CancelModal';
import RescheduleModal from '../../components/Modal/RescheduleModal';
import StartModal from '../../components/Modal/StartModal';
import '../Home/style.css';
import './style.css';

const Agenda = () => {
  const navigate = useNavigate();
  
  // Estados para controlar os modais
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  const [agendamentos] = useState([
     {
      id: 3,
      numero: '1421',
      status: 'PENDENTE',
      pendencia: 'NÃO',
      data: '22/08/2025',
      hora: '16:00',
      credenciado: 'LUCAS CALHAMBEQUE',
      solicitante: 'DYLLAN NICOLAU DA SILVA',
      documento: 'CPF 69993-0507',
      veiculo: 'JEEP COMPASS 2021 / RCI-9FT1',
      servico: 'MANUTENÇÃO DO SISTEMA DE FREIO'
    },
    {
      id: 1,
      numero: '1410',
      status: 'EM ANDAMENTO',
      pendencia: 'NÃO',
      data: '08/08/2025',
      hora: '16:00',
      credenciado: 'TECHNO DEVICES 1',
      solicitante: 'DYLLAN NICOLAU DA SILVA',
      documento: 'CPF 69993-0507',
      veiculo: 'JEEP COMPASS 2021 / RCI-9FT1',
      servico: 'TROCA DE BIELETAS (PAR)'
    },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'EM ANDAMENTO':
        return 'status-em-andamento';
      case 'PENDENTE':
        return 'status-pendente';
      case 'CONCLUÍDO':
        return 'status-concluido';
      default:
        return '';
    }
  };

  const handleVerOS = (agendamento) => {
    // Navegar para a página de execução da OS
    navigate(`/execucao-os/${agendamento.id}`);
  };

  const handleIniciar = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowStartModal(true);
  };

  const handleReagendar = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowRescheduleModal(true);
  };

  const handleCancelar = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowCancelModal(true);
  };

  // Funções de confirmação dos modais
  const handleConfirmStart = async (agendamentoId) => {
    console.log('Iniciando OS para agendamento:', agendamentoId);
    // Aqui você implementaria a lógica para iniciar a OS
    // Por exemplo: await api.iniciarOS(agendamentoId);
    alert('OS iniciada com sucesso!');
  };

  const handleConfirmReschedule = async (agendamentoId, dadosReagendamento) => {
    console.log('Reagendando:', agendamentoId, dadosReagendamento);
    // Aqui você implementaria a lógica para reagendar
    // Por exemplo: await api.reagendarAgendamento(agendamentoId, dadosReagendamento);
    alert('Agendamento reagendado com sucesso!');
  };

  const handleConfirmCancel = async (agendamentoId, motivo) => {
    console.log('Cancelando agendamento:', agendamentoId, 'Motivo:', motivo);
    // Aqui você implementaria a lógica para cancelar
    // Por exemplo: await api.cancelarAgendamento(agendamentoId, motivo);
    alert('Agendamento cancelado com sucesso!');
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="agenda-container">
      <div className="agenda-header">
        <div className="agenda-title">
          <FiCalendar className="agenda-icon" />
          <h1>Agenda</h1>
        </div>
        <div className="agenda-filters">
          <div className="filter-group">
            <label>Data Início:</label>
            <input type="date" defaultValue="2025-08-01" />
          </div>
          <div className="filter-group">
            <label>Data Final:</label>
            <input type="date" defaultValue="2025-08-31" />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select defaultValue="PENDENTES">
              <option value="TODOS">TODOS</option>
              <option value="EM ANDAMENTO">EM ANDAMENTO</option>
              <option value="PENDENTES">PENDENTES</option>
              <option value="CONCLUÍDO">CONCLUÍDO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout para Mobile - Cards */}
      <div className="agenda-mobile-cards">
        <div className="cards-header">
          <span className="info-label">Informações</span>
          <span className="actions-label">Ações</span>
        </div>
        {agendamentos.map((agendamento) => (
          <div key={agendamento.id} className={`agenda-card ${agendamento.status === 'PENDENTE' ? 'card-pendente' : ''}`}>
            <div className="card-content">
              <div className="card-info">
                <div className="card-status">
                <span className={`status-badge ${getStatusClass(agendamento.status)}`}>
                   {agendamento.status}
                   {agendamento.status === 'PENDENTE' && (
                     <span className="tag-novo-status">NOVO</span>
                   )}
                 </span>
                <span className="card-number">
                  {agendamento.numero}
                </span>
              </div>
                <div className="card-details">
                  <div className="card-date-time">
                    📅 {agendamento.data} • ⏰ {agendamento.hora}
                  </div>
                  <div className="card-client">
                    👤 {agendamento.solicitante}
                  </div>
                  <div className="card-document">
                    📄 {agendamento.documento}
                  </div>
                  <div className="card-vehicle">
                    🚗 {agendamento.veiculo}
                  </div>
                  <div className="card-service">
                    🔧 {agendamento.servico}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-actions">
              {agendamento.status === 'EM ANDAMENTO' ? (
                <button 
                  className="btn-acao btn-ver-os"
                  onClick={() => handleVerOS(agendamento)}
                  title="Ver O.S."
                >
                  <FiEye />
                  <span>Ver O.S.</span>
                </button>
              ) : agendamento.status === 'PENDENTE' ? (
                <>
                  <button 
                    className="btn-acao btn-iniciar"
                    onClick={() => handleIniciar(agendamento)}
                    title="Iniciar"
                  >
                    <FiPlay />
                    <span>Iniciar</span>
                  </button>
                  <button 
                    className="btn-acao btn-reagendar"
                    onClick={() => handleReagendar(agendamento)}
                    title="Reagendar"
                  >
                    <FiCalendar />
                    <span>Reagendar</span>
                  </button>
                  <button 
                    className="btn-acao btn-cancelar"
                    onClick={() => handleCancelar(agendamento)}
                    title="Cancelar"
                  >
                    <FiX />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-acao btn-ver-os"
                    onClick={() => handleVerOS(agendamento)}
                    title="Ver O.S."
                  >
                    <FiEye />
                    <span>Ver O.S.</span>
                  </button>
                  <button 
                    className="btn-acao btn-iniciar"
                    onClick={() => handleIniciar(agendamento)}
                    title="Iniciar"
                  >
                    <FiPlay />
                    <span>Iniciar</span>
                  </button>
                  <button 
                    className="btn-acao btn-reagendar"
                    onClick={() => handleReagendar(agendamento)}
                    title="Reagendar"
                  >
                    <FiCalendar />
                    <span>Reagendar</span>
                  </button>
                  <button 
                    className="btn-acao btn-cancelar"
                    onClick={() => handleCancelar(agendamento)}
                    title="Cancelar"
                  >
                    <FiX />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="agenda-table-container">
        <table className="agenda-table">
          <thead>
            <tr>
              <th>Nº OS</th>
              <th>Status</th>
              <th>Pendências</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Credenciado</th>
              <th>Solicitante</th>
              <th>% Veículo</th>
              <th>% Motivação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id} className={agendamento.status === 'PENDENTE' ? 'row-pendente' : ''}>
                <td className="numero-os">
                  {agendamento.numero}
                  {agendamento.status === 'PENDENTE' && (
                    <span className="tag-novo">NOVO</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(agendamento.status)}`}>
                    {agendamento.status}
                  </span>
                </td>
                <td className="pendencia">{agendamento.pendencia}</td>
                <td className="data">{agendamento.data}</td>
                <td className="hora">{agendamento.hora}</td>
                <td className="credenciado">{agendamento.credenciado}</td>
                <td className="solicitante">
                  <div className="solicitante-info">
                    <div className="nome">{agendamento.solicitante}</div>
                    <div className="documento">{agendamento.documento}</div>
                  </div>
                </td>
                <td className="veiculo">
                  <div className="veiculo-info">
                    {agendamento.veiculo}
                  </div>
                </td>
                <td className="servico">{agendamento.servico}</td>
                <td className="acoes">
                  <div className="acoes-container">
                    {agendamento.status === 'EM ANDAMENTO' ? (
                      <button 
                        className="btn-acao btn-ver-os"
                        onClick={() => handleVerOS(agendamento)}
                        title="Ver O.S."
                      >
                        <FiEye />
                        <span>Ver O.S.</span>
                      </button>
                    ) : agendamento.status === 'PENDENTE' ? (
                      <>
                        <button 
                          className="btn-acao btn-iniciar"
                          onClick={() => handleIniciar(agendamento)}
                          title="Iniciar"
                        >
                          <FiPlay />
                          <span>Iniciar</span>
                        </button>
                        <button 
                          className="btn-acao btn-reagendar"
                          onClick={() => handleReagendar(agendamento)}
                          title="Reagendar"
                        >
                          <FiCalendar />
                          <span>Reagendar</span>
                        </button>
                        <button 
                          className="btn-acao btn-cancelar"
                          onClick={() => handleCancelar(agendamento)}
                          title="Cancelar"
                        >
                          <FiX />
                          <span>Cancelar</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-acao btn-ver-os"
                          onClick={() => handleVerOS(agendamento)}
                          title="Ver O.S."
                        >
                          <FiEye />
                          <span>Ver O.S.</span>
                        </button>
                        <button 
                          className="btn-acao btn-iniciar"
                          onClick={() => handleIniciar(agendamento)}
                          title="Iniciar"
                        >
                          <FiPlay />
                          <span>Iniciar</span>
                        </button>
                        <button 
                          className="btn-acao btn-reagendar"
                          onClick={() => handleReagendar(agendamento)}
                          title="Reagendar"
                        >
                          <FiCalendar />
                          <span>Reagendar</span>
                        </button>
                        <button 
                          className="btn-acao btn-cancelar"
                          onClick={() => handleCancelar(agendamento)}
                          title="Cancelar"
                        >
                          <FiX />
                          <span>Cancelar</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </div>
      <BottomNavigation />
      
      {/* Modais */}
      <StartModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={handleConfirmStart}
        agendamento={selectedAgendamento}
      />
      
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleConfirmReschedule}
        agendamento={selectedAgendamento}
      />
      
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        agendamento={selectedAgendamento}
      />
    </div>
  );
};

export default Agenda;