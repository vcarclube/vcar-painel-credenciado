import React, { useEffect, useState, useContext } from 'react';
import { FiEye, FiEdit, FiTrash2, FiPlus, FiClipboard } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, Modal, Button } from '../../components';
import RetornoServicoViewModal from '../../components/Modal/RetornoServicoViewModal';
import RetornoServicoEditModal from '../../components/Modal/RetornoServicoEditModal';
import RetornoServicoCreateModal from '../../components/Modal/RetornoServicoCreateModal';
import { MainContext } from '../../helpers/MainContext';
import { toast } from 'react-toastify';
import Api from '../../Api';
import '../Home/style.css';
import './style.css';

const RetornoServico = () => {
  const { user } = useContext(MainContext);
  const [retornos, setRetornos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRetorno, setSelectedRetorno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Carregar retornos de serviço
  const carregarRetornos = async () => {
    if (!user?.IdPontoAtendimento) return;
    
    setLoading(true);
    try {
      const response = await Api.listaRetornosServico({ idPontoAtendimento: user.IdPontoAtendimento });
      if (response?.data?.success) {
        setRetornos(response.data.data || []);
      } else {
        toast.error('Erro ao carregar retornos de serviço');
      }
    } catch (error) {
      console.error('Erro ao carregar retornos:', error);
      toast.error('Erro ao carregar retornos de serviço');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar retornos baseado nos filtros selecionados
  const retornosFiltrados = retornos.filter(retorno => {
    const statusMatch = filtroStatus === 'TODOS' || retorno.Status === filtroStatus;
    const tipoMatch = filtroTipo === 'TODOS' || retorno.Tipo === filtroTipo;
    return statusMatch && tipoMatch;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    carregarRetornos();
  }, [user?.IdPontoAtendimento]);

  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora
  const formatarHora = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'A':
        return 'status-aberto';
      case 'P':
        return 'status-em-chamado';
      case 'C':
        return 'status-concluido';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'A':
        return 'ABERTO';
      case 'P':
        return 'EM CHAMADO';
      case 'C':
        return 'CONCLUÍDO';
      default:
        return status;
    }
  };

  const handleView = (retorno) => {
    setSelectedRetorno(retorno);
    setShowViewModal(true);
  };

  const handleEdit = (retorno) => {
    setSelectedRetorno(retorno);
    setShowEditModal(true);
  };

  const handleDelete = (retorno) => {
    setSelectedRetorno(retorno);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedRetorno) return;
    
    setLoadingDelete(true);
    try {
      const response = await Api.deleteRetornoServico({ idRetornoServico: selectedRetorno.IdRetornoServico });
      if (response?.data?.success) {
        toast.success('Retorno de serviço excluído com sucesso!');
        setShowDeleteModal(false);
        setSelectedRetorno(null);
        carregarRetornos();
      } else {
        toast.error('Erro ao excluir retorno de serviço');
      }
    } catch (error) {
      console.error('Erro ao excluir retorno:', error);
      toast.error('Erro ao excluir retorno de serviço');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    carregarRetornos();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRetorno(null);
    carregarRetornos();
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowCreateModal(false);
    setSelectedRetorno(null);
  };

  const handleCreateRetorno = () => {
    setShowCreateModal(true);
  };

  const getTipoClass = (tipo) => {
    switch (tipo) {
      case 'PEÇA':
        return 'tipo-peca';
      case 'MÃO DE OBRA':
        return 'tipo-mao-obra';
      case 'ATENDIMENTO':
        return 'tipo-atendimento';
      case 'OUTROS':
        return 'tipo-outros';
      default:
        return '';
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <center>
          <div className="retorno-servico-container">
            <div className="retorno-servico-header">
              <div className="retorno-servico-title">
                <FiClipboard className="retorno-servico-icon" />
                <h1>Retorno de Serviço</h1>
              </div>
              <div className="retorno-servico-filters">
                <div className="filter-group">
                  <label>Data Início:</label>
                  <input type="date" defaultValue="2024-01-01" />
                </div>
                <div className="filter-group">
                  <label>Data Final:</label>
                  <input type="date" defaultValue="2024-01-31" />
                </div>
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    value={filtroStatus} 
                    onChange={(e) => setFiltroStatus(e.target.value)}
                  >
                    <option value="TODOS">TODOS</option>
                    <option value="A">ABERTO</option>
                    <option value="P">EM CHAMADO</option>
                    <option value="C">CONCLUÍDO</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Tipo:</label>
                  <select 
                    value={filtroTipo} 
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="TODOS">TODOS</option>
                    <option value="PEÇA">PEÇA</option>
                    <option value="MÃO DE OBRA">MÃO DE OBRA</option>
                    <option value="ATENDIMENTO">ATENDIMENTO</option>
                    <option value="OUTROS">OUTROS</option>
                  </select>
                </div>
                <button 
                  className="btn-create"
                  onClick={handleCreateRetorno}
                >
                  <FiPlus />
                  Novo Retorno
                </button>
              </div>
            </div>

            {/* Layout para Mobile - Cards */}
            <div className="retorno-servico-mobile-cards">
              <div className="cards-header">
                <span className="info-label">Informações</span>
                <span className="actions-label">Ações</span>
              </div>
              {retornosFiltrados.map((retorno) => (
                <div key={retorno.id} className={`retorno-servico-card ${retorno.status === 'PENDENTE' ? 'card-pendente' : ''}`}>
                  <div className="card-content">
                    <div className="card-info">
                      <div className="card-status">
                        <span className={`status-badge ${getStatusClass(retorno.status)}`}>
                          {retorno.status}
                          {retorno.status === 'PENDENTE' && (
                            <span className="tag-novo-status">NOVO</span>
                          )}
                        </span>
                        <span className="card-number">
                          {retorno.numeroOS}
                        </span>
                      </div>
                      <div className="card-details">
                        <div className="card-date-time">
                          📅 {retorno.dataRetorno} • ⏰ {retorno.horaRetorno}
                        </div>
                        <div className="card-client">
                          👤 {retorno.cliente}
                        </div>
                        <div className="card-document">
                          📄 {retorno.documento}
                        </div>
                        <div className="card-vehicle">
                          🚗 {retorno.veiculo}
                        </div>
                        <div className="card-service">
                          🔧 {retorno.servico}
                        </div>
                        <div className="card-partner">
                          🏢 {retorno.parceiro}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-acao btn-view"
                      onClick={() => handleView(retorno)}
                      title="Visualizar"
                    >
                      <FiEye />
                      <span>Ver</span>
                    </button>
                    <button 
                      className="btn-acao btn-edit"
                      onClick={() => handleEdit(retorno)}
                      title="Editar"
                    >
                      <FiEdit />
                      <span>Editar</span>
                    </button>
                    <button 
                      className="btn-acao btn-delete"
                      onClick={() => handleDelete(retorno)}
                      title="Excluir"
                    >
                      <FiTrash2 />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="retorno-servico-table-container">
              <table className="retorno-servico-table">
                <thead>
                    <tr>
                      <th>Nº OS</th>
                      <th>Status</th>
                      <th>Tipo</th>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Cliente</th>
                      <th>Veículo</th>
                      <th>Serviço</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                <tbody>
                  {retornosFiltrados.map((retorno) => (
                    <tr key={retorno.IdRetornoServico} className={retorno.Status === 'A' ? 'row-aberto' : ''}>
                      <td className="numero-os">
                        {retorno.NumeroOS}
                        {retorno.Status === 'A' && (
                          <span className="tag-novo">NOVO</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(retorno.Status)}`}>
                          {getStatusLabel(retorno.Status)}
                        </span>
                      </td>
                      <td>
                        <span className={`tipo-badge ${getTipoClass(retorno.Tipo)}`}>
                          {retorno.Tipo}
                        </span>
                      </td>
                      <td className="data">{formatarData(retorno.DataAgendamento)}</td>
                      <td className="hora">{formatarHora(retorno.DataAgendamento)}</td>
                      <td className="cliente">
                        <div className="cliente-info">
                          <div className="nome">{retorno.NomeSocio}</div>
                          <div className="documento">{retorno.DocumentoSocio}</div>
                        </div>
                      </td>
                      <td className="veiculo">
                        <div className="veiculo-info">
                          {retorno.PlacaVeiculo}
                        </div>
                      </td>
                      <td className="servico">{retorno.NomeServico}</td>
                      <td className="acoes">
                        <div className="acoes-container">
                          <button 
                            className="btn-acao btn-view"
                            onClick={() => handleView(retorno)}
                            title="Visualizar"
                          >
                            <FiEye />
                            <span>Ver</span>
                          </button>
                          <button 
                            className="btn-acao btn-edit"
                            onClick={() => handleEdit(retorno)}
                            title="Editar"
                          >
                            <FiEdit />
                            <span>Editar</span>
                          </button>
                          <button 
                            className="btn-acao btn-delete"
                            onClick={() => handleDelete(retorno)}
                            title="Excluir"
                          >
                            <FiTrash2 />
                            <span>Excluir</span>
                          </button>
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
      <RetornoServicoViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        retorno={selectedRetorno}
      />
      
      <RetornoServicoEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRetorno(null);
        }}
        retorno={selectedRetorno}
        onSuccess={handleEditSuccess}
      />
      
      <RetornoServicoCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      
      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
      >
        <div className="delete-confirmation">
          <p>Tem certeza que deseja excluir este retorno de serviço?</p>
          {selectedRetorno && (
            <div className="retorno-info">
              <p><strong>Nº OS:</strong> {selectedRetorno.NumeroOS}</p>
              <p><strong>Cliente:</strong> {selectedRetorno.NomeSocio}</p>
              <p><strong>Serviço:</strong> {selectedRetorno.NomeServico}</p>
            </div>
          )}
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={loadingDelete}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              loading={loadingDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RetornoServico;