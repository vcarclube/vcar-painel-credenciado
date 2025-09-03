import React, { useContext, useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiCreditCard, FiFilter } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import DadosBancariosViewModal from '../../components/Modal/DadosBancariosViewModal';
import DadosBancariosCreateModal from '../../components/Modal/DadosBancariosCreateModal';
import DadosBancariosDeleteModal from '../../components/Modal/DadosBancariosDeleteModal';
import Api from '../../Api';
import { toast } from 'react-toastify';
import '../Home/style.css';
import './style.css';
import { MainContext } from '../../helpers/MainContext';

// Estilos CSS para elementos selecionados
const styles = `
  .dados-bancarios-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .dados-bancarios-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .dados-bancarios-card.card-selecionado {
    background: rgba(40, 167, 69, 0.1);
    border: 2px solid var(--primary);
    box-shadow: 0 4px 16px rgba(40, 167, 69, 0.2);
  }

  .dados-bancarios-table tbody tr {
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s ease;
  }

  .dados-bancarios-table tbody tr:hover {
    background-color: #f8f9fa;
  }

  .dados-bancarios-table tbody tr.row-selecionado {
    background-color: rgba(40, 167, 69, 0.1);
    border-left: 4px solid var(--primary);
  }

  .dados-bancarios-table tbody tr.row-selecionado:hover {
    background-color: rgba(40, 167, 69, 0.15);
  }

  .status-selecionado {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-selecionado.selecionado {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
    border: 1px solid #28a745;
  }

  .status-selecionado.nao-selecionado {
    background-color: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid #6c757d;
  }
`;

// Injetar estilos no documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

