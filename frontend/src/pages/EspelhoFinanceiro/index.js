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

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    dataInicio: primeiroDia,
    dataFim: ultimoDia,
    status: 'PENDENTE'
  });

  // Estados para controlar os dados financeiros
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getTransacoes();
  }, [])

  const getTransacoes = async (filtrosParam = null) => {
    try {
      const filtrosAtivos = filtrosParam || filtros;
      const requestBody = {
        idPontoAtendimento: user.IdPontoAtendimento
      };

      // Adicionar filtros de data se estiverem definidos
      if (filtrosAtivos.dataInicio) {
        requestBody.dataInicio = filtrosAtivos.dataInicio;
      }
      if (filtrosAtivos.dataFim) {
        requestBody.dataFim = filtrosAtivos.dataFim;
      }
      if (filtrosAtivos.status && filtrosAtivos.status !== 'TODOS') {
        requestBody.pagamentoFeito = filtrosAtivos.status === 'PAGO' ? 'S' : 'N';
      }

      const response = await Api.getEspelhoFinanceiroByPontoAtendimento(requestBody);

      // Mapear os dados da API para o formato esperado pela tabela
      const transacoesMapeadas = response?.data?.map(item => ({
        id: item.IdFinanceiroEspelho,
        matricula: item.Matricula,
        razaoSocial: item.RazaoSocial,
        cnpj: item.Cnpj,
        placa: item.VeiculoPlaca || item.Placa,
        dataAgendamento: item.DataAgendamento,
        dataExecucao: item.DataExecucaoOS,
        servico: item.NomeServico,
        numeroOS: item.NumeroOS,
        valorRepasse: Utils.formatCurrency(Number(item.ValorRepasse)),
        statusPagamento: item.PagamentoFeito === 'S' ? 'PAGO' : 'PENDENTE',
        codigoEspelho: item.CodigoEspelho,
        tipoComissao: item.TipoComissao,
        descricao: item.Descricao,
        cliente: item.SocioNome,
        documento: `CPF/CNPJ ${item.Cnpj}`,
        comprovantePagamento: item.ComprovantePagamento
      })) || [];

      setTransacoes(transacoesMapeadas);

      // Calcular totais com base nos dados originais da API (já filtrados pelo backend)
      let _totalRecebido = response?.data?.filter(item => { return item.PagamentoFeito == 'S' }).reduce((acc, item) => {
          return acc + Number(item.ValorRepasse);
      }, 0);

      let _totalPendente = response?.data?.filter(item => { return item.PagamentoFeito == 'N' }).reduce((acc, item) => {
          return acc + Number(item.ValorRepasse);
      }, 0);

      let _ticketMedio = response?.data?.length > 0 ? (_totalRecebido + _totalPendente) / response?.data?.length : 0;

      setTotalRecebido(_totalRecebido)
      setTotalPendente(_totalPendente)
      setTicketMedio(_ticketMedio)
    } catch (error) {
      console.error('Erro ao obter agendamento:', error);
    }
  }

  // Como os filtros são aplicados no backend, usamos as transações diretamente
  const transacoesFiltradas = transacoes;

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

  const handleFiltroChange = async (campo, valor) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    };
    setFiltros(novosFiltros);
    
    // Fazer nova requisição com os filtros atualizados
    setIsLoading(true);
    await getTransacoes(novosFiltros);
    setIsLoading(false);
  };

  const handleAtualizarDados = async () => {
    setIsLoading(true);
    await getTransacoes();
    setIsLoading(false);
  };

  const handleExportarDados = () => {
    if (transacoesFiltradas.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    // Cabeçalhos do CSV
    const headers = [
      'Número OS',
      'Status Pagamento',
      'Cliente',
      'CNPJ',
      'Placa',
      'Data Agendamento',
      'Data Execução',
      'Serviço',
      'Valor Repasse',
      'Código Espelho',
      'Tipo Comissão',
      'Descrição',
      'Matrícula',
      'Razão Social'
    ];

    // Converter dados para CSV
    const csvContent = [
      headers.join(','),
      ...transacoesFiltradas.map(transacao => [
        transacao.numeroOS,
        transacao.statusPagamento,
        `"${transacao.cliente}"`,
        transacao.cnpj,
        transacao.placa,
        transacao.dataAgendamento,
        transacao.dataExecucao,
        `"${transacao.servico}"`,
        transacao.valorRepasse,
        transacao.codigoEspelho,
        transacao.tipoComissao,
        `"${transacao.descricao}"`,
        transacao.matricula,
        `"${transacao.razaoSocial}"`
      ].join(','))
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `espelho_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    <span>{isLoading ? 'Atualizando...' : 'Atualizar'}</span>
                  </button>
                  <button 
                    className="espelho-btn-action espelho-btn-export"
                    onClick={handleExportarDados}
                  >
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
                <div key={transacao.id} style={{background: '#fff'}} className={`espelho-card ${transacao.statusPagamento === 'PENDENTE' ? 'espelho-card-pendente' : transacao.statusPagamento === 'PROCESSANDO' ? 'espelho-card-processando' : ''}`}>
                  <div className="espelho-card-content" style={{padding: '0px'}}>
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