import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, EspelhoFinanceiroViewModal } from '../../components';
import '../Home/style.css';
import './style.css';

const EspelhoFinanceiro = () => {
  const navigate = useNavigate();
  
  // Estados para controlar os modais
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState(null);
  
  // Estados para controlar os dados financeiros
  const [transacoes] = useState([
    {
      id: 1,
      matricula: 'TECHNO',
      razaoSocial: 'TECHNO DEVICES 1',
      cnpj: '31.950.540/0001-06',
      placa: 'RCI-9FT1',
      dataAgendamento: '15/08/2025',
      dataExecucao: '15/08/2025',
      servico: 'DIAGNÓSTICO ELETRÔNICO (SCANNER)',
      numeroOS: '1421',
      valorRepasse: 'R$ 150,00',
      statusPagamento: 'CONCLUÍDO',
      codigoEspelho: '20-05',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY'
    },
    {
      id: 2,
      matricula: 'LUCAS CALHAMBEQUE',
      razaoSocial: 'LUCAS CALHAMBEQUE',
      cnpj: '31.950.540/0001-06',
      placa: 'RCI-9FT1',
      dataAgendamento: '15/08/2025',
      dataExecucao: '15/08/2025',
      servico: 'TROCA DE BIELETAS (PAR)',
      numeroOS: '1410',
      valorRepasse: 'R$ 250,00',
      statusPagamento: 'PENDENTE',
      codigoEspelho: '20-05',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY'
    }
  ]);

  // Cálculo dos indicadores financeiros
  const calcularIndicadores = () => {
    const totalRecebido = transacoes
      .filter(t => t.statusPagamento === 'CONCLUÍDO')
      .reduce((acc, t) => acc + parseFloat(t.valorRepasse.replace('R$ ', '').replace(',', '.')), 0);
    
    const totalAReceber = transacoes
      .filter(t => t.statusPagamento === 'PENDENTE')
      .reduce((acc, t) => acc + parseFloat(t.valorRepasse.replace('R$ ', '').replace(',', '.')), 0);
    
    const totalTransacoes = transacoes.length;
    const ticketMedio = totalTransacoes > 0 ? (totalRecebido + totalAReceber) / totalTransacoes : 0;
    const totalRepasses = totalRecebido + totalAReceber;

    return {
      totalRecebido,
      totalAReceber,
      ticketMedio,
      totalRepasses
    };
  };

  const indicadores = calcularIndicadores();

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONCLUÍDO':
        return 'status-concluido';
      case 'PENDENTE':
        return 'status-pendente';
      default:
        return '';
    }
  };

  const handleVerDetalhes = (transacao) => {
    setSelectedTransacao(transacao);
    setShowViewModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="espelho-container">
          <div className="espelho-header">
            <div className="espelho-title">
              <FiDollarSign className="espelho-icon" />
              <h1>Espelho Financeiro</h1>
            </div>
            
            {/* Indicadores Financeiros */}
            <div className="indicadores-container">
              <div className="indicador">
                <div className="indicador-icon total-recebido">
                  <FiTrendingUp />
                </div>
                <div className="indicador-info">
                  <span className="indicador-label">Total Recebido</span>
                  <span className="indicador-valor">{formatCurrency(indicadores.totalRecebido)}</span>
                </div>
              </div>
              
              <div className="indicador">
                <div className="indicador-icon total-receber">
                  <FiTrendingDown />
                </div>
                <div className="indicador-info">
                  <span className="indicador-label">Total a Receber</span>
                  <span className="indicador-valor">{formatCurrency(indicadores.totalAReceber)}</span>
                </div>
              </div>
              
              <div className="indicador">
                <div className="indicador-icon ticket-medio">
                  <FiCreditCard />
                </div>
                <div className="indicador-info">
                  <span className="indicador-label">Ticket Médio</span>
                  <span className="indicador-valor">{formatCurrency(indicadores.ticketMedio)}</span>
                </div>
              </div>
              
              <div className="indicador">
                <div className="indicador-icon total-repasses">
                  <FiDollarSign />
                </div>
                <div className="indicador-info">
                  <span className="indicador-label">Total de Repasses</span>
                  <span className="indicador-valor">{formatCurrency(indicadores.totalRepasses)}</span>
                </div>
              </div>
            </div>
            
            <div className="espelho-filters">
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
                <select defaultValue="TODOS">
                  <option value="TODOS">TODOS</option>
                  <option value="CONCLUÍDO">CONCLUÍDO</option>
                  <option value="PENDENTE">PENDENTE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Layout para Mobile - Cards */}
          <div className="espelho-mobile-cards">
            <div className="cards-header">
              <span className="info-label">Informações</span>
              <span className="actions-label">Ações</span>
            </div>
            {transacoes.map((transacao) => (
              <div key={transacao.id} className={`espelho-card ${transacao.statusPagamento === 'PENDENTE' ? 'card-pendente' : ''}`}>
                <div className="card-content">
                  <div className="card-info">
                    <div className="card-status">
                      <span className={`status-badge ${getStatusClass(transacao.statusPagamento)}`}>
                        {transacao.statusPagamento}
                      </span>
                      <span className="card-number">
                        OS {transacao.numeroOS}
                      </span>
                    </div>
                    <div className="card-details">
                      <div className="card-date-time">
                        📅 {transacao.dataExecucao} • 💰 {transacao.valorRepasse}
                      </div>
                      <div className="card-client">
                        🏢 {transacao.razaoSocial}
                      </div>
                      <div className="card-document">
                        📄 {transacao.cnpj}
                      </div>
                      <div className="card-vehicle">
                        🚗 {transacao.placa}
                      </div>
                      <div className="card-service">
                        🔧 {transacao.servico}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-acao btn-ver-detalhes"
                    onClick={() => handleVerDetalhes(transacao)}
                    title="Ver Detalhes"
                  >
                    <FiEye />
                    <span>Ver Detalhes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="espelho-table-container">
            <table className="espelho-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>Placa</th>
                  <th>Data Agendamento</th>
                  <th>Data Execução</th>
                  <th>Serviço</th>
                  <th>Número OS</th>
                  <th>Valor Repasse</th>
                  <th>Status Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((transacao) => (
                  <tr key={transacao.id} className={transacao.statusPagamento === 'PENDENTE' ? 'row-pendente' : ''}>
                    <td className="matricula">{transacao.matricula}</td>
                    <td className="razao-social">{transacao.razaoSocial}</td>
                    <td className="cnpj">{transacao.cnpj}</td>
                    <td className="placa">{transacao.placa}</td>
                    <td className="data">{transacao.dataAgendamento}</td>
                    <td className="data">{transacao.dataExecucao}</td>
                    <td className="servico">{transacao.servico}</td>
                    <td className="numero-os">{transacao.numeroOS}</td>
                    <td className="valor-repasse">{transacao.valorRepasse}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(transacao.statusPagamento)}`}>
                        {transacao.statusPagamento}
                      </span>
                    </td>
                    <td className="acoes">
                      <div className="acoes-container">
                        <button 
                          className="btn-acao btn-ver-detalhes"
                          onClick={() => handleVerDetalhes(transacao)}
                          title="Ver Detalhes"
                        >
                          <FiEye />
                          <span>Ver Detalhes</span>
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
      
      {/* Modal de Visualização */}
       <EspelhoFinanceiroViewModal
         isOpen={showViewModal}
         transacao={selectedTransacao}
         onClose={() => setShowViewModal(false)}
       />
    </div>
  );
};

export default EspelhoFinanceiro;