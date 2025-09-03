import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiPlay, FiCalendar, FiX } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import CancelModal from '../../components/Modal/CancelModal';
import RescheduleModal from '../../components/Modal/RescheduleModal';
import StartModal from '../../components/Modal/StartModal';
import '../Home/style.css';
import './style.css';
import Api from '../../Api';
import { MainContext } from '../../helpers/MainContext';
import { toast } from 'react-toastify';

const Agenda = () => {
  const navigate = useNavigate();

  const { user } = useContext(MainContext);

  // Estados para controlar os modais
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const hoje = new Date();

  // Primeiro dia do mês
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // Último dia do mês
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filtroDataInicio, setFiltroDataInicio] = useState(primeiroDia);
  const [filtroDataFinal, setFiltroDataFinal] = useState(ultimoDia);
  
  const [filtroStatus, setFiltroStatus] = useState('PENDENTES');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Função para carregar agendamentos
  const carregarAgendamentos = () => {
    if (user && user.IdPontoAtendimento) {
      Api.agendamentos({ idPontoAtendimento: user.IdPontoAtendimento }).then(res => {
        if (res.status === 200 && res.data && res.data.data) {
          const agendamentosFormatados = res.data.data.map(item => {
            // Determinar status baseado nas regras fornecidas
            let status;
            if (item.StatusAgendamento === 'C') {
              status = 'CONCLUÍDO';
            } else if (item.StatusAgendamento === 'A' && (item.IdSocioVeiculoAgendaExecucao === '00000000-0000-0000-0000-000000000000' || item.IdSocioVeiculoAgendaExecucao === null)) {
              status = 'PENDENTE';
            } else if (item.IdSocioVeiculoAgendaExecucao !== '00000000-0000-0000-0000-000000000000' || item.IdSocioVeiculoAgendaExecucao === null) {
              status = 'EM ANDAMENTO';
            } else {
              status = 'PENDENTE';
            }

            return {
              id: item.IdSocioVeiculoAgenda,
              idSocio: item.IdSocio,
              idSocioVeiculo: item.IdSocioVeiculo,
              idPontoAtendimento: user?.IdPontoAtendimento,
              numero: item.NumeroOS.toString(),
              status: status,
              pendencia: item.QtdePendencias > 0 ? 'SIM' : 'NÃO',
              data: item.DataAgendamento,
              hora: item.HoraAgendamento,
              solicitante: item.Nome.trim(),
              documento: `CPF ${item.Cpf}`,
              veiculo: `${item.Marca} ${item.Veiculo} ${item.Ano} - ${item.Litragem} / ${item.Placa}`,
              servico: item.Motivacao || '(NÃO INFORMADO)',
              telefone: item.Telefone,
              observacoes: item.Observacoes,
              pontoAtendimento: item.DescricaoPontoAtendimento,
              valorServico: item.ValorServico,
              valorRepasse: item.ValorRepasse
            };
          });
          setAgendamentos(agendamentosFormatados);
        }
        setLoading(false);
      }).catch(error => {
        console.error('Erro ao carregar agendamentos:', error);
        setLoading(false);
      });
    }
  };

  // Função para filtrar agendamentos
  const filtrarAgendamentos = () => {
    let agendamentosFiltrados = agendamentos;

    // Filtro por data
    if (filtroDataInicio && filtroDataFinal) {
      agendamentosFiltrados = agendamentosFiltrados.filter(agendamento => {
        const dataAgendamento = new Date(agendamento.data.split('/').reverse().join('-'));
        const dataInicio = new Date(filtroDataInicio);
        const dataFinal = new Date(filtroDataFinal);
        return dataAgendamento >= dataInicio && dataAgendamento <= dataFinal;
      });
    }

    // Filtro por status
    if (filtroStatus !== 'TODOS') {
      if (filtroStatus === 'PENDENTES') {
        agendamentosFiltrados = agendamentosFiltrados.filter(agendamento => agendamento.status === 'PENDENTE');
      } else {
        agendamentosFiltrados = agendamentosFiltrados.filter(agendamento => agendamento.status === filtroStatus);
      }
    }

    setAgendamentosFiltrados(agendamentosFiltrados);
  };

  // Aplicar filtros sempre que agendamentos ou filtros mudarem
  useEffect(() => {
    filtrarAgendamentos();
  }, [agendamentos, filtroDataInicio, filtroDataFinal, filtroStatus]);

  // Carregar agendamentos inicialmente
  useEffect(() => {
    carregarAgendamentos();
  }, [user]);

  // Atualizar tabela a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      carregarAgendamentos();
    }, 10000); // 10 segundos

    // Limpar o interval quando o componente for desmontado
    return () => clearInterval(interval);
  }, [user]);

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
  const handleConfirmStart = async (agendamentoId, dadosInicio) => {
    console.log('Iniciando OS para agendamento:', agendamentoId, dadosInicio);
    try {
      await Api.iniciar({
        idSocioVeiculoAgenda: agendamentoId,
        ...dadosInicio
      })
      toast.success('Ordem de Serviço iniciada com sucesso!');
      navigate(`/execucao-os/${agendamentoId}`);
    } catch (error) {
      toast.error('Erro ao iniciar Ordem de Serviço.');
      return;
    }
  };

  const handleConfirmReschedule = async (agendamentoId, dadosReagendamento) => {
    console.log('Reagendando:', agendamentoId, dadosReagendamento); 
    try {
      await Api.reagendar({
        idSocioVeiculoAgenda: agendamentoId,
        ...dadosReagendamento
      })
      toast.success('Agendamento reagendado com sucesso!');
      carregarAgendamentos();
    } catch (error) {
      toast.error('Erro ao reagendar agendamento.');
      return;
    }
  };

  const handleConfirmCancel = async (agendamentoId, dadosCancelamento) => {
    console.log('Cancelando agendamento:', agendamentoId, dadosCancelamento);
    try {
      await Api.cancelar({
        idSocioVeiculoAgenda: agendamentoId,
        ...dadosCancelamento
      })
      toast.success('Agendamento cancelado com sucesso!');
      carregarAgendamentos();
    } catch (error) {
      toast.error('Erro ao cancelar agendamento.');
      return;
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content" style={{marginBottom: '0px', paddingBottom: '0px'}}>
        <Header />
        <center>
          <div className="agenda-container">
            <div className="agenda-header">
              <div className="agenda-title">
                <FiCalendar className="agenda-icon" />
                <h1>Agenda</h1>
              </div>
              <div className="agenda-filters">
                <div className="filter-group">
                  <label>Data Início:</label>
                  <input 
                    type="date" 
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Data Final:</label>
                  <input 
                    type="date" 
                    value={filtroDataFinal}
                    onChange={(e) => setFiltroDataFinal(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Carregando agendamentos...</p>
                </div>
              ) : agendamentosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Nenhum agendamento encontrado.</p>
                </div>
              ) : agendamentosFiltrados.map((agendamento) => (
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
                        <div className="card-document" style={{display: 'none'}}>
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
                    )  : (
                      <>
                        <button
                          className="btn-acao btn-ver-os"
                          onClick={() => handleVerOS(agendamento)}
                          title="Ver O.S."
                        >
                          <FiEye />
                          <span>Ver O.S.</span>
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
                    <th style={{display: 'none'}}>Pendências</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Solicitante</th>
                    <th>Veículo</th>
                    <th>Motivação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                        Carregando agendamentos...
                      </td>
                    </tr>
                  ) : agendamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                        Nenhum agendamento encontrado.
                      </td>
                    </tr>
                  ) : agendamentosFiltrados.map((agendamento) => (
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
                      <td className="pendencia" style={{display: 'none'}}>{agendamento.pendencia}</td>
                      <td className="data">{agendamento.data}</td>
                      <td className="hora">{agendamento.hora}</td>
                      <td className="solicitante">
                        <div className="solicitante-info">
                          <div className="nome">{agendamento.solicitante}</div>
                          <div className="documento" style={{display: 'none'}}>{agendamento.documento}</div>
                        </div>
                      </td>
                      <td className="veiculo">
                        <div className="veiculo-info">
                          {agendamento.veiculo}
                        </div>
                      </td>
                      <td className="servico">{agendamento.servico.toUpperCase()}</td>
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
        </center>
      </div>
      <BottomNavigation />

      {/* Modais */}
      <StartModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={handleConfirmStart}
        agendamento={selectedAgendamento}
        idPontoAtendimentoUsuario={user?.IdPontoAtendimentoUsuario}
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