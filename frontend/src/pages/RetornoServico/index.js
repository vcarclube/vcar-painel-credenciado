import React, { useEffect, useState } from 'react';
import { FiEye, FiEdit, FiTrash2, FiPlus, FiClipboard } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import RetornoServicoViewModal from '../../components/Modal/RetornoServicoViewModal';
import RetornoServicoEditModal from '../../components/Modal/RetornoServicoEditModal';
import RetornoServicoCreateModal from '../../components/Modal/RetornoServicoCreateModal';
import '../Home/style.css';
import './style.css';

const RetornoServico = () => {
  const [retornos, setRetornos] = useState([
    {
      id: 1,
      numeroOS: '1234',
      status: 'PENDENTE',
      tipo: 'PREVENTIVA',
      dataRetorno: '15/01/2024',
      horaRetorno: '14:30',
      parceiro: 'OFICINA SILVA LTDA',
      cliente: 'JOÃO SILVA SANTOS',
      documento: 'CPF 123.456.789-00',
      veiculo: 'HONDA CIVIC 2020 / ABC-1234',
      servico: 'TROCA DE ÓLEO E FILTROS'
    },
    {
      id: 2,
      numeroOS: '1235',
      status: 'APROVADO',
      tipo: 'CORRETIVA',
      dataRetorno: '16/01/2024',
      horaRetorno: '09:15',
      parceiro: 'AUTO CENTER SANTOS',
      cliente: 'MARIA OLIVEIRA',
      documento: 'CPF 987.654.321-00',
      veiculo: 'TOYOTA COROLLA 2019 / DEF-5678',
      servico: 'REPARO DO SISTEMA DE FREIOS'
    },
    {
      id: 3,
      numeroOS: '1236',
      status: 'REJEITADO',
      tipo: 'PREVENTIVA',
      dataRetorno: '17/01/2024',
      horaRetorno: '16:45',
      parceiro: 'MECÂNICA JOÃO',
      cliente: 'PEDRO COSTA',
      documento: 'CPF 456.789.123-00',
      veiculo: 'VOLKSWAGEN GOL 2018 / GHI-9012',
      servico: 'REVISÃO GERAL DO VEÍCULO'
    },
    {
      id: 4,
      numeroOS: '1237',
      status: 'PENDENTE',
      tipo: 'CORRETIVA',
      dataRetorno: '18/01/2024',
      horaRetorno: '11:20',
      parceiro: 'OFICINA SILVA LTDA',
      cliente: 'ANA SANTOS',
      documento: 'CPF 789.123.456-00',
      veiculo: 'FORD KA 2021 / JKL-3456',
      servico: 'TROCA DE PASTILHAS DE FREIO'
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRetorno, setSelectedRetorno] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrar retornos baseado nos filtros selecionados
  const retornosFiltrados = retornos.filter(retorno => {
    const statusMatch = filtroStatus === 'TODOS' || retorno.status === filtroStatus;
    const tipoMatch = filtroTipo === 'TODOS' || retorno.tipo === filtroTipo;
    return statusMatch && tipoMatch;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'APROVADO':
        return 'status-aprovado';
      case 'PENDENTE':
        return 'status-pendente';
      case 'REJEITADO':
        return 'status-rejeitado';
      default:
        return '';
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
    if (window.confirm('Tem certeza que deseja excluir este retorno?')) {
      console.log('Excluindo retorno:', retorno.id);
      alert('Retorno excluído com sucesso!');
    }
  };

  // Funções de confirmação dos modais
  const handleConfirmEdit = async (retornoId, dadosEdicao) => {
    console.log('Editando retorno:', retornoId, dadosEdicao);
    alert('Retorno editado com sucesso!');
  };

  const handleConfirmCreate = async (dadosRetorno) => {
    console.log('Criando retorno:', dadosRetorno);
    alert('Retorno criado com sucesso!');
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
      case 'PREVENTIVA':
        return 'tipo-preventiva';
      case 'CORRETIVA':
        return 'tipo-corretiva';
      default:
        return '';
    }
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
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
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="APROVADO">APROVADO</option>
                  <option value="REJEITADO">REJEITADO</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Tipo:</label>
                <select 
                  value={filtroTipo} 
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="TODOS">TODOS</option>
                  <option value="PREVENTIVA">PREVENTIVA</option>
                  <option value="CORRETIVA">CORRETIVA</option>
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
                  <th>Parceiro</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Serviço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {retornosFiltrados.map((retorno) => (
                  <tr key={retorno.id} className={retorno.status === 'PENDENTE' ? 'row-pendente' : ''}>
                    <td className="numero-os">
                      {retorno.numeroOS}
                      {retorno.status === 'PENDENTE' && (
                        <span className="tag-novo">NOVO</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(retorno.status)}`}>
                        {retorno.status}
                      </span>
                    </td>
                    <td>
                      <span className={`tipo-badge ${getTipoClass(retorno.tipo)}`}>
                        {retorno.tipo}
                      </span>
                    </td>
                    <td className="data">{retorno.dataRetorno}</td>
                    <td className="hora">{retorno.horaRetorno}</td>
                    <td className="parceiro">{retorno.parceiro}</td>
                    <td className="cliente">
                      <div className="cliente-info">
                        <div className="nome">{retorno.cliente}</div>
                        <div className="documento">{retorno.documento}</div>
                      </div>
                    </td>
                    <td className="veiculo">
                      <div className="veiculo-info">
                        {retorno.veiculo}
                      </div>
                    </td>
                    <td className="servico">{retorno.servico}</td>
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
        onClose={() => setShowEditModal(false)}
        onConfirm={handleConfirmEdit}
        retorno={selectedRetorno}
      />
      
      <RetornoServicoCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
};

export default RetornoServico;