import React, { useContext, useEffect, useState } from 'react';
import {
  FiEye,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiBarChart,
  FiPieChart,
  FiUser,
  FiFileText,
  FiTruck,
  FiTool,
  FiHome
} from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, EspelhoFinanceiroViewModal } from '../../components';
import '../Home/style.css';
import './style.css';
import Api from '../../Api';
import Utils from '../../Utils';
import { MainContext } from '../../helpers/MainContext';

const EspelhoFinanceiro = () => {
  const { user } = useContext(MainContext);

  const [totalRecebido, setTotalRecebido] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);

  // Estados para controlar os modais
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    dataInicio: '2025-08-01',
    dataFim: '2025-08-31',
    status: 'TODOS'
  });

  // Estados para controlar os dados financeiros
  const [transacoes, setTransacoes] = useState([
    {
      id: 1,
      matricula: 'TECHNO001',
      razaoSocial: 'TECHNO DEVICES LTDA',
      cnpj: '31.950.540/0001-06',
      placa: 'RCI-9FT1',
      dataAgendamento: '15/08/2025',
      dataExecucao: '15/08/2025',
      servico: 'DIAGNÓSTICO ELETRÔNICO (SCANNER)',
      numeroOS: '1421',
      valorRepasse: 'R$ 150,00',
      statusPagamento: 'PAGO',
      codigoEspelho: '20-05',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY',
      cliente: 'DYLLAN NICOLAU DA SILVA',
      documento: 'CPF 699.930.507-XX'
    },
    {
      id: 2,
      matricula: 'LUCAS001',
      razaoSocial: 'LUCAS CALHAMBEQUE AUTO CENTER',
      cnpj: '31.950.540/0001-06',
      placa: 'ABC-1234',
      dataAgendamento: '14/08/2025',
      dataExecucao: '15/08/2025',
      servico: 'TROCA DE BIELETAS (PAR)',
      numeroOS: '1410',
      valorRepasse: 'R$ 250,00',
      statusPagamento: 'PENDENTE',
      codigoEspelho: '20-06',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY',
      cliente: 'MARIA SILVA SANTOS',
      documento: 'CPF 123.456.789-XX'
    },
    {
      id: 3,
      matricula: 'AUTO002',
      razaoSocial: 'AUTO PEÇAS E SERVIÇOS LTDA',
      cnpj: '12.345.678/0001-90',
      placa: 'XYZ-5678',
      dataAgendamento: '13/08/2025',
      dataExecucao: '14/08/2025',
      servico: 'MANUTENÇÃO DO SISTEMA DE FREIO',
      numeroOS: '1409',
      valorRepasse: 'R$ 320,00',
      statusPagamento: 'PAGO',
      codigoEspelho: '20-07',
      tipoComissao: 'Premium',
      descricao: 'Comissão Premium Serviço - VY',
      cliente: 'JOÃO CARLOS OLIVEIRA',
      documento: 'CPF 987.654.321-XX'
    },
    {
      id: 1,
      matricula: 'TECHNO001',
      razaoSocial: 'TECHNO DEVICES LTDA',
      cnpj: '31.950.540/0001-06',
      placa: 'RCI-9FT1',
      dataAgendamento: '15/08/2025',
      dataExecucao: '15/08/2025',
      servico: 'DIAGNÓSTICO ELETRÔNICO (SCANNER)',
      numeroOS: '1421',
      valorRepasse: 'R$ 150,00',
      statusPagamento: 'PAGO',
      codigoEspelho: '20-05',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY',
      cliente: 'DYLLAN NICOLAU DA SILVA',
      documento: 'CPF 699.930.507-XX'
    },
    {
      id: 2,
      matricula: 'LUCAS001',
      razaoSocial: 'LUCAS CALHAMBEQUE AUTO CENTER',
      cnpj: '31.950.540/0001-06',
      placa: 'ABC-1234',
      dataAgendamento: '14/08/2025',
      dataExecucao: '15/08/2025',
      servico: 'TROCA DE BIELETAS (PAR)',
      numeroOS: '1410',
      valorRepasse: 'R$ 250,00',
      statusPagamento: 'PENDENTE',
      codigoEspelho: '20-06',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY',
      cliente: 'MARIA SILVA SANTOS',
      documento: 'CPF 123.456.789-XX'
    },
    {
      id: 3,
      matricula: 'AUTO002',
      razaoSocial: 'AUTO PEÇAS E SERVIÇOS LTDA',
      cnpj: '12.345.678/0001-90',
      placa: 'XYZ-5678',
      dataAgendamento: '13/08/2025',
      dataExecucao: '14/08/2025',
      servico: 'MANUTENÇÃO DO SISTEMA DE FREIO',
      numeroOS: '1409',
      valorRepasse: 'R$ 320,00',
      statusPagamento: 'PAGO',
      codigoEspelho: '20-07',
      tipoComissao: 'Premium',
      descricao: 'Comissão Premium Serviço - VY',
      cliente: 'JOÃO CARLOS OLIVEIRA',
      documento: 'CPF 987.654.321-XX'
    },
    {
      id: 4,
      matricula: 'MOTO003',
      razaoSocial: 'MOTO CENTER ESPECIALIZADA',
      cnpj: '98.765.432/0001-10',
      placa: 'MOT-9876',
      dataAgendamento: '12/08/2025',
      dataExecucao: '13/08/2025',
      servico: 'TROCA DE ÓLEO E FILTROS',
      numeroOS: '1408',
      valorRepasse: 'R$ 85,00',
      statusPagamento: 'PROCESSANDO',
      codigoEspelho: '20-08',
      tipoComissao: 'Básica',
      descricao: 'Comissão Básica Serviço - VY',
      cliente: 'ANA PAULA FERREIRA',
      documento: 'CPF 456.789.123-XX'
    }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getTransacoes();
  }, [])

  const getTransacoes = async () => {
    try {
      const response = await Api.getEspelhoFinanceiroByPontoAtendimento({
        idPontoAtendimento: user.IdPontoAtendimento,
      });

      let _totalRecebido = response?.data?.filter(item => { return item.PagamentoFeito == 'S' }).reduce((acc, item) => {
          return acc + Number(item.ValorRepasse);
      }, 0);

      let _totalPendente = response?.data?.filter(item => { return item.PagamentoFeito == 'N' }).reduce((acc, item) => {
          return acc + Number(item.ValorRepasse);
      }, 0);

      let _ticketMedio = response?.data?.length > 0 ? _totalRecebido / response?.data?.length : 0;

      setTotalRecebido(_totalRecebido)
      setTotalPendente(_totalPendente)
      setTicketMedio(_ticketMedio)
    } catch (error) {
      console.error('Erro ao obter agendamento:', error);
    }
  }

  // Filtrar transações baseado nos filtros
  const transacoesFiltradas = transacoes.filter(transacao => {
    if (filtros.status !== 'TODOS' && transacao.statusPagamento !== filtros.status) {
      return false;
    }
    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'PAGO':
        return 'status-pago';
      case 'PENDENTE':
        return 'status-pendente';
      case 'PROCESSANDO':
        return 'status-processando';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PAGO':
        return 'PAGO';
      case 'PENDENTE':
        return 'PENDENTE';
      case 'PROCESSANDO':
        return 'PROCESSANDO';
      default:
        return status;
    }
  };

  const handleVerDetalhes = (transacao) => {
    setSelectedTransacao(transacao);
    setShowViewModal(true);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleAtualizarDados = async () => {
    setIsLoading(true);
    await getTransacoes();
    setIsLoading(false);
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content" style={{ paddingBottom: '0px', marginBottom: '0px' }}>
        <Header />
        <center>
          <div className="espelho-container">
            {/* Header da página */}
            <div className="espelho-header">
              <div className="espelho-title-section">
                <div className="espelho-title">
                  <FiDollarSign className="espelho-icon" />
                  <h1>Espelho Financeiro</h1>
                </div>
                <div className="espelho-actions">
                  <button
                    className="espelho-btn-action espelho-btn-refresh"
                    onClick={handleAtualizarDados}
                    disabled={isLoading}
                  >
                    <FiRefreshCw className={isLoading ? 'spinning' : ''} />
                    <span>Atualizar</span>
                  </button>
                  <button className="espelho-btn-action espelho-btn-export">
                    <FiDownload />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Indicadores Financeiros */}
              <div className="espelho-indicadores-grid">
                <div className="espelho-indicador-card espelho-total-pago">
                  <div className="espelho-indicador-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="espelho-indicador-content">
                    <span className="espelho-indicador-label">Total Recebido</span>
                    <span className="espelho-indicador-valor">{Utils.formatCurrency(totalRecebido)}</span>
                    <span className="espelho-indicador-meta">Valores já recebidos</span>
                  </div>
                </div>

                <div className="espelho-indicador-card espelho-total-pendente">
                  <div className="espelho-indicador-icon">
                    <FiTrendingDown />
                  </div>
                  <div className="espelho-indicador-content">
                    <span className="espelho-indicador-label">Total Pendente</span>
                    <span className="espelho-indicador-valor">{Utils.formatCurrency(totalPendente)}</span>
                    <span className="espelho-indicador-meta">Aguardando pagamento</span>
                  </div>
                </div>

                <div className="espelho-indicador-card espelho-ticket-medio">
                  <div className="espelho-indicador-icon">
                    <FiBarChart />
                  </div>
                  <div className="espelho-indicador-content">
                    <span className="espelho-indicador-label">Ticket Médio</span>
                    <span className="espelho-indicador-valor">{Utils.formatCurrency(ticketMedio)}</span>
                    <span className="espelho-indicador-meta">Valor médio por OS</span>
                  </div>
                </div>

              </div>

              {/* Filtros */}
              <div className="espelho-filters">
                <div className="espelho-filters-title">
                  <FiFilter className="espelho-filter-icon" />
                  <span>Filtros</span>
                </div>
                <div className="espelho-filters-grid">
                  <div className="espelho-filter-group">
                    <label>Data Início:</label>
                    <input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                    />
                  </div>
                  <div className="espelho-filter-group">
                    <label>Data Final:</label>
                    <input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                    />
                  </div>
                  <div className="espelho-filter-group">
                    <label>Status:</label>
                    <select
                      value={filtros.status}
                      onChange={(e) => handleFiltroChange('status', e.target.value)}
                    >
                      <option value="TODOS">TODOS</option>
                      <option value="PAGO">PAGO</option>
                      <option value="PENDENTE">PENDENTE</option>
                      <option value="PROCESSANDO">PROCESSANDO</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout para Mobile - Cards */}
            <div className="espelho-mobile-cards">
              <div className="espelho-cards-header">
                <span className="espelho-info-label">Transações Financeiras</span>
                <span className="espelho-actions-label">Ações</span>
              </div>
              {transacoesFiltradas.map((transacao) => (
                <div key={transacao.id} className={`espelho-card ${transacao.statusPagamento === 'PENDENTE' ? 'espelho-card-pendente' : transacao.statusPagamento === 'PROCESSANDO' ? 'espelho-card-processando' : ''}`}>
                  <div className="espelho-card-content">
                    <div className="espelho-card-info">
                      <div className="espelho-card-status">
                        <span className={`espelho-status-badge ${getStatusClass(transacao.statusPagamento)}`}>
                          {getStatusLabel(transacao.statusPagamento)}
                          {transacao.statusPagamento === 'PENDENTE' && (
                            <span className="espelho-tag-novo-status">NOVO</span>
                          )}
                        </span>
                        <span className="espelho-card-number">
                          OS #{transacao.numeroOS}
                        </span>
                      </div>
                      <div className="espelho-card-details">
                        <div className="espelho-card-valor">
                          <FiDollarSign /> {transacao.valorRepasse}
                        </div>
                        <div className="espelho-card-date-time">
                          <FiCalendar /> {transacao.dataExecucao} • <FiHome /> {transacao.razaoSocial}
                        </div>
                        <div className="espelho-card-client">
                          <FiUser /> {transacao.cliente}
                        </div>
                        <div className="espelho-card-document">
                          <FiFileText /> {transacao.documento}
                        </div>
                        <div className="espelho-card-vehicle">
                          <FiTruck /> {transacao.placa} • <FiTool /> {transacao.servico}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="espelho-card-actions">
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

            {/* Tabela Desktop */}
            <div className="espelho-table-container">
              <table className="espelho-table">
                <thead>
                  <tr>
                    <th>OS</th>
                    <th>Status</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Valor Repasse</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transacoesFiltradas.map((transacao) => (
                    <tr key={transacao.id} className={transacao.statusPagamento === 'PENDENTE' ? 'espelho-row-pendente' : transacao.statusPagamento === 'PROCESSANDO' ? 'espelho-row-processando' : ''}>
                      <td className="espelho-numero-os">
                        #{transacao.numeroOS}
                        {transacao.statusPagamento === 'PENDENTE' && (
                          <span className="espelho-tag-novo">NOVO</span>
                        )}
                      </td>
                      <td className="espelho-status-cell">
                        <span className={`espelho-status-badge ${getStatusClass(transacao.statusPagamento)}`}>
                          {getStatusLabel(transacao.statusPagamento)}
                        </span>
                      </td>
                      <td className="espelho-cliente">
                        <div className="espelho-cliente-info">
                          <div className="espelho-nome">{transacao.cliente}</div>
                          <div className="espelho-documento">{transacao.documento}</div>
                        </div>
                      </td>
                      <td className="espelho-servico">{transacao.servico}</td>
                      <td className="espelho-valor-repasse">{transacao.valorRepasse}</td>
                      <td className="espelho-acoes">
                        <div className="espelho-acoes-container">
                          <button
                            className="espelho-btn-acao espelho-btn-ver-detalhes"
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
        </center>
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