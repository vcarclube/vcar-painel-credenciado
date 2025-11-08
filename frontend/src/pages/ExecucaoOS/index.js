import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FiVideo,
  FiTrash
} from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, Modal, SearchableSelect, Button, MediaUpload, LaudosModal, RecibosModal } from '../../components';
import { VideoInicialModal, VideoFinalizacaoModal } from '../../components/Modal';
import mediaBunnyCompression from '../../utils/MediaBunnyCompression';
import './style.css';
import Api from '../../Api';
import { toast } from 'react-toastify';
import { MainContext } from '../../helpers/MainContext';

const ExecutaOS = () => {
  const navigate = useNavigate();

  const { user } = useContext(MainContext);

  const { idSocioVeiculoAgenda } = useParams();
  const [osData, setOsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agendamento, setAgendamento] = useState(null);

  // Estados para funcionalidades
  const [fotos, setFotos] = useState([]);
  const [anotacoes, setAnotacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Estados para compressão de vídeos
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

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

  // Estados para uploads no modal de Selecionar Serviço
  const [serviceVideoFile, setServiceVideoFile] = useState(null);
  const [serviceVideoPreview, setServiceVideoPreview] = useState(null);
  const [serviceVideoError, setServiceVideoError] = useState('');
  const [servicePhotosFiles, setServicePhotosFiles] = useState([]);
  const [servicePhotosPreviews, setServicePhotosPreviews] = useState([]);
  const [servicePhotosError, setServicePhotosError] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const serviceMediaUploadRef = useRef(null);
  const [videoFinalizacaoUploaded, setVideoFinalizacaoUploaded] = useState(false);

  // Estados para modais de laudos e recibos
  const [isLaudosModalOpen, setIsLaudosModalOpen] = useState(false);
  const [isRecibosModalOpen, setIsRecibosModalOpen] = useState(false);

  // Estados para modal de confirmação de exclusão
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState(null);
  const [laudos, setLaudos] = useState([]);
  const [recibos, setRecibos] = useState([]);

  const [todosServicos, setTodosServicos] = useState([]);

  const [btnLoading, setBtnLoading] = useState(false);

  const [limiteAnuaisServicos, setLimiteAnuaisServicos] = useState([]);

  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false);

  // Modal de visualização de mídia
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);

  const handleOpenMediaPreview = (media) => {
    if (!media) return;
    setMediaPreview(media);
    setIsMediaPreviewOpen(true);
  };

  const handleCloseMediaPreview = () => {
    setIsMediaPreviewOpen(false);
    setMediaPreview(null);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getAgendamento((refOsData) => {
      getServicos(refOsData);
      getLimiteAnuaisServicos(refOsData);
      getServicosVinculados();
      getFotosAgendamento();
      getAnotacoesAgendamento();
      getNotasFiscaisAgendamento();
      getLaudosAgendamento();
    });
  }, [idSocioVeiculoAgenda, videoInicialUploaded]);

  // Verificar se há suporte ao MediaBunny
  useEffect(() => {
    console.log('🎬 MediaBunny carregado para compressão de mídia');
  }, []);

  const getAgendamento = async (callback) => {
    try {
      const response = await Api.getAgendamentoDetails({ idSocioVeiculoAgenda });
      if (response.status === 200) {
        setAgendamento(response.data);

        let _agendamento = response.data;

        setOsData({
          id: _agendamento?.agendamento?.IdSocioVeiculoAgenda,
          numero: _agendamento?.agendamento?.NumeroOS,
          cliente: _agendamento?.socio?.Nome,
          idSocio: _agendamento?.socio?.IdSocio,
          documento: _agendamento?.socio?.Cpf,
          idSocioVeiculo: _agendamento?.socioVeiculo?.IdSocioVeiculo,
          idMotivacao: _agendamento?.motivo?.IdMotivacao,
          veiculo: `${_agendamento?.socioVeiculo?.MarcaVeiculo} ${_agendamento?.socioVeiculo?.Ano} ${_agendamento?.socioVeiculo?.Litragem}`,
          tipoVeiculo: _agendamento?.socioVeiculo?.TipoVeiculo,
          placa: _agendamento?.socioVeiculo?.Placa?.toUpperCase(),
          motivacao: _agendamento?.motivo?.Descricao?.toUpperCase(),
          status: _agendamento?.agendamento?.StatusAgendamento == 'A' ? 'EM EXECUÇÃO' : 'CONCLUIDA',
          dataInicio: new Date(_agendamento?.execucao?.DataHoraInicio).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          horaInicio: new Date(_agendamento?.execucao?.DataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          execucaoInicial: _agendamento?.execucao?.ExecutorInicio,
          execucaoFinal: _agendamento?.execucao?.ExecutorFim,
          videoInicial: _agendamento?.agendamento?.VideoInicial,
          videoFinal: _agendamento?.agendamento?.VideoFinal
        });
        setLoading(false);

        if (!videoInicialUploaded) {
          setIsVideoInicialModalOpen(true);
        }

        if (callback) {
          callback(_agendamento);
        }
      }
    } catch (error) {
      console.error('Erro ao obter agendamento:', error);
    }
  };

  const getServicos = async (refOsData) => {
    try {
      const response = await Api.getPontoAtendimentoServicos({ idPontoAtendimento: user?.IdPontoAtendimento });
      if (response) {
        let _servicos = response?.data?.servicos;
        let _filteredServico = _servicos.filter(s => { return s.TipoVeiculo == refOsData?.socioVeiculo?.TipoVeiculo && s.FornecidoPelaVcar != "S" });
        setTodosServicos(_filteredServico);
      }
    } catch (error) {
      console.error('Erro ao obter serviços:', error);
    }
  }

  const getLimiteAnuaisServicos = async (refOsData) => {
    try {
      const response = await Api.getLimiteAnualServicos({ idSocioVeiculo: refOsData?.socioVeiculo?.IdSocioVeiculo });
      if (response) {
        setLimiteAnuaisServicos(response?.data);
      }
    } catch (error) {
      console.error('Erro ao obter limites anuais:', error);
    }
  }

  const getServicosVinculados = async () => {
    try {
      const response = await Api.getServicosVinculadosAgendamento({ idSocioVeiculoAgenda });
      if (response.status === 200) {
        setServicos(response?.data?.servicos);
      }
    } catch (error) {
      console.error('Erro ao obter serviços:', error);
    }
  }

  // Função para obter serviços disponíveis (excluindo os já adicionados)
  const getServicosDisponiveis = () => {
    //console.log(servicos);
    const servicosAdicionados = servicos.map(servico => servico.value);
    return todosServicos.filter(servico => !servicosAdicionados.includes(servico.value));
  };

  // Função para compactar mídia usando MediaBunny
  const compressMedia = async (file) => {
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const compressedFile = await mediaBunnyCompression.compressFile(file, (progress) => {
        setCompressionProgress(progress);
      });

      return compressedFile;
    } catch (error) {
      console.error('❌ Erro na compressão:', error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  };



  // Função para carregar fotos do agendamento
  const getFotosAgendamento = async () => {
    try {
      const response = await Api.getFotosAgendamento({ idSocioVeiculoAgenda });
      if (response.status === 200 && response.data && response.data.fotos) {
        const fotosFormatadas = response.data.fotos.map(foto => ({
          id: foto.IdSocioVeiculoAgendaExecucaoFoto,
          nome: foto.Foto,
          url: Api.getUriUploadPath(foto.Foto),
          type: foto.Foto.toLowerCase().includes('.mp4') || foto.Foto.toLowerCase().includes('.mov') ? 'video' : 'image',
          idSocioVeiculoAgendaExecucaoFoto: foto.IdSocioVeiculoAgendaExecucaoFoto
        }));
        setFotos(fotosFormatadas);
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    }
  };

  // Handlers para fotos e vídeos
  const handleAddFoto = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      uploadFoto(file);
    });
  };

  const uploadFoto = async (file) => {
    try {
      let fileToUpload = file;

      // Verificar se precisa de compressão (vídeo ou imagem)
      if (mediaBunnyCompression.needsCompression(file)) {
        try {
          const mediaType = file.type.startsWith('video/') ? 'vídeo' : 'imagem';
          toast.info(`Comprimindo ${mediaType}, aguarde...`);
          fileToUpload = await compressMedia(file);
          toast.success(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} comprimido com sucesso!`);
        } catch (error) {
          console.error('Erro na compressão, enviando arquivo original:', error);
          toast.warning('Erro na compressão, enviando arquivo original');
          fileToUpload = file;
        }
      }

      toast.info(`Enviando arquivo...`);

      // Primeiro faz upload do arquivo
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const uploadResponse = await Api.upload(formData);

      console.log(uploadResponse.success);

      if (uploadResponse.success) {
        // Depois adiciona a foto ao agendamento
        const addFotoResponse = await Api.adicionaFotoAgendamento({
          idSocioVeiculoAgenda,
          idPontoAtendimentoUsuario: user.IdPontoAtendimentoUsuario,
          foto: uploadResponse.file
        });

        if (addFotoResponse.status === 200) {
          toast.success('Arquivo enviado com sucesso!');
          getFotosAgendamento(); // Recarrega as fotos
        } else {
          toast.error('Erro ao enviar arquivo');
        }
      } else {
        toast.error('Erro no upload do arquivo');
      }
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      toast.error('Erro ao fazer upload do arquivo');
    }
  };

  const handleAddMedia = (mediaItem) => {
    if (mediaItem.file) {
      uploadFoto(mediaItem.file);
    }
  };

  // Ref para controlar o MediaUpload
  const mediaUploadRef = useRef(null);

  const handleAddMediaClick = () => {
    if (mediaUploadRef.current) {
      mediaUploadRef.current.openFileSelector();
    }
  };

  const handleRemoveFoto = async (id) => {
    try {
      const foto = fotos.find(f => f.id === id);
      if (foto && foto.idSocioVeiculoAgendaExecucaoFoto) {
        const response = await Api.deletaFotoAgendamento({
          idSocioVeiculoAgendaExecucaoFoto: foto.idSocioVeiculoAgendaExecucaoFoto
        });

        if (response.status === 200) {
          toast.success('Foto removida com sucesso!');
          getFotosAgendamento(); // Recarrega as fotos
        } else {
          toast.error('Erro ao remover foto');
        }
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error('Erro ao remover foto');
    }
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

  // Mídias provenientes dos serviços vinculados (Foto1, Foto2, Foto3, Video)
  const servicosMedia = (servicos || []).flatMap((s) => {
    const items = [];
    const servicoId = s?.id || s?.IdSocioVeiculoAgendaExecucaoServico || s?.IdSocioVeiculoAgendaExecucaoServico;
    const addItem = (filename, typeHint) => {
      if (!filename) return;
      const lower = String(filename).toLowerCase();
      const isVideo = typeHint === 'video' || lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm');
      items.push({
        id: `servico-${servicoId}-${isVideo ? 'video' : 'foto'}-${filename}`,
        nome: filename,
        url: Api.getUriUploadPath(filename),
        type: isVideo ? 'video' : 'image',
        // sem idSocioVeiculoAgendaExecucaoFoto para evitar opção de remoção
      });
    };
    addItem(s?.Foto1, 'image');
    addItem(s?.Foto2, 'image');
    addItem(s?.Foto3, 'image');
    addItem(s?.Video, 'video');
    return items;
  });

  // Mídias combinadas: fotos/vídeos do agendamento + mídias dos serviços
  const combinedMedia = [...servicosMedia, ...(fotos || [])];

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
    setSelectedService(null);
    if (modalDropdownSetter) {
      modalDropdownSetter(false);
    }
    // Parar câmera se estiver ativa
    try { serviceMediaUploadRef.current?.stopCamera?.(); } catch {}
    // Limpar uploads do modal de serviço ao fechar
    if (serviceVideoPreview) {
      try { URL.revokeObjectURL(serviceVideoPreview); } catch {}
    }
    servicePhotosPreviews.forEach((url) => { try { URL.revokeObjectURL(url); } catch {} });
    setServiceVideoFile(null);
    setServiceVideoPreview(null);
    setServiceVideoError('');
    setServicePhotosFiles([]);
    setServicePhotosPreviews([]);
    setServicePhotosError('');
    setServiceDescription('');
  };

  // Detecção de dispositivo (mobile vs desktop)
  const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i;
    const touch = navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    return mobileRegex.test(ua) || touch;
  };

  // Abertura sob demanda: usuário clica para selecionar fotos/vídeo
  const handleSelectPhotosClick = (e) => {
    // No mobile, abrir câmera; no desktop, deixar o label disparar o input
    if (isMobileDevice()) {
      e.preventDefault();
      try { serviceMediaUploadRef.current?.startCamera?.(); } catch {}
    }
  };

  const handleSelectVideoClick = (e) => {
    // Deixar o label disparar o input de vídeo (com capture no mobile)
    // Não abrir automaticamente ao montar o modal
    // Caso futuramente queira gravar via MediaUpload, poderemos chamar startVideoRecording aqui.
  };

  const handleModalDropdownToggle = (setDropdownVisible) => {
    setModalDropdownSetter(() => setDropdownVisible);
  };

  const handleSearchableSelectDropdownToggle = (isOpen) => {
    if (modalDropdownSetter) {
      modalDropdownSetter(isOpen);
    }
  };

const handleConfirmService = async () => {
  if (selectedService) {
    // Validações obrigatórias: vídeo ≤ 1min e pelo menos 3 fotos
    if (!serviceVideoFile) {
      toast.info('Selecione um vídeo de até 1 minuto.');
      return;
    }
    if (serviceVideoError) {
      toast.info(serviceVideoError || 'Vídeo inválido (máximo 60 segundos).');
      return;
    }
    if (servicePhotosFiles.length < 3) {
      toast.info('Selecione pelo menos 3 fotos.');
      return;
    }
    if (servicePhotosFiles.length > 3) {
      toast.info('Máximo de 3 fotos.');
      return;
    }

    // Verificar se o serviço já foi adicionado
    const servicoJaAdicionado = servicos.some(servico => servico.value === selectedService.value);

      if (servicoJaAdicionado) {
        alert('Este serviço já foi adicionado à ordem de serviço.');
        return;
      }

      const servicoSelecionado = todosServicos.find(s => s.value === selectedService.value);

      setBtnLoading(true);

      let garantiaResponse = await Api.verificarGarantiaServico({
        idServico: servicoSelecionado.value,
        idSocioVeiculo: osData?.idSocioVeiculo,
      })

      if (garantiaResponse?.data?.garantiaValida) {
        toast.info(`Este serviço está na garantia, foi feito recentemente.`);
        setBtnLoading(false);
        return;
      }

      let _servico = limiteAnuaisServicos?.servicos?.filter(s => { return s.idServico === servicoSelecionado.value })[0];

      if (_servico?.limiteAnual > 0 && !_servico?.podeUsar) {
        toast.info(`Serviço não pode ser usado, limite anual atingido.`);
        setBtnLoading(false);
        return;
      }

      // Upload dos arquivos do serviço (vídeo e até 3 fotos) com compressão
      const uploadSingle = async (file) => {
        let fileToUpload = file;
        try {
          if (mediaBunnyCompression.needsCompression(file)) {
            toast.info('Comprimindo mídia, aguarde...');
            fileToUpload = await compressMedia(file);
          }
          const formData = new FormData();
          formData.append('file', fileToUpload);
          const uploadResponse = await Api.upload(formData);
          if (!uploadResponse?.success || !uploadResponse?.file) {
            throw new Error('Falha no upload da mídia');
          }
          return uploadResponse.file;
        } catch (err) {
          console.error('Erro no upload:', err);
          throw err;
        }
      };

      let videoFilename = null;
      const fotosFilenames = [];

      try {
        toast.info('Enviando vídeo do serviço...');
        videoFilename = await uploadSingle(serviceVideoFile);
        toast.success('Vídeo enviado com sucesso');

        if (servicePhotosFiles.length > 0) {
          toast.info('Enviando fotos do serviço...');
          for (let i = 0; i < Math.min(3, servicePhotosFiles.length); i++) {
            const fname = await uploadSingle(servicePhotosFiles[i]);
            fotosFilenames.push(fname);
          }
          toast.success('Fotos enviadas com sucesso');
        }
      } catch (uploadErr) {
        setBtnLoading(false);
        toast.error('Erro ao enviar mídias do serviço. Tente novamente.');
        return;
      }

      await Api.vincularServicoAgendamento({
        idPontoAtendimentoUsuario: user?.IdPontoAtendimentoUsuario,
        idSocioVeiculoAgenda,
        idServico: servicoSelecionado.value,
        numeroOS: osData?.numero,
        descricao: serviceDescription?.trim() || null,
        video: videoFilename,
        fotos: fotosFilenames,
        foto1: fotosFilenames[0],
        foto2: fotosFilenames[1],
        foto3: fotosFilenames[2],
      })

      setBtnLoading(false);

      toast.success(`Serviço adicionado com sucesso, aguarde aprovação da matriz...`)

      getServicosVinculados();
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

  const handleRemoveServico = async (servico) => {
    setServicoToDelete(servico);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleConfirmDeleteServico = async () => {
    if (servicoToDelete) {
      try {
        // Remove o serviço da lista
        await Api.desvincularServicoAgendamento({
          idSocioVeiculoAgendaExecucaoServico: servicoToDelete.id
        })

        getServicosVinculados();

        toast.success('Serviço removido com sucesso!');
      } catch (error) {
        console.error('Erro ao remover serviço:', error);
        toast.error('Erro ao remover serviço');
      }
    }
    setIsConfirmDeleteModalOpen(false);
    setServicoToDelete(null);
  };

  const handleCancelDeleteServico = () => {
    setIsConfirmDeleteModalOpen(false);
    setServicoToDelete(null);
  };

  const handleViewServico = (id) => {
    const servico = servicos.find(s => s.id === id);
    if (servico) { }
  };

  // Handlers para anotações
  const handleOpenNotesModal = () => {
    setIsNotesModalOpen(true);
  };

  const handleCloseNotesModal = () => {
    setIsNotesModalOpen(false);
    setNewNote('');
  };

  // Função para carregar anotações da API
  const getAnotacoesAgendamento = async () => {
    try {
      const response = await Api.getAnotacoesAgendamento({ idSocioVeiculoAgenda });
      if (response.status === 200 && response.data.anotacoes) {
        const anotacoesFormatadas = response.data.anotacoes.map(anotacao => ({
          id: anotacao.IdSocioVeiculoAgendaExecucaoAnotacao,
          text: anotacao.Anotacao,
          timestamp: new Date(anotacao.DataLog).toLocaleString('pt-BR')
        }));
        setAnotacoes(anotacoesFormatadas);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
      toast.error('Erro ao carregar anotações');
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const response = await Api.adicionarAnotacaoAgendamento({
          idSocioVeiculoAgenda,
          idPontoAtendimentoUsuario: user.IdPontoAtendimentoUsuario,
          anotacao: newNote.trim(),
          data: new Date().toISOString()
        });

        if (response.status === 200) {
          toast.success('Anotação adicionada com sucesso!');
          setNewNote('');
          // Recarregar anotações
          getAnotacoesAgendamento();
        } else {
          toast.error('Erro ao adicionar anotação');
        }
      } catch (error) {
        console.error('Erro ao adicionar anotação:', error);
        toast.error('Erro ao adicionar anotação');
      }
    }
  };

  const handleRemoveNote = async (id) => {
    try {
      const response = await Api.deleteAnotacaoAgendamento({
        idSocioVeiculoAgendaExecucaoAnotacao: id
      });

      if (response.status === 200) {
        toast.success('Anotação removida com sucesso!');
        // Recarregar anotações
        getAnotacoesAgendamento();
      } else {
        toast.error('Erro ao remover anotação');
      }
    } catch (error) {
      console.error('Erro ao remover anotação:', error);
      toast.error('Erro ao remover anotação');
    }
  };

  // Handlers para ações
  const handleFinalizarOS = () => {
    // Verificar serviços pendentes
    const servicosPendentes = servicos.filter(servico => servico.status !== 'P');

    // Abrir modal de finalização
    setIsVideoFinalizacaoModalOpen(true);
    setDropdownOpen(false);
  };

  const handleCancelOS = () => {
    setIsConfirmCancelModalOpen(false);
  };

  const handleCancelarOS = () => {
    setIsConfirmCancelModalOpen(true);
  }

  const handleCancelConfirmOS = () => {
    setIsConfirmCancelModalOpen(false);
  };

  const handleConfirmOS = async () => {
    let response = await Api.cancelar({
      idSocioVeiculoAgenda: osData.id,
      motivo: 'serviço cancelado pelo credenciado.',
      idSocio: osData.idSocio,
      idSocioVeiculo: osData.idSocioVeiculo,
      idPontoAtendimento: user?.IdPontoAtendimento,
      data: new Date().toISOString()
    })

    if (response) {
      toast.success('OS cancelada com sucesso!');
      navigate('/')
    } else {
      toast.error('Erro ao cancelar OS');
    }
  }

  // Handlers para modais de vídeo
  const handleVideoInicialConfirm = async (video, videoResult) => {
    console.log('Vídeo inicial enviado:', video, videoResult);

    await Api.atualizarVideoInicial({
      idSocioVeiculoAgenda: osData.id,
      videoInicial: videoResult?.file
    });

    setVideoInicialUploaded(true);
    setIsVideoInicialModalOpen(false);
  };

  const handleVideoFinalizacaoConfirm = async (video, videoResult) => {
    console.log('Finalizando OS com vídeo:', video);
    console.log('Dados da OS:', {
      osData,
      fotos: fotos.length,
      anotacoes,
      produtos,
      servicos
    });

    await Api.atualizarVideoFinal({
      idSocioVeiculoAgenda: osData.id,
      videoFinal: videoResult?.file
    })

    await Api.concluirAgendamento({
      idSocioVeiculoAgenda: osData.id,
      idSocio: osData.idSocio,
      idPontoAtendimentoUsuario: user.IdPontoAtendimentoUsuario,
      data: new Date().toISOString()
    })

    await getAgendamento();

    setVideoFinalizacaoUploaded(true);
    setIsVideoFinalizacaoModalOpen(false);

    toast.success('OS finalizada com sucesso!');
  };

  // Função para obter serviços pendentes
  const getServicosPendentes = () => {
    return servicos.filter(servico => servico.status !== 'A');
  };

  const handleAdicionarLaudos = () => {
    setIsLaudosModalOpen(true);
    setDropdownOpen(false);
  };

  const handleAdicionarRecibos = () => {
    setIsRecibosModalOpen(true);
    setDropdownOpen(false);
  };

  // Função para carregar laudos da API
  const getLaudosAgendamento = async () => {
    try {
      const response = await Api.getLaudosAgendamento({ idSocioVeiculoAgenda });
      if (response) {
        setLaudos(response?.data.laudos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar laudos:', error);
      toast.error('Erro ao carregar laudos');
    }
  };

  // Função para adicionar laudo
  const handleAddLaudo = async (laudoData) => {
    console.log(laudoData)
    try {
      const response = await Api.adicionarLaudoAgendamento({
        idSocioVeiculoAgenda,
        idPontoAtendimentoUsuario: user.IdPontoAtendimentoUsuario,
        ...laudoData
      });

      if (response) {
        // Recarregar a lista de laudos
        await getLaudosAgendamento();
      }
    } catch (error) {
      console.error('Erro ao adicionar laudo:', error);
      toast.error('Erro ao adicionar laudo');
      throw error;
    }
  };

  // Função para remover laudo
  const handleRemoveLaudo = async (laudoId) => {
    try {
      await Api.deletarLaudoAgendamento({ idSocioVeiculoAgendaLaudo: laudoId });
      // Recarregar a lista de laudos
      await getLaudosAgendamento();
      toast.success('Laudo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover laudo:', error);
      toast.error('Erro ao remover laudo');
      throw error;
    }
  };

  // Função para carregar recibos da API
  const getNotasFiscaisAgendamento = async () => {
    try {
      const response = await Api.getNotasFiscaisAgendamento({ idSocioVeiculoAgenda });
      if (response) {
        setRecibos(response?.data.notas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar recibos:', error);
      toast.error('Erro ao carregar recibos');
    }
  };

  // Função para adicionar recibo
  const handleAddRecibo = async (reciboData) => {
    try {
      const response = await Api.adicionarNotaFiscalAgendamento({
        idSocioVeiculoAgenda,
        idPontoAtendimentoUsuario: user.IdPontoAtendimentoUsuario,
        ...reciboData
      });
      if (response.status === 200) {
        toast.success('Recibo adicionado com sucesso!');
        await getNotasFiscaisAgendamento(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao adicionar recibo:', error);
      toast.error('Erro ao adicionar recibo');
    }
  };

  // Handlers para recibos
  const handleRemoveRecibo = async (id) => {
    try {
      const response = await Api.deletarNotaFiscalAgendamento({ idSocioVeiculoAgendaNotaFiscal: id });
      if (response.status === 200) {
        toast.success('Recibo removido com sucesso!');
        await getNotasFiscaisAgendamento(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao remover recibo:', error);
      toast.error('Erro ao remover recibo');
    }
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
        <div className="main-content" style={{ marginBottom: '0px', paddingBottom: '0px' }}>
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
                    <span>Iniciado em: {osData.dataInicio?.split(",")[0]}</span>
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
                    <h3 className="execucao-os__card-title">Serviços</h3>
                    <button className="execucao-os__add-btn" style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }} onClick={handleAddServico}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  <div className="execucao-os__card-content">
                    {servicos.length === 0 ? (
                      <div className="execucao-os__empty-state">
                        <FiTool className="execucao-os__empty-icon" />
                        <p>Nenhum serviço adicionado</p>
                        <button className="execucao-os__empty-btn" style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }} onClick={handleAddServico}>
                          Adicionar primeiro serviço
                        </button>
                      </div>
                    ) : (
                      <div className="execucao-os__servicos-table">
                        <div className="execucao-os__table-header">
                          <div className="execucao-os__table-col execucao-os__table-col--status-icon">Status</div>
                          <div className="execucao-os__table-col execucao-os__table-col--status">Comissão</div>
                          <div className="execucao-os__table-col execucao-os__table-col--service">Nome do Serviço</div>
                          <div className="execucao-os__table-col execucao-os__table-col--actions">Ações</div>
                        </div>
                        <div className="execucao-os__table-body">
                          {servicos.map(servico => (
                            <div key={servico.id} className="execucao-os__table-row">
                              {/* Coluna Status com ícone e tooltip */}
                              <div className="execucao-os__table-cell execucao-os__table-cell--status-icon">
                                <div className="execucao-os__status-icon-wrapper" tabIndex={0} role="button" aria-label={servico?.StatusAprovacao === 'A' ? 'Aprovado' : servico?.StatusAprovacao === 'R' ? 'Reprovado' : 'Pendente'} title={servico?.StatusAprovacao === 'A' ? 'Aprovado' : servico?.StatusAprovacao === 'R' ? 'Reprovado' : 'Pendente'}>
                                  <span className={`execucao-os__status-icon execucao-os__status-icon--${servico?.StatusAprovacao || 'P'}`}>
                                    {servico?.StatusAprovacao === 'A' ? (
                                      <FiCheck />
                                    ) : servico?.StatusAprovacao === 'R' ? (
                                      <FiX />
                                    ) : (
                                      <FiClock />
                                    )}
                                  </span>
                                  <span className="execucao-os__status-tooltip" style={{marginLeft: servico?.StatusAprovacao === 'A' ? '28px' : servico?.StatusAprovacao === 'R' ? '30px' : '65px'}}>
                                    {servico?.StatusAprovacao === 'A' ? 'Aprovado' : servico?.StatusAprovacao === 'R' ? 'Reprovado' : 'Pendente de aprovação'}
                                  </span>
                                </div>
                              </div>
                              <div className="execucao-os__table-cell execucao-os__table-cell--status">
                                <div className="execucao-os__service-name-content">
                                  {servico?.PecaPorContaDoSocio != 'N' ? (<>MÃO&nbsp;DE&nbsp;OBRA</>) : 'VOUCHER'}
                                </div>
                              </div>
                              <div className="execucao-os__table-cell execucao-os__table-cell--service">
                                <div className="execucao-os__service-name" style={{display: 'flex', alignItems: 'center'}}>
                                  <label style={{fontSize: '9pt'}}>{servico.label}</label>
                                </div>
                              </div>
                              <style jsx>{`
                                .execucao-os__service-name-content{
                                  background: #d1fae5;
                                  color: var(--primary);
                                  font-size: 8pt;
                                  padding: 4px 8px;
                                  border-radius: 4px;
                                  align-items: center;
                                }
                              `}</style>
                              <div className="execucao-os__table-cell execucao-os__table-cell--actions">
                                {servico?.FornecidoPelaVcar == "S" ? (null) : (
                                  <button
                                    className="execucao-os__action-btn-action execucao-os__action-btn--delete"
                                    onClick={() => handleRemoveServico(servico)}
                                    title="Excluir serviço"
                                    style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }}
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                )}
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
                    <button className="execucao-os__add-btn" onClick={handleAddMediaClick}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  {isCompressing && (
                    <div className="execucao-os__compression-progress" style={{
                      padding: '10px 20px',
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FiVideo size={16} style={{ color: '#007bff' }} />
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        Comprimindo vídeo... {compressionProgress}%
                      </span>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${compressionProgress}%`,
                          height: '100%',
                          backgroundColor: '#007bff',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                  <div className="execucao-os__card-content">
                    {combinedMedia.length === 0 && !osData?.videoInicial && !osData?.videoFinal ? (
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
                          {osData?.videoInicial && (
                            <div className="execucao-os__foto-item">
                              <div className="execucao-os__video-container">
                                <video
                                  src={Api.getUriUploadPath(osData?.videoInicial)}
                                  className="execucao-os__video-preview"
                                  controls
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          )}
                          {osData.videoFinal && (
                            <div className="execucao-os__foto-item">
                              <div className="execucao-os__video-container">
                                <video
                                  src={Api.getUriUploadPath(osData?.videoFinal)}
                                  className="execucao-os__video-preview"
                                  controls
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          )}
                          {combinedMedia.map(media => (
                            <div key={media.id} className="execucao-os__foto-item">
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={media.nome}
                                  className="execucao-os__foto-preview"
                                  onClick={() => handleOpenMediaPreview(media)}
                                  style={{ cursor: 'zoom-in' }}
                                />
                              ) : (
                                <div className="execucao-os__video-container" onClick={() => handleOpenMediaPreview(media)} style={{ cursor: 'zoom-in' }}>
                                  <video
                                    src={media.url}
                                    className="execucao-os__video-preview"
                                    controls
                                    preload="metadata"
                                  />
                                  <div className="execucao-os__video-overlay">
                                    <FiVideo size={24} />
                                  </div>
                                </div>
                              )}
                              {media.idSocioVeiculoAgendaExecucaoFoto && (
                                <button
                                  className="execucao-os__foto-remove"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFoto(media.id); }}
                                  title={`Remover ${media.type === 'image' ? 'foto' : 'vídeo'}`}
                                >
                                  <FiX size={14} />
                                </button>
                              )}
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
                  variant="danger"
                  size="large"
                  onClick={handleCancelarOS}
                  className="execucao-os__action-btn-custom"
                  style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }}
                >
                  <FiTrash size={20} />
                  Cancelar OS
                </Button>
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
                  style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }}
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
                        style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }}
                        className="execucao-os__dropdown-item"
                        onClick={handleFinalizarOS}
                      >
                        <FiCheck size={16} />
                        Finalizar OS
                      </button>
                      <button
                        style={{ display: osData?.status == "CONCLUIDA" ? 'none' : undefined }}
                        className="execucao-os__dropdown-item"
                        onClick={handleCancelarOS}
                      >
                        <FiTrash size={16} />
                        Cancelar OS
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
          <div className="service-modal-description" style={{textAlign: 'left'}}>
            Selecione o serviço que será executado na OS, sujeito à aprovação ou reprovação pela matriz.
          </div>

          {/* Uploads compactos: Vídeo (≤1min) e Fotos (mín. 2) */}
          <div className="service-modal-media">
            <div className="service-modal-upload service-modal-upload--video">
              <label className="service-modal-upload__label">Vídeo (até 1 min)</label>
              {!serviceVideoPreview ? (
                <div className="service-modal-upload__control">
                  <input
                    id="service-video-input"
                    type="file"
                    accept="video/*"
                    capture="camcorder"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      const v = document.createElement('video');
                      v.preload = 'metadata';
                      v.src = url;
                      v.onloadedmetadata = () => {
                        const duration = v.duration || 0;
                        if (duration > 60) {
                          setServiceVideoError('O vídeo deve ter no máximo 60 segundos.');
                          try { URL.revokeObjectURL(url); } catch {}
                          setServiceVideoFile(null);
                          setServiceVideoPreview(null);
                        } else {
                          setServiceVideoError('');
                          setServiceVideoFile(file);
                          setServiceVideoPreview(url);
                        }
                      };
                      v.onerror = () => {
                        setServiceVideoError('Não foi possível ler o vídeo.');
                        try { URL.revokeObjectURL(url); } catch {}
                        setServiceVideoFile(null);
                        setServiceVideoPreview(null);
                      };
                    }}
                    className="service-modal-upload__input"
                  />
                  <label htmlFor="service-video-input" className="service-modal-upload__btn" onClick={handleSelectVideoClick}>
                    <FiVideo size={16} /> Selecionar Vídeo
                  </label>
                  {serviceVideoError && (
                    <span className="service-modal-upload__error">{serviceVideoError}</span>
                  )}
                </div>
              ) : (
                <div className="service-modal-upload__preview">
                  <video src={serviceVideoPreview} className="service-modal-upload__video" controls muted playsInline />
                  <button
                    type="button"
                    className="service-modal-upload__remove"
                    onClick={() => {
                      if (serviceVideoPreview) {
                        try { URL.revokeObjectURL(serviceVideoPreview); } catch {}
                      }
                      setServiceVideoFile(null);
                      setServiceVideoPreview(null);
                      setServiceVideoError('');
                    }}
                    title="Remover vídeo"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="service-modal-upload service-modal-upload--photos">
              <label className="service-modal-upload__label">Fotos (até 3 fotos)</label>
              <div className="service-modal-upload__control">
                <input
                  id="service-photos-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
                    if (files.length === 0) return;
                    const allowed = Math.min(3 - servicePhotosFiles.length, files.length);
                    const limitedFiles = files.slice(0, allowed);
                    const urls = limitedFiles.map(f => URL.createObjectURL(f));
                    // Liberar URLs anteriores
                    servicePhotosPreviews.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
                    const newFiles = [...servicePhotosFiles, ...limitedFiles].slice(0, 3);
                    const newPreviews = [...servicePhotosPreviews, ...urls].slice(0, 3);
                    setServicePhotosFiles(newFiles);
                    setServicePhotosPreviews(newPreviews);
                  const tooFew = newFiles.length < 3;
                  const tooMany = newFiles.length > 3;
                  setServicePhotosError(tooFew ? 'Selecione pelo menos 3 fotos.' : tooMany ? 'Máximo de 3 fotos.' : '');
                }}
                className="service-modal-upload__input"
              />
              <label htmlFor="service-photos-input" className="service-modal-upload__btn" onClick={handleSelectPhotosClick}>
                <FiCamera size={16} /> Selecionar Fotos
              </label>
                {servicePhotosError && (
                  <span className="service-modal-upload__error">{servicePhotosError}</span>
                )}
              </div>
              {/* Câmera compacta para capturar fotos */}
              <div className="service-modal-upload__camera">
                <MediaUpload
                  onMediaAdd={(item) => {
                    if (item?.type !== 'image') return;
                    if (servicePhotosFiles.length >= 3) {
                      setServicePhotosError('Máximo de 3 fotos.');
                      return;
                    }
                    const url = item.url;
                    const newFiles = [...servicePhotosFiles, item.file];
                    const newPreviews = [...servicePhotosPreviews, url];
                    setServicePhotosFiles(newFiles);
                    setServicePhotosPreviews(newPreviews);
                    setServicePhotosError(newFiles.length < 3 ? 'Selecione pelo menos 3 fotos.' : '');
                  }}
                  acceptedTypes="image/*"
                  multiple={false}
                  showCamera={true}
                  showVideoRecording={false}
                  hideButtons={true}
                  triggerRef={serviceMediaUploadRef}
                  className="service-modal-media-upload-compact"
                />
              </div>
              {servicePhotosPreviews.length > 0 && (
                <div className="service-modal-upload__thumbs">
                  {servicePhotosPreviews.map((url, idx) => (
                    <div key={idx} className="service-modal-upload__thumb">
                      <img src={url} alt={`Foto ${idx + 1}`} />
                      <button
                        type="button"
                        className="service-modal-upload__remove"
                        title="Remover foto"
                      onClick={() => {
                        const newFiles = [...servicePhotosFiles];
                        const newPreviews = [...servicePhotosPreviews];
                        const [removedUrl] = newPreviews.splice(idx, 1);
                        newFiles.splice(idx, 1);
                        if (removedUrl) { try { URL.revokeObjectURL(removedUrl); } catch {} }
                        setServicePhotosFiles(newFiles);
                        setServicePhotosPreviews(newPreviews);
                        setServicePhotosError(newFiles.length < 3 ? 'Selecione pelo menos 3 fotos.' : '');
                      }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Descrição do serviço a ser prestado */}
          <div className="service-modal-description-field" style={{ textAlign: 'left' }}>
            <label htmlFor="service-description-textarea" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Descrição do serviço (opcional)
            </label>
            <textarea
              id="service-description-textarea"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Descreva o serviço que será prestado..."
              rows={3}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', resize: 'vertical' }}
            />
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
              disabled={!selectedService || btnLoading || !serviceVideoFile || !!serviceVideoError || servicePhotosFiles.length < 3 || servicePhotosFiles.length > 3}
            >
              Adicionar Serviço
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

          .service-modal-media {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .service-modal-upload {
            border: 1px dashed var(--gray-300);
            border-radius: 8px;
            padding: 10px;
            background: var(--gray-50);
          }
          .service-modal-upload__label {
            display: block;
            font-size: 12px;
            color: var(--gray-700);
            margin-bottom: 6px;
          }
          .service-modal-upload__control {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .service-modal-upload__input {
            display: none;
          }
          .service-modal-upload__btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 6px;
            background: white;
            border: 1px solid var(--gray-300);
            color: var(--gray-800);
            cursor: pointer;
          }
          .service-modal-upload__error {
            color: #b91c1c;
            font-size: 11px;
          }
          .service-modal-upload__preview {
            position: relative;
          }
          .service-modal-upload__video {
            width: 100%;
            height: 120px;
            border-radius: 6px;
            background: black;
          }
          .service-modal-upload__remove {
            position: absolute;
            top: 6px;
            right: 6px;
            border: none;
            background: rgba(0,0,0,0.5);
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 11px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .service-modal-upload__thumbs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-top: 8px;
          }
          .service-modal-upload__thumb {
            position: relative;
            width: 100%;
            padding-top: 100%;
            border-radius: 6px;
            overflow: hidden;
            background: #fff;
            border: 1px solid var(--gray-200);
          }
          .service-modal-upload__thumb img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .service-modal-upload--photos .service-modal-upload__remove {
            position: absolute;
            top: 4px;
            right: 4px;
            background: rgba(0,0,0,0.5);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 10px;
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
            .service-modal-media {
              grid-template-columns: 1fr;
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
          <div className="notes-modal-description" style={{textAlign: 'left'}}>
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
      {!osData?.videoInicial && (
        <VideoInicialModal
          isOpen={isVideoInicialModalOpen}
          onConfirm={handleVideoInicialConfirm}
          agendamento={agendamento}
        />
      )}

      {/* Modal de vídeo de finalização */}
      {!osData?.videoFinal && (
        <VideoFinalizacaoModal
          isOpen={isVideoFinalizacaoModalOpen}
          onConfirm={handleVideoFinalizacaoConfirm}
          onCancel={() => setIsVideoFinalizacaoModalOpen(false)}
          servicosPendentes={getServicosPendentes()}
          agendamento={agendamento}
        />
      )}

      {/* Modal de visualização de mídia */}
      <Modal
        isOpen={isMediaPreviewOpen}
        onClose={handleCloseMediaPreview}
        title={mediaPreview?.type === 'image' ? 'Visualizar Foto' : 'Visualizar Vídeo'}
      >
        <div style={{ padding: '10px' }}>
          {mediaPreview?.type === 'image' ? (
            <img
              src={mediaPreview?.url}
              alt={mediaPreview?.nome}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          ) : mediaPreview ? (
            <video
              src={mediaPreview?.url}
              controls
              autoPlay
              preload="metadata"
              style={{ width: '100%', borderRadius: 8 }}
            />
          ) : null}
          {mediaPreview?.nome && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#6c757d' }}>
              {mediaPreview?.nome}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Laudos */}
      <LaudosModal
        isOpen={isLaudosModalOpen}
        onClose={() => setIsLaudosModalOpen(false)}
        laudos={laudos}
        onRemoveLaudo={handleRemoveLaudo}
        onAddLaudo={handleAddLaudo}
      />

      {/* Modal de Recibos */}
      <RecibosModal
        isOpen={isRecibosModalOpen}
        onClose={() => setIsRecibosModalOpen(false)}
        recibos={recibos}
        setRecibos={setRecibos}
        onRemoveRecibo={handleRemoveRecibo}
        onAddRecibo={handleAddRecibo}
      />

      {/** Modal de confirmação de cancelamento de agendamento */}
      <Modal
        isOpen={isConfirmCancelModalOpen}
        onClose={handleCancelOS}
        title="Confirmar Cancelamento"
        size="small"
      >
        <div className="confirm-delete-modal-content">

          <div class="agendamento-details confirm-delete-modal-description">
            <p>Tem certeza que deseja cancelar a OS?</p>
            <p>Esta ação não pode ser desfeita.</p>
          </div>

          <div className="confirm-delete-modal-actions">
            <Button
              variant='secondary'
              onClick={handleCancelConfirmOS}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              onClick={handleConfirmOS}
            >
              Confirmar
            </Button>
          </div>
        </div>

        <style jsx>{`
          .agendamento-details {
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
            text-align: left;
          }

          .agendamento-details p {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #374151;
          }

          .agendamento-details p:last-child {
            margin-bottom: 0;
          }

          .confirm-delete-modal-content {
            text-align: left;
          }
          
          .confirm-delete-modal-description {
            margin-bottom: 30px;
          }
          
          .confirm-delete-modal-description p {
            margin: 10px 0;
            color: #333;
          }
          
          .confirm-delete-modal-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
          }
          
          .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-secondary {
            background-color: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background-color: #5a6268;
          }
          
          .btn-danger {
            background-color: #dc3545;
            color: white;
          }
          
          .btn-danger:hover {
            background-color: #c82333;
          }
        `}</style>
      </Modal>

      {/* Modal de confirmação de exclusão de serviço */}
      <Modal
        isOpen={isConfirmDeleteModalOpen}
        onClose={handleCancelDeleteServico}
        title="Confirmar Exclusão"
        size="small"
      >
        <div className="confirm-delete-modal-content">
          <div className="confirm-delete-modal-description">
            <p>Tem certeza que deseja excluir este serviço?</p>
            {servicoToDelete && (
              <p><strong>{servicoToDelete.label}</strong></p>
            )}
            <p>Esta ação não pode ser desfeita.</p>
          </div>

          <div className="confirm-delete-modal-actions">
            <Button
              variant='secondary'
              onClick={handleCancelDeleteServico}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              onClick={handleConfirmDeleteServico}
            >
              Excluir
            </Button>
          </div>
        </div>

        <style jsx>{`
          .confirm-delete-modal-content {
            text-align: left;
          }
          
          .confirm-delete-modal-description {
            margin-bottom: 30px;
          }
          
          .confirm-delete-modal-description p {
            margin: 10px 0;
            color: #333;
          }
          
          .confirm-delete-modal-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
          }
          
          .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-secondary {
            background-color: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background-color: #5a6268;
          }
          
          .btn-danger {
            background-color: #dc3545;
            color: white;
          }
          
          .btn-danger:hover {
            background-color: #c82333;
          }
        `}</style>
      </Modal>
    </div>
  );
};

export default ExecutaOS;
