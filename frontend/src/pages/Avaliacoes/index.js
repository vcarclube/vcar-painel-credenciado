import React, { useState, useEffect } from 'react';
import { FiStar, FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import './style.css';

const Avaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstrelas, setFiltroEstrelas] = useState('todas');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dados simulados de avaliações
  useEffect(() => {
    setTimeout(() => {
      setAvaliacoes([
        {
          id: 1,
          cliente: 'DYLLAN NICOLAU DA SILVA',
          documento: 'CPF: 699.993.050-07',
          veiculo: 'JEEP COMPASS 2021/2021',
          placa: 'RCI-9FT1',
          osNumero: '1421',
          estrelas: 5,
          comentario: 'Excelente atendimento! O mecânico foi muito profissional e explicou tudo detalhadamente. Serviço de qualidade e pontualidade impecável. Recomendo!',
          data: '15/01/2024',
          hora: '14:30'
        },
        {
          id: 2,
          cliente: 'MARIA SANTOS OLIVEIRA',
          documento: 'CPF: 123.456.789-00',
          veiculo: 'HONDA CIVIC 2020/2020',
          placa: 'ABC-1234',
          osNumero: '1420',
          estrelas: 4,
          comentario: 'Bom atendimento, serviço realizado conforme esperado. Apenas o tempo de espera foi um pouco maior que o previsto, mas no geral estou satisfeita.',
          data: '14/01/2024',
          hora: '10:15'
        },
        {
          id: 3,
          cliente: 'JOÃO CARLOS PEREIRA',
          documento: 'CPF: 987.654.321-11',
          veiculo: 'TOYOTA COROLLA 2019/2019',
          placa: 'XYZ-9876',
          osNumero: '1419',
          estrelas: 5,
          comentario: 'Perfeito! Problema resolvido rapidamente e com preço justo. Equipe muito competente e atenciosa. Voltarei sempre que precisar.',
          data: '13/01/2024',
          hora: '16:45'
        },
        {
          id: 4,
          cliente: 'ANA PAULA RODRIGUES',
          documento: 'CPF: 456.789.123-22',
          veiculo: 'VOLKSWAGEN GOL 2018/2018',
          placa: 'DEF-5678',
          osNumero: '1418',
          estrelas: 3,
          comentario: 'Serviço ok, mas poderia ter sido mais rápido. O atendimento foi cordial, porém senti falta de mais informações sobre o que estava sendo feito.',
          data: '12/01/2024',
          hora: '09:20'
        },
        {
          id: 5,
          cliente: 'CARLOS EDUARDO LIMA',
          documento: 'CPF: 789.123.456-33',
          veiculo: 'FORD FIESTA 2017/2017',
          placa: 'GHI-9012',
          osNumero: '1417',
          estrelas: 5,
          comentario: 'Excepcional! Desde o agendamento até a finalização do serviço, tudo foi perfeito. Profissionais qualificados e honestos. Muito obrigado!',
          data: '11/01/2024',
          hora: '13:10'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

  // Calcular estatísticas
  const totalAvaliacoes = avaliacoes.length;
  const mediaEstrelas = totalAvaliacoes > 0 
    ? (avaliacoes.reduce((acc, curr) => acc + curr.estrelas, 0) / totalAvaliacoes).toFixed(1)
    : 0;

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
            <p className="avaliacoes__subtitle">Acompanhe o feedback dos seus clientes</p>
          </div>

          {/* Resumo das Avaliações */}
          <div className="avaliacoes__resumo">
            <div className="avaliacoes__resumo-card">
              <div className="avaliacoes__media">
                <span className="avaliacoes__media-numero">{mediaEstrelas}</span>
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