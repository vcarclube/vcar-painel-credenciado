import React, { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiCreditCard } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import DadosBancariosViewModal from '../../components/Modal/DadosBancariosViewModal';
import DadosBancariosCreateModal from '../../components/Modal/DadosBancariosCreateModal';
import '../Home/style.css';
import './style.css';

const DadosBancarios = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDado, setSelectedDado] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroBanco, setFiltroBanco] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Dados bancários de exemplo
  const dadosBancarios = [
    {
      id: 1,
      banco: 'Banco do Brasil',
      agencia: '1234-5',
      conta: '12345-6',
      tipo: 'Conta Corrente',
      titular: 'João Silva Santos',
      cpfCnpj: '123.456.789-00',
      status: 'ATIVO',
      dataCadastro: '15/01/2024',
      principal: true
    },
    {
      id: 2,
      banco: 'Itaú Unibanco',
      agencia: '5678-9',
      conta: '67890-1',
      tipo: 'Conta Poupança',
      titular: 'Maria Oliveira Costa',
      cpfCnpj: '987.654.321-00',
      status: 'ATIVO',
      dataCadastro: '20/02/2024',
      principal: false
    },
    {
      id: 3,
      banco: 'Caixa Econômica Federal',
      agencia: '9876-5',
      conta: '54321-0',
      tipo: 'Conta Corrente',
      titular: 'Pedro Santos Lima',
      cpfCnpj: '456.789.123-00',
      status: 'INATIVO',
      dataCadastro: '10/03/2024',
      principal: false
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'ATIVO':
        return 'status-ativo';
      case 'INATIVO':
        return 'status-inativo';
      default:
        return '';
    }
  };

  const handleVisualizarDado = (dado) => {
    setSelectedDado(dado);
    setShowViewModal(true);
  };

  const handleEditarDado = (dado) => {
    setSelectedDado(dado);
    setShowCreateModal(true);
  };

  const handleExcluirDado = (dado) => {
    if (window.confirm(`Tem certeza que deseja excluir os dados bancários do ${dado.banco}?`)) {
      console.log('Excluindo dado bancário:', dado.id);
      // Aqui seria implementada a lógica de exclusão
    }
  };

  const handleNovoDado = () => {
    setSelectedDado(null);
    setShowCreateModal(true);
  };

  const handleConfirmCreate = (dadoData) => {
    console.log('Criando/editando dado bancário:', dadoData);
    setShowCreateModal(false);
    setSelectedDado(null);
  };

  const dadosFiltrados = dadosBancarios.filter(dado => {
    const matchStatus = !filtroStatus || dado.status === filtroStatus;
    const matchBanco = !filtroBanco || dado.banco.toLowerCase().includes(filtroBanco.toLowerCase());
    const matchTipo = !filtroTipo || dado.tipo === filtroTipo;
    return matchStatus && matchBanco && matchTipo;
  });

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dados-bancarios-container">
          <div className="dados-bancarios-header">
            <div className="dados-bancarios-title">
              <FiCreditCard className="dados-bancarios-icon" />
              <h1>Dados Bancários</h1>
            </div>
            
            <div className="dados-bancarios-filters">
              <div className="filter-group">
                <label>Banco</label>
                <input
                  type="text"
                  placeholder="Filtrar por banco"
                  value={filtroBanco}
                  onChange={(e) => setFiltroBanco(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label>Tipo de Conta</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Conta Poupança">Conta Poupança</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
              
              <div className="filter-group">
                <button 
                  className="btn-novo-dado"
                  onClick={handleNovoDado}
                >
                  <FiPlus />
                  <span>Novo Dado</span>
                </button>
              </div>
            </div>
          </div>

          {/* Layout Mobile - Cards */}
          <div className="dados-bancarios-mobile-cards">
            <div className="cards-header">
              <span>Dados Bancários ({dadosFiltrados.length})</span>
            </div>
            {dadosFiltrados.map((dado) => (
              <div key={dado.id} className={`dados-bancarios-card ${dado.principal ? 'card-principal' : ''}`}>
                <div className="card-content">
                  <div className="card-info">
                    <div className="card-status">
                      <span className="card-banco">
                        {dado.banco}
                        {dado.principal && (
                          <span className="tag-principal">PRINCIPAL</span>
                        )}
                      </span>
                    </div>
                    <div className="card-details">
                      <div>
                        <strong>Agência:</strong> {dado.agencia}
                      </div>
                      <div>
                        <strong>Conta:</strong> {dado.conta}
                      </div>
                      <div>
                        <strong>Tipo:</strong> {dado.tipo}
                      </div>
                      <div>
                        <strong>Titular:</strong> {dado.titular}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span className={`status-badge ${getStatusClass(dado.status)}`}>
                          {dado.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-acao btn-visualizar"
                    onClick={() => handleVisualizarDado(dado)}
                    title="Visualizar"
                  >
                    <FiEye />
                    <span>Visualizar</span>
                  </button>
                  <button 
                    className="btn-acao btn-editar"
                    onClick={() => handleEditarDado(dado)}
                    title="Editar"
                  >
                    <FiEdit />
                    <span>Editar</span>
                  </button>
                  <button 
                    className="btn-acao btn-excluir"
                    onClick={() => handleExcluirDado(dado)}
                    title="Excluir"
                  >
                    <FiTrash2 />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Layout Desktop - Tabela */}
          <div className="dados-bancarios-table-container">
            <table className="dados-bancarios-table">
              <thead>
                <tr>
                  <th>Banco</th>
                  <th>Agência</th>
                  <th>Conta</th>
                  <th>Tipo</th>
                  <th>Titular</th>
                  <th>CPF/CNPJ</th>
                  <th>Status</th>
                  <th>Data Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((dado) => (
                  <tr key={dado.id} className={dado.principal ? 'row-principal' : ''}>
                    <td className="banco">
                      {dado.banco}
                      {dado.principal && (
                        <span className="tag-principal">PRINCIPAL</span>
                      )}
                    </td>
                    <td className="agencia">{dado.agencia}</td>
                    <td className="conta">{dado.conta}</td>
                    <td className="tipo">{dado.tipo}</td>
                    <td className="titular">
                      <div className="titular-info">
                        <div className="nome">{dado.titular}</div>
                      </div>
                    </td>
                    <td className="documento">{dado.cpfCnpj}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(dado.status)}`}>
                        {dado.status}
                      </span>
                    </td>
                    <td className="data-cadastro">{dado.dataCadastro}</td>
                    <td className="acoes">
                      <div className="acoes-container">
                        <button 
                          className="btn-acao btn-visualizar"
                          onClick={() => handleVisualizarDado(dado)}
                          title="Visualizar"
                        >
                          <FiEye />
                          <span>Visualizar</span>
                        </button>
                        <button 
                          className="btn-acao btn-editar"
                          onClick={() => handleEditarDado(dado)}
                          title="Editar"
                        >
                          <FiEdit />
                          <span>Editar</span>
                        </button>
                        <button 
                          className="btn-acao btn-excluir"
                          onClick={() => handleExcluirDado(dado)}
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
      <DadosBancariosViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        dado={selectedDado}
      />
      
      <DadosBancariosCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleConfirmCreate}
        dado={selectedDado}
      />
    </div>
  );
};

export default DadosBancarios;