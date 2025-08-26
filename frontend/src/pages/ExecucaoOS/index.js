import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FiCamera, 
  FiFileText, 
  FiPackage, 
  FiTool, 
  FiUser, 
  FiTruck, 
  FiCheck, 
  FiDollarSign, 
  FiMoreVertical,
  FiClock,
  FiCalendar,
  FiPlus,
  FiX,
  FiEye,
  FiTrash2,
  FiVideo
} from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, Modal, SearchableSelect, Button, MediaUpload, LaudosModal, RecibosModal } from '../../components';
import { VideoInicialModal, VideoFinalizacaoModal } from '../../components/Modal';
import './style.css';

const ExecutaOS = () => {
  const { idSocioVeiculoAgenda } = useParams();
  const [osData, setOsData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para funcionalidades
  const [fotos, setFotos] = useState([]);
  const [anotacoes, setAnotacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Estados para modal de anotações
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Estados para modal de serviços
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalDropdownSetter, setModalDropdownSetter] = useState(null);
  
  // Estados para modais de vídeo
  const [isVideoInicialModalOpen, setIsVideoInicialModalOpen] = useState(false);
  const [isVideoFinalizacaoModalOpen, setIsVideoFinalizacaoModalOpen] = useState(false);
  const [videoInicialUploaded, setVideoInicialUploaded] = useState(false);
  const [videoFinalizacaoUploaded, setVideoFinalizacaoUploaded] = useState(false);
  
  // Estados para modais de laudos e recibos
  const [isLaudosModalOpen, setIsLaudosModalOpen] = useState(false);
  const [isRecibosModalOpen, setIsRecibosModalOpen] = useState(false);
  const [laudos, setLaudos] = useState([
    {
      id: 1,
      nome: 'Laudo_Tecnico_Motor_001.pdf',
      tamanho: 2048576, // 2MB
      dataUpload: '15/01/2024',
      descricao: 'Laudo técnico completo do motor do veículo',
      url: '#'
    },
    {
      id: 2,
      nome: 'Laudo_Eletrico_Sistema.pdf',
      tamanho: 1536000, // 1.5MB
      dataUpload: '15/01/2024',
      descricao: 'Análise do sistema elétrico',
      url: '#'
    }
  ]);
  const [recibos, setRecibos] = useState([
    {
      id: 1,
      nome: 'Recibo_Pecas_001.pdf',
      tamanho: 512000, // 512KB
      dataUpload: '15/01/2024',
      valor: 350.00,
      descricao: 'Recibo de compra de peças para reparo',
      url: '#'
    },
    {
      id: 2,
      nome: 'Recibo_Servicos_Externos.pdf',
      tamanho: 768000, // 768KB
      dataUpload: '15/01/2024',
      valor: 150.00,
      descricao: 'Serviços terceirizados',
      url: '#'
    }
  ]);
  
  // Lista completa de serviços disponíveis (simulado)
  const todosServicos = [
    { value: 'troca-oleo', label: 'Troca de Óleo', description: 'Troca de óleo do motor e filtro' },
    { value: 'alinhamento', label: 'Alinhamento', description: 'Alinhamento e balanceamento' },
    { value: 'freios', label: 'Revisão de Freios', description: 'Verificação e manutenção do sistema de freios' },
    { value: 'suspensao', label: 'Suspensão', description: 'Manutenção do sistema de suspensão' },
    { value: 'ar-condicionado', label: 'Ar Condicionado', description: 'Manutenção do sistema de climatização' },
    { value: 'bateria', label: 'Bateria', description: 'Verificação e troca de bateria' },
    { value: 'pneus', label: 'Pneus', description: 'Verificação e troca de pneus' },
    { value: 'motor', label: 'Revisão de Motor', description: 'Manutenção geral do motor' },
    { value: 'transmissao', label: 'Transmissão', description: 'Manutenção da transmissão/câmbio' },
    { value: 'eletrica', label: 'Sistema Elétrico', description: 'Verificação do sistema elétrico' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Função para obter serviços disponíveis (excluindo os já adicionados)
  const getServicosDisponiveis = () => {
    const servicosAdicionados = servicos.map(servico => servico.value);
    return todosServicos.filter(servico => !servicosAdicionados.includes(servico.value));
  };

  // Serviços disponíveis filtrados
  const servicosDisponiveis = getServicosDisponiveis();

  useEffect(() => {
    // Simular carregamento de dados da OS
    setTimeout(() => {
      setOsData({
        numero: '1421',
        cliente: 'DYLLAN NICOLAU DA SILVA',
        documento: 'CPF: 699.993.050-07',
        veiculo: 'JEEP COMPASS 2021/2021',
        placa: 'RCI-9FT1',
        motivacao: 'PREVENTIVA DE MOTOR - R$ 0,00',
        status: 'EM EXECUÇÃO',
        dataInicio: new Date().toLocaleDateString('pt-BR'),
        horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        execucaoInicial: 'Carlos Mecânico',
        execucaoFinal: null
      });
      setLoading(false);
      
      // Abrir modal de vídeo inicial se ainda não foi feito upload
      if (!videoInicialUploaded) {
        setIsVideoInicialModalOpen(true);
      }
    }, 1000);
  }, [idSocioVeiculoAgenda, videoInicialUploaded]);

  // Handlers para fotos e vídeos
  const handleAddFoto = (event) => {
    const files = Array.from(event.target.files);
    const newFotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      nome: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    setFotos([...fotos, ...newFotos]);
  };

  const handleAddMedia = (mediaItem) => {
    setFotos([...fotos, mediaItem]);
  };

  // Ref para controlar o MediaUpload
  const mediaUploadRef = useRef(null);

  const handleAddMediaClick = () => {
    if (mediaUploadRef.current) {
      mediaUploadRef.current.openFileSelector();
    }
  };

  const handleRemoveFoto = (id) => {
    const foto = fotos.find(f => f.id === id);
    if (foto) {
      URL.revokeObjectURL(foto.url);
    }
    setFotos(fotos.filter(foto => foto.id !== id));
  };

  // Handlers para produtos
  const handleAddProduto = () => {
    const novoProduto = {
      id: Date.now(),
      nome: '',
      quantidade: 1,
      valor: 0
    };
    setProdutos([...produtos, novoProduto]);
  };

  const handleUpdateProduto = (id, field, value) => {
    setProdutos(produtos.map(produto => 
      produto.id === id ? { ...produto, [field]: value } : produto
    ));
  };

  const handleRemoveProduto = (id) => {
    setProdutos(produtos.filter(produto => produto.id !== id));
  };

  // Handlers para serviços
  const handleOpenServiceModal = () => {
    setSelectedService(null);
    setIsServiceModalOpen(true);
  };
  
  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
    setSelectedService(null);
    if (modalDropdownSetter) {
      modalDropdownSetter(false);
    }
  };

  const handleModalDropdownToggle = (setDropdownVisible) => {
    setModalDropdownSetter(() => setDropdownVisible);
  };

  const handleSearchableSelectDropdownToggle = (isOpen) => {
    if (modalDropdownSetter) {
      modalDropdownSetter(isOpen);
    }
  };
  
  const handleConfirmService = () => {
    if (selectedService) {
      // Verificar se o serviço já foi adicionado
      const servicoJaAdicionado = servicos.some(servico => servico.value === selectedService.value);
      
      if (servicoJaAdicionado) {
        alert('Este serviço já foi adicionado à ordem de serviço.');
        return;
      }
      
      const servicoSelecionado = todosServicos.find(s => s.value === selectedService.value);
      const novoServico = {
        id: `servico_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: servicoSelecionado.label,
        value: servicoSelecionado.value,
        descricao: servicoSelecionado.label,
        status: 'pendente',
        tempo: '',
        observacoes: ''
      };
      setServicos([...servicos, novoServico]);
      handleCloseServiceModal();
    }
  };
  
  const handleAddServico = () => {
    handleOpenServiceModal();
  };

  const handleUpdateServico = (id, field, value) => {
    setServicos(servicos.map(servico => 
      servico.id === id ? { ...servico, [field]: value } : servico
    ));
  };

  const handleRemoveServico = (id) => {
    setServicos(servicos.filter(servico => servico.id !== id));
  };

  const handleViewServico = (id) => {
    const servico = servicos.find(s => s.id === id);
    if (servico) {
      alert(`Detalhes do Serviço:\n\nNome: ${servico.label}\nStatus: ${servico.status === 'concluido' ? 'Concluído' : servico.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}\nDescrição: ${servico.descricao || 'Não informado'}\nTempo: ${servico.tempo || 'Não informado'}\nObservações: ${servico.observacoes || 'Nenhuma observação'}`);
    }
  };

  // Handlers para anotações
  const handleOpenNotesModal = () => {
    setIsNotesModalOpen(true);
  };

  const handleCloseNotesModal = () => {
    setIsNotesModalOpen(false);
    setNewNote('');
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        timestamp: new Date().toLocaleString('pt-BR')
      };
      setAnotacoes([...anotacoes, note]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (id) => {
    setAnotacoes(anotacoes.filter(note => note.id !== id));
  };

  // Handlers para ações
  const handleFinalizarOS = () => {
    // Verificar serviços pendentes
    const servicosPendentes = servicos.filter(servico => servico.status !== 'concluido');
    
    // Abrir modal de finalização
    setIsVideoFinalizacaoModalOpen(true);
    setDropdownOpen(false);
  };
  
  // Handlers para modais de vídeo
  const handleVideoInicialConfirm = (video) => {
    console.log('Vídeo inicial enviado:', video);
    setVideoInicialUploaded(true);
    setIsVideoInicialModalOpen(false);
  };
  
  const handleVideoFinalizacaoConfirm = (video) => {
    console.log('Finalizando OS com vídeo:', video);
    console.log('Dados da OS:', {
      osData,
      fotos: fotos.length,
      anotacoes,
      produtos,
      servicos
    });
    
    setVideoFinalizacaoUploaded(true);
    setIsVideoFinalizacaoModalOpen(false);
    
    // Aqui você pode implementar a lógica de finalização da OS
    alert('OS finalizada com sucesso!');
  };
  
  // Função para obter serviços pendentes
  const getServicosPendentes = () => {
    return servicos.filter(servico => servico.status !== 'concluido');
  };

  const handleAdicionarLaudos = () => {
    setIsLaudosModalOpen(true);
    setDropdownOpen(false);
  };

  const handleAdicionarRecibos = () => {
    setIsRecibosModalOpen(true);
    setDropdownOpen(false);
  };
  
  // Handlers para laudos
  const handleRemoveLaudo = (id) => {
    setLaudos(laudos.filter(laudo => laudo.id !== id));
  };
  
  // Handlers para recibos
  const handleRemoveRecibo = (id) => {
    setRecibos(recibos.filter(recibo => recibo.id !== id));
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrapper">
          <Sidebar />
          <div className="main-content">
            <div className="execucao-os__loading">
              <div className="execucao-os__loading-spinner"></div>
              <p>Carregando dados da OS...</p>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!osData) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrapper">
          <Sidebar />
          <div className="main-content">
            <div className="execucao-os__error">
              <p>Erro ao carregar dados da OS</p>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="execucao-os">
            
            {/* Header da OS */}
            <header className="execucao-os__header">
              <div className="execucao-os__header-content">
                <div className="execucao-os__title-section">
                  <h1 className="execucao-os__title">OS #{osData.numero}</h1>
                  <span className={`execucao-os__status execucao-os__status--${osData.status.toLowerCase().replace(' ', '-')}`}>
                    {osData.status}
                  </span>
                </div>
                <div className="execucao-os__meta">
                  <div className="execucao-os__meta-item">
                    <FiCalendar className="execucao-os__meta-icon" />
                    <span>Iniciado em: {osData.dataInicio}</span>
                  </div>
                  <div className="execucao-os__meta-item">
                    <FiClock className="execucao-os__meta-icon" />
                    <span>às {osData.horaInicio}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Informações Básicas */}
            <section className="execucao-os__info-section">
              <h2 className="execucao-os__section-title">Informações da OS</h2>
              <div className="execucao-os__info-grid">
                
                {/* Cliente */}
                <div className="execucao-os__card execucao-os__card--full">
                  <div className="execucao-os__card-header">
                    <FiUser className="execucao-os__card-icon" />
                    <h3 className="execucao-os__card-title">Cliente</h3>
                  </div>
                  <div className="execucao-os__card-content">
                    <div className="execucao-os__info-item">
                      <span className="execucao-os__info-label">Nome:</span>
                      <span className="execucao-os__info-value">{osData.cliente}</span>
                    </div>
                    <div className="execucao-os__info-item">
                      <span className="execucao-os__info-label">Documento:</span>
                      <span className="execucao-os__info-value">{osData.documento}</span>
                    </div>
                    <div className="execucao-os__info-item">
                      <span className="execucao-os__info-label">Veículo:</span>
                      <span className="execucao-os__info-value">{osData.veiculo}</span>
                    </div>
                    <div className="execucao-os__info-item">
                      <span className="execucao-os__info-label">Placa:</span>
                      <span className="execucao-os__info-value">{osData.placa}</span>
                    </div>
                  </div>
                </div>

                {/* Execução */}
                <div className="execucao-os__card execucao-os__card--full">
                  <div className="execucao-os__card-header">
                    <FiTool className="execucao-os__card-icon" />
                    <h3 className="execucao-os__card-title">Execução</h3>
                  </div>
                  <div className="execucao-os__card-content">
                    <div className="execucao-os__execution-grid">
                      <div className="execucao-os__info-item">
                        <span className="execucao-os__info-label">Motivação:</span>
                        <span className="execucao-os__info-value">{osData.motivacao}</span>
                      </div>
                      <div className="execucao-os__info-item">
                        <span className="execucao-os__info-label">Execução Inicial:</span>
                        <span className="execucao-os__info-value">{osData.execucaoInicial || 'Não informado'}</span>
                      </div>
                      <div className="execucao-os__info-item">
                        <span className="execucao-os__info-label">Execução Final:</span>
                        <span className="execucao-os__info-value">{osData.execucaoFinal || 'Não informado'}</span>
                      </div>
                      <div className="execucao-os__info-item">
                        <span className="execucao-os__info-label">Repasse:</span>
                        <span className="execucao-os__info-value">{'R$ 0,00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção de Trabalho */}
            <section className="execucao-os__work-section">
              <h2 className="execucao-os__section-title">Execução dos Trabalhos</h2>
              <div className="execucao-os__work-grid">
                
                {/* Serviços */}
                <div className="execucao-os__card">
                  <div className="execucao-os__card-header">
                    <FiTool className="execucao-os__card-icon" />
                    <h3 className="execucao-os__card-title">Serviços Executados</h3>
                    <button className="execucao-os__add-btn" onClick={handleAddServico}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  <div className="execucao-os__card-content">
                    {servicos.length === 0 ? (
                      <div className="execucao-os__empty-state">
                        <FiTool className="execucao-os__empty-icon" />
                        <p>Nenhum serviço adicionado</p>
                        <button className="execucao-os__empty-btn" onClick={handleAddServico}>
                          Adicionar primeiro serviço
                        </button>
                      </div>
                    ) : (
                      <div className="execucao-os__servicos-table">
                        <div className="execucao-os__table-header">
                          <div className="execucao-os__table-col execucao-os__table-col--status">Status</div>
                          <div className="execucao-os__table-col execucao-os__table-col--service">Nome do Serviço</div>
                          <div className="execucao-os__table-col execucao-os__table-col--actions">Ações</div>
                        </div>
                        <div className="execucao-os__table-body">
                          {servicos.map(servico => (
                            <div key={servico.id} className="execucao-os__table-row">
                              <div className="execucao-os__table-cell execucao-os__table-cell--status">
                                <span className={`execucao-os__status-badge execucao-os__status-badge--${servico.status || 'pendente'}`}>
                                  {servico.status === 'concluido' ? 'Concluído' : 
                                   servico.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                                </span>
                              </div>
                              <div className="execucao-os__table-cell execucao-os__table-cell--service">
                                <span className="execucao-os__service-name">{servico.label}</span>
                              </div>
                              <div className="execucao-os__table-cell execucao-os__table-cell--actions">
                                <button 
                                  className="execucao-os__action-btn-action execucao-os__action-btn--delete"
                                  onClick={() => handleRemoveServico(servico.id)}
                                  title="Excluir serviço"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* MediaUpload oculto para funcionalidade */}
                    <div style={{ display: 'none' }}>
                      <MediaUpload 
                        ref={mediaUploadRef}
                        onMediaAdd={handleAddMedia}
                        acceptedTypes="image/*,video/*"
                        multiple={true}
                        showCamera={true}
                        showVideoRecording={true}
                        hideButtons={true}
                        triggerRef={mediaUploadRef}
                      />
                    </div>
                  </div>
                </div>

                {/* Produtos */}
                {/*
                <div className="execucao-os__card">
                  <div className="execucao-os__card-header">
                    <FiPackage className="execucao-os__card-icon" />
                    <h3 className="execucao-os__card-title">Produtos e Peças</h3>
                    <button className="execucao-os__add-btn" onClick={handleAddProduto}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  <div className="execucao-os__card-content">
                    {produtos.length === 0 ? (
                      <div className="execucao-os__empty-state">
                        <FiPackage className="execucao-os__empty-icon" />
                        <p>Nenhum produto adicionado</p>
                        <button className="execucao-os__empty-btn" onClick={handleAddProduto}>
                          Adicionar primeiro produto
                        </button>
                      </div>
                    ) : (
                      <div className="execucao-os__produtos-list">
                        {produtos.map(produto => (
                          <div key={produto.id} className="execucao-os__produto-item">
                            <input
                              type="text"
                              placeholder="Nome do produto"
                              value={produto.nome}
                              onChange={(e) => handleUpdateProduto(produto.id, 'nome', e.target.value)}
                              className="execucao-os__produto-input execucao-os__produto-input--name"
                            />
                            <input
                              type="number"
                              placeholder="Qtd"
                              value={produto.quantidade}
                              onChange={(e) => handleUpdateProduto(produto.id, 'quantidade', parseInt(e.target.value) || 0)}
                              className="execucao-os__produto-input execucao-os__produto-input--qty"
                              min="1"
                            />
                            <input
                              type="number"
                              placeholder="Valor"
                              value={produto.valor}
                              onChange={(e) => handleUpdateProduto(produto.id, 'valor', parseFloat(e.target.value) || 0)}
                              className="execucao-os__produto-input execucao-os__produto-input--price"
                              step="0.01"
                              min="0"
                            />
                            <button 
                              className="execucao-os__remove-btn"
                              onClick={() => handleRemoveProduto(produto.id)}
                              title="Remover produto"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                */}

                {/* Fotos e Vídeos */}
                <div className="execucao-os__card">
                  <div className="execucao-os__card-header">
                    <FiCamera className="execucao-os__card-icon" />
                    <h3 className="execucao-os__card-title">Fotos e Vídeos da Execução (opcional)</h3>
                    <button className="execucao-os__add-btn" style={{padding: '8px 16px'}} onClick={handleAddMediaClick}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  <div className="execucao-os__card-content">
                    {fotos.length === 0 ? (
                      <div className="execucao-os__empty-state">
                        <FiCamera className="execucao-os__empty-icon" />
                        <p>Nenhuma foto ou vídeo adicionado</p>
                        <button className="execucao-os__empty-btn" onClick={handleAddMediaClick}>
                          Adicionar primeira foto ou vídeo
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="execucao-os__fotos-grid">
                          {fotos.map(foto => (
                            <div key={foto.id} className="execucao-os__foto-item">
                              {foto.type === 'image' ? (
                                <img src={foto.url} alt={foto.nome} className="execucao-os__foto-preview" />
                              ) : (
                                <div className="execucao-os__video-container">
                                  <video 
                                    src={foto.url} 
                                    className="execucao-os__video-preview"
                                    controls
                                    preload="metadata"
                                  />
                                  <div className="execucao-os__video-overlay">
                                    <FiVideo size={24} />
                                  </div>
                                </div>
                              )}
                              <button 
                                className="execucao-os__foto-remove"
                                onClick={() => handleRemoveFoto(foto.id)}
                                title={`Remover ${foto.type === 'image' ? 'foto' : 'vídeo'}`}
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Anotações */}
                <div className="execucao-os__card">
                  <div className="execucao-os__card-header">
                    <FiFileText className="execucao-os__card-icon" />
                    <h3 className="execucao-os__card-title">Anotações Gerais (opcional)</h3>
                    <button className="execucao-os__add-btn" onClick={handleOpenNotesModal}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  <div className="execucao-os__card-content">
                    {anotacoes.length === 0 ? (
                      <div className="execucao-os__empty-state">
                        <FiFileText className="execucao-os__empty-icon" />
                        <p>Nenhuma anotação adicionada</p>
                        <button className="execucao-os__empty-btn" onClick={handleOpenNotesModal}>
                          Adicionar primeira anotação
                        </button>
                      </div>
                    ) : (
                      <div className="execucao-os__anotacoes-list">
                        {anotacoes.map(note => (
                          <div key={note.id} className="execucao-os__anotacao-item">
                            <div className="execucao-os__anotacao-content">
                              <p className="execucao-os__anotacao-text">{note.text}</p>
                              <span className="execucao-os__anotacao-timestamp">{note.timestamp}</span>
                            </div>
                            <button 
                              className="execucao-os__remove-btn"
                              onClick={() => handleRemoveNote(note.id)}
                              title="Remover anotação"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Botões de Ação */}
            <div className="execucao-os__actions">
              <div className="execucao-os__actions-desktop">
                <Button 
                  variant="secondary"
                  size="large"
                  onClick={handleAdicionarLaudos}
                  className="execucao-os__action-btn-custom"
                >
                  <FiFileText size={20} />
                  Adicionar Laudos
                </Button>
                <Button 
                  variant="secondary"
                  size="large"
                  onClick={handleAdicionarRecibos}
                  className="execucao-os__action-btn-custom"
                >
                  <FiDollarSign size={20} />
                  Adicionar Recibos
                </Button>
                <Button 
                  variant="primary"
                  size="large"
                  onClick={handleFinalizarOS}
                  className="execucao-os__action-btn-custom"
                >
                  <FiCheck size={20} />
                  Finalizar OS
                </Button>
              </div>
              
              <div className="execucao-os__actions-mobile">
                <div className="execucao-os__dropdown">
                  <button 
                    className="execucao-os__dropdown-toggle"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <FiMoreVertical size={20} />
                    Ações
                  </button>
                  {dropdownOpen && (
                    <div className="execucao-os__dropdown-menu">
                      <button 
                        className="execucao-os__dropdown-item"
                        onClick={handleAdicionarLaudos}
                      >
                        <FiFileText size={16} />
                        Adicionar Laudos
                      </button>
                      <button 
                        className="execucao-os__dropdown-item"
                        onClick={handleAdicionarRecibos}
                      >
                        <FiDollarSign size={16} />
                        Adicionar Recibos
                      </button>
                      <button 
                        className="execucao-os__dropdown-item"
                        onClick={handleFinalizarOS}
                      >
                        <FiCheck size={16} />
                        Finalizar OS
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <BottomNavigation />
      
      {/* Modal de Seleção de Serviços */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={handleCloseServiceModal}
        title="Selecionar Serviço"
        onDropdownToggle={handleModalDropdownToggle}
      >
        <div className="service-modal-content">
          <div className="service-modal-description">
            <p>Selecione o serviço que será executado na ordem de serviço:</p>
          </div>

          <div className="service-modal-select">
            <SearchableSelect
              options={getServicosDisponiveis()}
              value={selectedService?.value || null}
              onChange={setSelectedService}
              placeholder="Pesquisar e selecionar serviço..."
              searchPlaceholder="Digite para pesquisar..."
              noOptionsText="Nenhum serviço encontrado"
              onDropdownToggle={(isOpen) => {
                if (modalDropdownSetter) {
                  modalDropdownSetter(isOpen);
                }
              }}
            />
          </div>
          
          <div className="service-modal-actions">
            <Button
              variant="secondary"
              onClick={handleCloseServiceModal}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmService}
              disabled={!selectedService}
            >
              Confirmar Serviço
            </Button>
          </div>
        </div>
        
        <style jsx>{`
          .service-modal-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          
          .service-modal-description {
            text-align: center;
          }
          
          .service-modal-description p {
            margin: 0;
            color: var(--gray-600);
            font-size: 14px;
            line-height: 1.5;
          }
          
          .service-modal-select {
            width: 100%;
          }
          
          .service-modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding-top: 16px;
            border-top: 1px solid var(--gray-200);
          }
          
          @media (max-width: 480px) {
            .service-modal-actions {
              flex-direction: column-reverse;
            }
          }
        `}</style>
      </Modal>
      
      {/* Modal de Anotações */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={handleCloseNotesModal}
        title="Gerenciar Anotações"
      >
        <div className="notes-modal-content">
          <div className="notes-modal-description">
            <p>Adicione anotações sobre a execução da OS e gerencie as existentes:</p>
          </div>
          
          <div className="notes-modal-form">
            <textarea
              className="notes-modal-textarea"
              placeholder="Digite sua anotação..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              <FiPlus size={16} />
              Adicionar Anotação
            </Button>
          </div>
          
          {anotacoes.length > 0 && (
            <div className="notes-modal-list">
              <h4>Anotações Existentes:</h4>
              <div className="notes-list">
                {anotacoes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-content">
                      <p className="note-text">{note.text}</p>
                      <span className="note-timestamp">{note.timestamp}</span>
                    </div>
                    <button 
                      className="note-remove-btn"
                      onClick={() => handleRemoveNote(note.id)}
                      title="Remover anotação"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <style jsx>{`
          .notes-modal-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          
          .notes-modal-description {
            text-align: center;
            color: #64748b;
          }
          
          .notes-modal-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .notes-modal-textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            min-height: 100px;
            transition: border-color 0.2s ease;
          }
          
          .notes-modal-textarea:focus {
            outline: none;
            border-color: var(--primary);
          }
          
          .notes-modal-list {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          
          .notes-modal-list h4 {
            margin: 0 0 16px 0;
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
          }
          
          .notes-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: 300px;
            overflow-y: auto;
          }
          
          .note-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          
          .note-item:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
          }
          
          .note-content {
            flex: 1;
          }
          
          .note-text {
            margin: 0 0 8px 0;
            color: #1e293b;
            line-height: 1.5;
            word-break: break-word;
          }
          
          .note-timestamp {
            font-size: 12px;
            color: #64748b;
            font-style: italic;
          }
          
          .note-remove-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            color: #dc2626;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          
          .note-remove-btn:hover {
            background: #fecaca;
            border-color: #f87171;
            color: #b91c1c;
          }
          
          @media (max-width: 480px) {
            .notes-modal-content {
              gap: 20px;
            }
            
            .note-item {
              padding: 12px;
            }
            
            .notes-list {
              max-height: 250px;
            }
          }
        `}</style>
      </Modal>
      
      {/* Modal de vídeo inicial */}
      <VideoInicialModal
        isOpen={isVideoInicialModalOpen}
        onConfirm={handleVideoInicialConfirm}
      />
      
      {/* Modal de vídeo de finalização */}
      <VideoFinalizacaoModal
        isOpen={isVideoFinalizacaoModalOpen}
        onConfirm={handleVideoFinalizacaoConfirm}
        onCancel={() => setIsVideoFinalizacaoModalOpen(false)}
        servicosPendentes={getServicosPendentes()}
      />
      
      {/* Modal de Laudos */}
      <LaudosModal
        isOpen={isLaudosModalOpen}
        onClose={() => setIsLaudosModalOpen(false)}
        laudos={laudos}
        setLaudos={setLaudos}
        onRemoveLaudo={handleRemoveLaudo}
      />
      
      {/* Modal de Recibos */}
      <RecibosModal
        isOpen={isRecibosModalOpen}
        onClose={() => setIsRecibosModalOpen(false)}
        recibos={recibos}
        setRecibos={setRecibos}
        onRemoveRecibo={handleRemoveRecibo}
      />
    </div>
  );
};

export default ExecutaOS;
