import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './style.css';
import Api from '../../Api';
import { toast } from 'react-toastify';
import { MainContext } from '../../helpers/MainContext';

const ExecutaOS = () => {
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
  const [ffmpeg, setFfmpeg] = useState(null);
  
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
  
  // Estados para modal de confirmação de exclusão
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState(null);
  const [laudos, setLaudos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  
  const [todosServicos, setTodosServicos] = useState([]);

  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    console.log(osData);
  }, [osData])

  useEffect(() => {
    getAgendamento();
    getServicos();
    getServicosVinculados();
    getFotosAgendamento();
    getAnotacoesAgendamento();
    getNotasFiscaisAgendamento();
    getLaudosAgendamento();
  }, [idSocioVeiculoAgenda, videoInicialUploaded]);

  // Inicializar FFmpeg para compressão
  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      
      ffmpegInstance.on('log', ({ message }) => {
        console.log(message);
      });
      
      ffmpegInstance.on('progress', ({ progress }) => {
        setCompressionProgress(Math.round(progress * 100));
      });

      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFfmpeg(ffmpegInstance);
      } catch (error) {
        console.error('Erro ao carregar FFmpeg:', error);
      }
    };

    loadFFmpeg();
  }, []);

  const getAgendamento = async () => {
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
          veiculo: `${_agendamento?.socioVeiculo?.MarcaVeiculo} ${_agendamento?.socioVeiculo?.Ano} ${_agendamento?.socioVeiculo?.Litragem}`,
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
        
        // Abrir modal de vídeo inicial se ainda não foi feito upload
        if (!videoInicialUploaded) {
          setIsVideoInicialModalOpen(true);
        }

      }
    } catch (error) {
      console.error('Erro ao obter agendamento:', error);
    }
  };

  const getServicos = async () => {
    try {
      const response = await Api.getPontoAtendimentoServicos({ idPontoAtendimento: user?.IdPontoAtendimento });
      if (response.status === 200) {
        setTodosServicos(response?.data?.servicos);
      }
    } catch (error) {
      console.error('Erro ao obter serviços:', error);
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
    //console.log(servicosAdicionados);
    return todosServicos.filter(servico => !servicosAdicionados.includes(servico.value));
  };

  // Serviços disponíveis filtrados
  const servicosDisponiveis = getServicosDisponiveis();

  // Função para compactar vídeo
  const compressVideo = async (file) => {
    if (!ffmpeg) {
      throw new Error('FFmpeg não está carregado');
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      // Escrever arquivo de entrada
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Configurações otimizadas para compressão rápida e eficiente
      const ffmpegArgs = [
        '-i', inputName,
        '-c:v', 'libx264',           // Codec de vídeo H.264
        '-preset', 'fast',           // Preset rápido
        '-crf', '23',                // Qualidade balanceada (18-28)
        '-c:a', 'aac',               // Codec de áudio AAC
        '-b:a', '128k',              // Bitrate de áudio
        '-movflags', '+faststart',   // Otimização para web
        '-profile:v', 'baseline',    // Perfil compatível
        '-level', '3.0',             // Nível de compatibilidade
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // Garantir dimensões pares
        outputName
      ];

      // Executar compressão
      await ffmpeg.exec(ffmpegArgs);

      // Ler arquivo comprimido
      const data = await ffmpeg.readFile(outputName);
      const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
      
      // Criar novo arquivo comprimido
      const compressedFile = new File(
        [compressedBlob], 
        `compressed_${file.name.replace(/\.[^/.]+$/, '')}.mp4`, 
        { type: 'video/mp4' }
      );

      // Limpar arquivos temporários
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      console.log(`Compressão concluída: ${file.size} → ${compressedFile.size} bytes`);
      console.log(`Redução: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);

      return compressedFile;
    } catch (error) {
      console.error('Erro na compressão:', error);
      throw error;
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
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
      
      // Verificar se é vídeo e se precisa de compressão (maior que 25MB)
      if (file.type.startsWith('video/') && file.size > 25 * 1024 * 1024 && ffmpeg) {
        try {
          toast.info('Comprimindo vídeo, aguarde...');
          fileToUpload = await compressVideo(file);
          toast.success('Vídeo comprimido com sucesso!');
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
  
  const handleConfirmService = async () => {
    if (selectedService) {
      // Verificar se o serviço já foi adicionado
      const servicoJaAdicionado = servicos.some(servico => servico.value === selectedService.value);
      
      if (servicoJaAdicionado) {
        alert('Este serviço já foi adicionado à ordem de serviço.');
        return;
      }
      
      const servicoSelecionado = todosServicos.find(s => s.value === selectedService.value);

      setBtnLoading(true);

      await Api.vincularServicoAgendamento({
        idPontoAtendimentoUsuario: user?.IdPontoAtendimentoUsuario,
        idSocioVeiculoAgenda,
        idServico: servicoSelecionado.value,
      })

      setBtnLoading(false);

      toast.success(`Serviço vinculado com sucesso.`)

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
        <div className="main-content" style={{marginBottom: '0px', paddingBottom: '0px'}}>
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
                    <button className="execucao-os__add-btn" style={{display: osData?.status == "CONCLUIDA" ? 'none' : undefined}} onClick={handleAddServico}>
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  </div>
                  <div className="execucao-os__card-content">
                    {servicos.length === 0 ? (
                      <div className="execucao-os__empty-state">
                        <FiTool className="execucao-os__empty-icon" />
                        <p>Nenhum serviço adicionado</p>
                        <button className="execucao-os__empty-btn" style={{display: osData?.status == "CONCLUIDA" ? 'none' : undefined}} onClick={handleAddServico}>
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
                                <span className={`execucao-os__status-badge execucao-os__status-badge--${servico.status}`}>
                                  {servico.status === 'A' ? 'Aprovado' : 
                                   servico.status === 'P' ? 'Pendente' : 'Reprovado'}
                                </span>
                              </div>
                              <div className="execucao-os__table-cell execucao-os__table-cell--service">
                                <span className="execucao-os__service-name">{servico.label}</span>
                              </div>
                              <div className="execucao-os__table-cell execucao-os__table-cell--actions">
                                <button 
                                  className="execucao-os__action-btn-action execucao-os__action-btn--delete"
                                  onClick={() => handleRemoveServico(servico)}
                                  title="Excluir serviço"
                                  style={{display: osData?.status == "CONCLUIDA" ? 'none' : undefined}}
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
                    {fotos.length === 0 && !osData?.videoInicial ? (
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
                  style={{display: osData?.status == "CONCLUIDA" ? 'none' : undefined}}
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
                        style={{display: osData?.status == "CONCLUIDA" ? 'none' : undefined}}
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
              disabled={!selectedService || btnLoading}
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
            <button 
              className="btn btn-secondary"
              onClick={handleCancelDeleteServico}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleConfirmDeleteServico}
            >
              Excluir
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .confirm-delete-modal-content {
            padding: 20px;
            text-align: center;
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
            justify-content: center;
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