const DadosBancarios = () => {
  // Aplicar estilos quando o componente for montado
  useEffect(() => {
    const styleId = 'dados-bancarios-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }
  }, []);
  const { user } = useContext(MainContext);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDado, setSelectedDado] = useState(null);
  const [editingDado, setEditingDado] = useState(null);
  const [deletingDado, setDeletingDado] = useState(null);
  const [filtroSelecionado, setFiltroSelecionado] = useState('');
  const [filtroPontoAtendimento, setFiltroPontoAtendimento] = useState('');
  const [filtroTipoPagamento, setFiltroTipoPagamento] = useState('');
  const [dadosBancarios, setDadosBancarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para carregar dados bancários da API
  const loadDadosBancarios = async () => {
    setLoading(true);
    try {
      // Aqui você deve obter o idPontoAtendimento do contexto/localStorage
      const idPontoAtendimento = user?.IdPontoAtendimento;
      const response = await Api.getDadosBancarioByPontoAtendimento({ idPontoAtendimento });
      
      if (response.status === 200) {
        setDadosBancarios(response.data.dadosBancarios || []);
      } else {
        toast.error('Erro ao carregar dados bancários');
      }
    } catch (error) {
      console.error('Erro ao carregar dados bancários:', error);
      toast.error('Erro ao carregar dados bancários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDadosBancarios();
  }, []);

  const handleNovoDado = () => {
    setSelectedDado(null);
    setShowCreateModal(true);
  };

  const handleVisualizarDado = (dado) => {
    setSelectedDado(dado);
    setShowViewModal(true);
  };

  const handleEditarDado = (dado) => {
    setSelectedDado(dado);
    setShowCreateModal(true);
  };

  const handleSaveDado = async (dadoData) => {
    setLoading(true);
    try {
      if (selectedDado) {
        // Editar
        await Api.editDadosBancariosPontoAtendimento({ idDadoBancario: selectedDado.IdDadoBancario, ...dadoData });
        toast.success('Dados bancários atualizados com sucesso!');
      } else {
        // Criar
        await Api.addDadosBancariosPontoAtendimento(dadoData);
        toast.success('Dados bancários criados com sucesso!');
      }
      setShowCreateModal(false);
      setSelectedDado(null);
      loadDadosBancarios();
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error);
      toast.error('Erro ao salvar dados bancários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (dado) => {
    setDeletingDado(dado);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingDado) return;

    setLoading(true);
    try {
      await Api.deleteDadosBancariosPontoAtendimento({ IdDadoBancario: deletingDado.IdDadoBancario });
      toast.success('Dados bancários excluídos com sucesso!');
      setShowDeleteModal(false);
      setDeletingDado(null);
      loadDadosBancarios();
    } catch (error) {
      console.error('Erro ao excluir dados bancários:', error);
      toast.error('Erro ao excluir dados bancários');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingDado(null);
  };

  const dadosFiltrados = dadosBancarios.filter(dado => {
    const matchSelecionado = !filtroSelecionado || dado.Selecionado === filtroSelecionado;
    const matchPontoAtendimento = !filtroPontoAtendimento || true; // Todos são V-CAR
    
    // Detectar tipo de pagamento baseado nos dados existentes
    const tipoPagamento = (dado.ChavePix && dado.TipoChavePix) ? 'PIX' : 'TRANSFERENCIA';
    const matchTipoPagamento = !filtroTipoPagamento || tipoPagamento === filtroTipoPagamento;
    
    return matchSelecionado && matchPontoAtendimento && matchTipoPagamento;
  });

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content" style={{paddingBottom: '0px', marginBottom: '0px'}}>
        <Header />
        <center>
          <div className="dados-bancarios-container">
            <div className="dados-bancarios-header">
              <div className="dados-bancarios-title">
                <FiCreditCard className="dados-bancarios-icon" />
                <h1>Dados Bancários</h1>
              </div>
              
              <div className="dados-bancarios-filters">
                <div className="filter-group">
                  <label>Tipo de Pagamento:</label>
                  <select 
                    value={filtroTipoPagamento}
                    onChange={(e) => setFiltroTipoPagamento(e.target.value)}
                  >
                    <option value="">[ TODOS ]</option>
                    <option value="PIX">PIX</option>
                    <option value="TRANSFERENCIA">TRANSFERÊNCIA</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Selecionado</label>
                  <select
                    value={filtroSelecionado}
                    onChange={(e) => setFiltroSelecionado(e.target.value)}
                  >
                    <option value="">[ TODOS ]</option>
                    <option value="S">SIM</option>
                    <option value="N">NÃO</option>
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
              <div key={dado.IdDadoBancario} className={`dados-bancarios-card ${dado.Selecionado === 'S' ? 'card-selecionado' : ''}`}>
                <div className="card-content">
                  <div className="card-info">
                    <div className="card-status">
                      <span className="card-tipo">
                        {(dado.ChavePix && dado.TipoChavePix) ? 'PIX' : 'TRANSFERENCIA'}
                      </span>
                      <span className={`status-selecionado ${dado.Selecionado === 'S' ? 'selecionado' : 'nao-selecionado'}`}>
                        {dado.Selecionado === 'S' ? 'SELECIONADO' : 'NÃO SELECIONADO'}
                      </span>
                    </div>
                    <div className="card-details">
                      <div>
                        <strong>Tipo de Chave:</strong> {dado.TipoChavePix}
                      </div>
                      <div>
                        <strong>Chave PIX:</strong> {dado.ChavePix}
                      </div>
                      <div>
                        <strong>Titular:</strong> {dado.NomeTitular}
                      </div>
                      <div>
                        <strong>CPF/CNPJ:</strong> {dado.DocumentoTitular}
                      </div>
                      <div>
                        <strong>Data Cadastro:</strong> {new Date(dado.DataCadastro).toLocaleDateString('pt-BR')}
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
                      onClick={() => handleDelete(dado)}
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
                    <th>Selecionado</th>
                    <th>Tipo</th>
                    <th>Dados PIX</th>
                    <th>Dados Bancários</th>
                    <th>Nome Titular</th>
                    <th>CPF/CNPJ</th>
                    <th>Data Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((dado) => (
                    <tr key={dado.IdDadoBancario} className={dado.Selecionado === 'S' ? 'row-selecionado' : ''}>
                      <td>
                        <span className={`status-selecionado ${dado.Selecionado === 'S' ? 'selecionado' : 'nao-selecionado'}`}>
                          {dado.Selecionado === 'S' ? 'SIM' : 'NÃO'}
                        </span>
                      </td>
                      <td>
                        <span className="tipo-badge">
                          <FiCreditCard className="tipo-icon" />
                          {(dado.ChavePix && dado.TipoChavePix) ? 'PIX' : 'TRANSFERENCIA'}
                        </span>
                      </td>
                      <td>
                        {(dado.ChavePix && dado.TipoChavePix) ? (
                          <div className="dados-pix">
                            <div className="pix-tipo">{dado.TipoChavePix}</div>
                            <div className="pix-chave">{dado.ChavePix}</div>
                          </div>
                        ) : (
                          <div className="dados-pix">
                            <div className="pix-tipo">-</div>
                            <div className="pix-chave">-</div>
                          </div>
                        )}
                      </td>
                      <td>
                        {dado.Banco ? (
                            <div className="dados-bancarios">
                              <div className="banco-nome">{dado.Banco}</div>
                              <div className="conta-info">
                                Ag: {dado.NumeroAgencia} | Conta: {dado.NumeroConta}
                              </div>
                            </div>
                          ) : (
                            <div className="dados-bancarios">
                              <div className="banco-nome">-</div>
                              <div className="conta-info">-</div>
                            </div>
                          )}
                        </td>
                      <td>{dado.NomeTitular}</td>
                      <td>{dado.DocumentoTitular}</td>
                      <td>{new Date(dado.DataCadastro).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div className="acoes-container-dados-bancarios">
                          <button 
                            className="btn-acao btn-visualizar"
                            onClick={() => handleVisualizarDado(dado)}
                            title="Visualizar"
                          >
                            <FiEye />
                          </button>
                          <button 
                            className="btn-acao btn-editar"
                            onClick={() => handleEditarDado(dado)}
                            title="Editar"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="btn-acao btn-excluir"
                            onClick={() => handleDelete(dado)}
                            title="Excluir"
                          >
                            <FiTrash2 />
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
      <DadosBancariosViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        dado={selectedDado}
      />
      
      <DadosBancariosCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveDado}
        dado={selectedDado}
        loading={loading}
      />
      
      <DadosBancariosDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        dado={deletingDado}
        loading={loading}
      />
    </div>
  );
};

export default DadosBancarios;