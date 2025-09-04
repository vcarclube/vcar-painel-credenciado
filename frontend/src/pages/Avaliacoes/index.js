import React, { useState, useEffect, useContext } from 'react';
import { FiStar, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import { MainContext } from '../../helpers/MainContext';
import Api from '../../Api';
import { toast } from 'react-toastify';
import './style.css';

const Avaliacoes = () => {
  const { user } = useContext(MainContext);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstrelas, setFiltroEstrelas] = useState('todas');
  const [mediaEstrelas, setMediaEstrelas] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Carregar avaliações da API
  useEffect(() => {
    const carregarAvaliacoes = async () => {
      if (!user?.IdPontoAtendimento) return;
      
      try {
        setLoading(true);
        
        // Carregar média das avaliações
        const mediaResponse = await Api.getAvaliacaoMediaPontoAtendimento({ 
          idPontoAtendimento: user.IdPontoAtendimento 
        });
        
        if (mediaResponse?.status === 200) {
          setMediaEstrelas(mediaResponse.data.MediaNotas || 0);
          setTotalAvaliacoes(mediaResponse.data.TotalAvaliacoes || 0);
        }
        
        // Carregar todas as avaliações
        const avaliacoesResponse = await Api.getAvaliacoesPontoAtendimento({ 
          idPontoAtendimento: user.IdPontoAtendimento 
        });
        
        if (avaliacoesResponse?.status === 200 && avaliacoesResponse.data) {
          // Transformar os dados da API para o formato esperado pela interface
          const avaliacoesFormatadas = Array.isArray(avaliacoesResponse.data) 
            ? avaliacoesResponse.data.map((avaliacao, index) => ({
                id: avaliacao.IdSocioVeiculoAgenda || index + 1,
                cliente: avaliacao.Cliente,
                documento: '', // API não retorna documento
                veiculo: `${avaliacao.MarcaVeiculo} ${avaliacao.ModeloVeiculo} ${avaliacao.AnoVeiculo}`,
                placa: avaliacao.PlacaVeiculo,
                osNumero: avaliacao.NumeroOS,
                estrelas: avaliacao.Nota,
                comentario: avaliacao.Observacoes || 'Sem comentários',
                data: new Date(avaliacao.DataLog).toLocaleDateString('pt-BR'),
                hora: new Date(avaliacao.DataLog).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              }))
            : [];
          
          setAvaliacoes(avaliacoesFormatadas);
        } else {
          setAvaliacoes([]);
        }
        
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        toast.error('Erro ao carregar avaliações');
        setAvaliacoes([]);
        setMediaEstrelas(0);
        setTotalAvaliacoes(0);
      } finally {
        setLoading(false);
      }
    };
    
    carregarAvaliacoes();
  }, [user?.IdPontoAtendimento]);

  // Função para renderizar estrelas
  const renderEstrelas = (quantidade) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`avaliacao-estrela ${
          index < quantidade ? 'avaliacao-estrela--preenchida' : 'avaliacao-estrela--vazia'
        }`}
        size={16}
      />
    ));
  };

  // Filtrar avaliações por estrelas
  const avaliacoesFiltradas = filtroEstrelas === 'todas' 
    ? avaliacoes 
    : avaliacoes.filter(avaliacao => avaliacao.estrelas === parseInt(filtroEstrelas));

  // Calcular estatísticas locais para distribuição
  const mediaEstrelasLocal = totalAvaliacoes > 0 
    ? (avaliacoes.reduce((acc, curr) => acc + curr.estrelas, 0) / totalAvaliacoes).toFixed(1)
    : mediaEstrelas.toFixed(1);

  const distribuicaoEstrelas = [5, 4, 3, 2, 1].map(estrela => {
    const quantidade = avaliacoes.filter(av => av.estrelas === estrela).length;
    const porcentagem = totalAvaliacoes > 0 ? (quantidade / totalAvaliacoes) * 100 : 0;
    return { estrela, quantidade, porcentagem };
  });

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrapper">
          <Sidebar />
          <div className="main-content">
            <div className="execucao-os__loading">
              <div className="execucao-os__loading-spinner"></div>
              <p>Carregando avaliações...</p>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="avaliacoes">
      <Header />
      <Sidebar />
  
      <div className="avaliacoes__content">
        <div className="avaliacoes__container">
          <div className="avaliacoes__header">
            <h1 className="avaliacoes__title">Avaliações dos Clientes</h1>
            <p className="avaliacoes__subtitle">Acompanhe o feedback dos sócios</p>
          </div>

          {/* Resumo das Avaliações */}
          <div className="avaliacoes__resumo">
            <div className="avaliacoes__resumo-card">
              <div className="avaliacoes__media">
                <span className="avaliacoes__media-numero">{mediaEstrelas.toFixed(1)}</span>
                <div className="avaliacoes__media-estrelas">
                  {renderEstrelas(Math.round(parseFloat(mediaEstrelas)))}
                </div>
                <span className="avaliacoes__media-total">({totalAvaliacoes} avaliações)</span>
              </div>
            </div>

            <div className="avaliacoes__distribuicao">
              {distribuicaoEstrelas.map(({ estrela, quantidade, porcentagem }) => (
                <div key={estrela} className="avaliacoes__distribuicao-item">
                  <span className="avaliacoes__distribuicao-estrela">{estrela}</span>
                  <FiStar className="avaliacoes__distribuicao-icon" size={14} />
                  <div className="avaliacoes__distribuicao-barra">
                    <div 
                      className="avaliacoes__distribuicao-preenchimento"
                      style={{ width: `${porcentagem}%` }}
                    ></div>
                  </div>
                  <span className="avaliacoes__distribuicao-quantidade">({quantidade})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="avaliacoes__filtros">
            <label className="avaliacoes__filtro-label">Filtrar por estrelas:</label>
            <select 
              className="avaliacoes__filtro-select"
              value={filtroEstrelas}
              onChange={(e) => setFiltroEstrelas(e.target.value)}
            >
              <option value="todas">Todas as avaliações</option>
              <option value="5">5 estrelas</option>
              <option value="4">4 estrelas</option>
              <option value="3">3 estrelas</option>
              <option value="2">2 estrelas</option>
              <option value="1">1 estrela</option>
            </select>
          </div>

          {/* Lista de Avaliações */}
          <div className="avaliacoes__lista">
            {avaliacoesFiltradas.length === 0 ? (
              <div className="avaliacoes__vazio">
                <FiStar className="avaliacoes__vazio-icon" size={48} />
                <h3>Nenhuma avaliação encontrada</h3>
                <p>Não há avaliações para o filtro selecionado.</p>
              </div>
            ) : (
              avaliacoesFiltradas.map(avaliacao => (
                <div key={avaliacao.id} className="avaliacoes__item">
                  <div className="avaliacoes__item-header">
                    <div className="avaliacoes__item-cliente">
                      <div className="avaliacoes__item-avatar">
                        <FiUser size={20} />
                      </div>
                      <div className="avaliacoes__item-info">
                        <h4 className="avaliacoes__item-nome">{avaliacao.cliente}</h4>
                        <p className="avaliacoes__item-documento">{avaliacao.documento}</p>
                        <p className="avaliacoes__item-veiculo">
                          {avaliacao.veiculo} - {avaliacao.placa}
                        </p>
                      </div>
                    </div>
                    <div className="avaliacoes__item-meta">
                      <span className="avaliacoes__item-os">OS #{avaliacao.osNumero}</span>
                      <div className="avaliacoes__item-data">
                        <FiCalendar size={14} />
                        <span>{avaliacao.data}</span>
                        <FiClock size={14} />
                        <span>{avaliacao.hora}</span>
                      </div>
                    </div>
                  </div>

                  <div className="avaliacoes__item-avaliacao">
                    <div className="avaliacoes__item-estrelas">
                      {renderEstrelas(avaliacao.estrelas)}
                      <span className="avaliacoes__item-nota">({avaliacao.estrelas}/5)</span>
                    </div>
                  </div>

                  <div className="avaliacoes__item-comentario">
                    <p>{avaliacao.comentario}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Avaliacoes;