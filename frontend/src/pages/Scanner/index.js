import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiX, FiRefreshCw, FiCheck, FiAlertCircle, FiUser, FiPhone } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, AgendamentoModal, Button, Modal, Input } from '../../components';
import { MainContext } from '../../helpers/MainContext';
import Api from '../../Api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMask } from '@react-input/mask';
import { createWorker } from 'tesseract.js';
// import cv from 'opencv.js'; // Desabilitado devido a problemas de memória
import '../Home/style.css';
import './style.css';

const Scanner = () => {
  const { user } = useContext(MainContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [detectedPlate, setDetectedPlate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [telefoneConvite, setTelefoneConvite] = useState('');
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState('checking'); // 'checking', 'granted', 'denied'

  // Verificar permissões da câmera
  const checkCameraPermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied');
        setError('Seu navegador não suporta acesso à câmera');
        return false;
      }

      // Verificar se está em HTTPS (necessário para câmera)
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '0.0.0.0';
        
        if (!isSecure) {
          setCameraPermission('denied');
          setError('Acesso à câmera requer conexão segura (HTTPS) ou localhost');
          return false;
        }
        
        console.log('Protocolo verificado:', window.location.protocol, 'Host:', window.location.hostname);

      return true;
    } catch (err) {
      console.error('Erro ao verificar permissões:', err);
      setCameraPermission('denied');
      setError('Erro ao verificar permissões da câmera');
      return false;
    }
  };

  // Iniciar câmera
  const startCamera = async () => {
    try {
      console.log('Tentando iniciar câmera...');
      setError('');
      setCameraPermission('checking');
      
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) return;
      
      // Tentar primeiro com configurações básicas
      let mediaStream;
      try {
        // Tentar com configurações específicas
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Câmera traseira no mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (specificError) {
        console.log('Erro com configurações específicas, tentando configuração básica:', specificError);
        // Fallback para configuração básica
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      console.log('Stream obtido:', mediaStream);
      setCameraPermission('granted');
      
      // Aguardar o elemento de vídeo estar disponível
      const waitForVideoElement = () => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 20; // 2 segundos máximo
          
          const checkElement = () => {
            if (videoRef.current) {
              resolve(videoRef.current);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkElement, 100);
            } else {
              reject(new Error('Elemento de vídeo não encontrado após 2 segundos'));
            }
          };
          
          checkElement();
        });
      };
      
      try {
        const videoElement = await waitForVideoElement();
        console.log('Elemento de vídeo encontrado:', videoElement);
        
        videoElement.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Aguardar o vídeo estar pronto
        videoElement.onloadedmetadata = () => {
          console.log('Metadados do vídeo carregados');
          videoElement.play().then(() => {
            console.log('Vídeo iniciado com sucesso');
            setIsScanning(true);
          }).catch(playError => {
            console.error('Erro ao reproduzir vídeo:', playError);
            setError(`Erro ao reproduzir vídeo: ${playError.message}`);
          });
        };
        
        console.log('Stream atribuído ao vídeo');
      } catch (elementError) {
        console.error('Erro ao aguardar elemento de vídeo:', elementError);
        setError('Erro interno: elemento de vídeo não disponível');
        // Parar o stream se não conseguir usar
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setCameraPermission('denied');
      if (err.name === 'NotAllowedError') {
        setError('Permissão para acessar a câmera foi negada. Clique no ícone da câmera na barra de endereços e permita o acesso.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera foi encontrada no dispositivo.');
      } else {
        setError(`Não foi possível acessar a câmera: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Iniciar câmera automaticamente ao carregar a página
  useEffect(() => {
    console.log('Componente Scanner montado, iniciando câmera...');
    // Adicionar um pequeno delay para garantir que o DOM esteja pronto
    const timer = setTimeout(() => {
      startCamera();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Parar câmera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setDetectedPlate('');
  };





  // Função de pré-processamento otimizada para placas distantes
  const preprocessImageSimple = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Primeiro passo: converter para escala de cinza com pesos otimizados
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // Segundo passo: aplicar filtro de nitidez para destacar bordas
    const sharpened = new Uint8ClampedArray(data.length);
    
    // Kernel de nitidez 3x3
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += data[pixelIndex] * kernel[kernelIndex];
          }
        }
        
        const currentIndex = (y * width + x) * 4;
        const sharpValue = Math.min(255, Math.max(0, sum));
        sharpened[currentIndex] = sharpValue;
        sharpened[currentIndex + 1] = sharpValue;
        sharpened[currentIndex + 2] = sharpValue;
        sharpened[currentIndex + 3] = data[currentIndex + 3];
      }
    }
    
    // Terceiro passo: aumentar contraste adaptativo
    for (let i = 0; i < sharpened.length; i += 4) {
      if (sharpened[i] !== undefined) {
        const gray = sharpened[i];
        
        // Contraste adaptativo baseado na intensidade
        let contrast;
        if (gray < 85) {
          contrast = 2.0; // Alto contraste para áreas escuras
        } else if (gray < 170) {
          contrast = 1.8; // Contraste médio
        } else {
          contrast = 1.5; // Contraste baixo para áreas claras
        }
        
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        
        data[i] = newGray;
        data[i + 1] = newGray;
        data[i + 2] = newGray;
      }
    }
    
    // Quarto passo: aplicar threshold adaptativo para binarização
    const threshold = calculateAdaptiveThreshold(data, width, height);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i];
      const binary = gray > threshold ? 255 : 0;
      
      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };
  
  // Função auxiliar para calcular threshold adaptativo
  const calculateAdaptiveThreshold = (data, width, height) => {
    let sum = 0;
    let count = 0;
    
    // Calcular média dos pixels
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i];
      count++;
    }
    
    const mean = sum / count;
    
    // Calcular desvio padrão
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      variance += Math.pow(data[i] - mean, 2);
    }
    
    const stdDev = Math.sqrt(variance / count);
    
    // Threshold adaptativo baseado na média e desvio padrão
    return Math.min(255, Math.max(0, mean + stdDev * 0.5));
  };

  // Função para extrair e validar placas brasileiras do texto OCR
  const extractAndValidatePlate = (text) => {
    if (!text) return { isValid: false, plate: '', confidence: 0 };
    
    // Limpar e normalizar texto
    const cleanText = text.replace(/[^A-Z0-9\s]/g, '').toUpperCase();
    
    // Padrões de placas brasileiras mais flexíveis
    const mercosulPattern = /[A-Z]{3}\s*[0-9]\s*[A-Z]\s*[0-9]{2}/g; // ABC 1 D 23
    const oldPattern = /[A-Z]{3}\s*[0-9]{4}/g; // ABC 1234
    
    // Buscar todos os possíveis padrões de placa no texto
    const mercosulMatches = [...cleanText.matchAll(mercosulPattern)];
    const oldMatches = [...cleanText.matchAll(oldPattern)];
    
    const candidates = [];
    
    // Processar placas Mercosul
    mercosulMatches.forEach(match => {
      const plate = match[0].replace(/\s/g, '');
      if (plate.length === 7) {
        candidates.push({
          plate: plate,
          confidence: 0.95,
          format: 'Mercosul',
          position: match.index
        });
      }
    });
    
    // Processar placas antigas
    oldMatches.forEach(match => {
      const plate = match[0].replace(/\s/g, '');
      if (plate.length === 7) {
        candidates.push({
          plate: plate,
          confidence: 0.90,
          format: 'Antiga',
          position: match.index
        });
      }
    });
    
    // Se não encontrou padrões exatos, tentar extrair sequências alfanuméricas
    if (candidates.length === 0) {
      const alphanumericSequences = cleanText.match(/[A-Z0-9]{6,8}/g) || [];
      
      alphanumericSequences.forEach(seq => {
        if (seq.length === 7) {
          // Verificar se parece com placa Mercosul
          if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(seq)) {
            candidates.push({
              plate: seq,
              confidence: 0.75,
              format: 'Mercosul',
              position: cleanText.indexOf(seq)
            });
          }
          // Verificar se parece com placa antiga
          else if (/^[A-Z]{3}[0-9]{4}$/.test(seq)) {
            candidates.push({
              plate: seq,
              confidence: 0.70,
              format: 'Antiga',
              position: cleanText.indexOf(seq)
            });
          }
        }
      });
    }
    
    // Filtrar candidatos válidos e ordenar por confiança
    const validCandidates = candidates
      .filter(c => c.confidence > 0.6)
      .sort((a, b) => b.confidence - a.confidence);
    
    if (validCandidates.length > 0) {
      const best = validCandidates[0];
      return {
        isValid: true,
        plate: best.plate,
        confidence: best.confidence,
        format: best.format,
        allCandidates: validCandidates
      };
    }
    
    return { isValid: false, confidence: 0 };
  };
  
  // Função para validar placa brasileira com múltiplos padrões (mantida para compatibilidade)
  const validateBrazilianPlate = (text) => {
    return extractAndValidatePlate(text);
  };



  // Função simplificada para capturar frame e processar OCR
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    setIsProcessing(true);
    
    try {
      console.log('Iniciando detecção com OpenCV...');
      
      // Usar pré-processamento otimizado para placas distantes
      const targetCanvas = preprocessImageSimple(canvas);
      
      // Executar OCR com Tesseract otimizado para placas distantes
      const worker = await createWorker('por');
      await worker.setParameters({
        tessedit_pageseg_mode: 7, // Melhor para texto isolado
        tessedit_ocr_engine_mode: 1, // Engine LSTM
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        preserve_interword_spaces: '0',
        // Configurações específicas para caracteres grandes
        textord_min_linesize: '2.5',
        textord_tablefind_good_width: '3',
        wordrec_enable_assoc: '0',
        // Melhorar detecção de caracteres alfanuméricos
        classify_enable_learning: '0',
        classify_enable_adaptive_matcher: '0',
        // Configurações para texto em alta resolução
        textord_really_old_xheight: '1',
        textord_min_xheight: '10',
        // Reduzir ruído
        edges_max_children_per_outline: '40',
        // Configurações para melhor segmentação
        tessedit_reject_mode: '0',
        load_system_dawg: '0',
        load_freq_dawg: '0',
        load_unambig_dawg: '0',
        load_punc_dawg: '0',
        load_number_dawg: '0',
        load_bigram_dawg: '0'
      });
      
      // Tentar múltiplas configurações para melhor detecção
      let bestResult = { text: '', confidence: 0 };
      
      // Primeira tentativa: configuração padrão otimizada
      try {
        const result1 = await worker.recognize(targetCanvas);
        if (result1.data.confidence > bestResult.confidence) {
          bestResult = result1.data;
        }
        console.log('Tentativa 1 - Texto:', result1.data.text, 'Confiança:', result1.data.confidence);
      } catch (error) {
        console.log('Erro na tentativa 1:', error);
      }
      
      // Segunda tentativa: modo de linha única para placas muito distantes
      try {
        await worker.setParameters({
          tessedit_pageseg_mode: 6, // Uniform block of text
          tessedit_ocr_engine_mode: 1
        });
        
        const result2 = await worker.recognize(targetCanvas);
        if (result2.data.confidence > bestResult.confidence) {
          bestResult = result2.data;
        }
        console.log('Tentativa 2 - Texto:', result2.data.text, 'Confiança:', result2.data.confidence);
      } catch (error) {
        console.log('Erro na tentativa 2:', error);
      }
      
      // Terceira tentativa: modo de palavra única para casos extremos
      try {
        await worker.setParameters({
          tessedit_pageseg_mode: 8, // Single word
          tessedit_ocr_engine_mode: 1
        });
        
        const result3 = await worker.recognize(targetCanvas);
        if (result3.data.confidence > bestResult.confidence) {
          bestResult = result3.data;
        }
        console.log('Tentativa 3 - Texto:', result3.data.text, 'Confiança:', result3.data.confidence);
      } catch (error) {
        console.log('Erro na tentativa 3:', error);
      }
      
      await worker.terminate();
      
      const detectedText = bestResult.text.trim();
      const confidence = bestResult.confidence;
      
      console.log('Melhor resultado - Texto:', detectedText);
      console.log('Melhor resultado - Confiança:', confidence);
      
      // Extrair e validar placas brasileiras do texto
      const validation = extractAndValidatePlate(detectedText);
      
      // Combinar confiança do OCR com confiança da validação da placa
      const combinedConfidence = (confidence / 10) * validation.confidence;
      
      console.log('Texto detectado:', detectedText);
      console.log('Confiança OCR:', confidence);
      console.log('Validação placa:', validation);
      console.log('Confiança combinada:', combinedConfidence);
      
      // Ajustar threshold baseado na distância (confiança mais baixa para placas distantes)
      let confidenceThreshold = 0.3;
      
      // Se a confiança do OCR for muito baixa, aumentar threshold
      if (confidence < 50) {
        confidenceThreshold = 0.2;
      }
      
      // Se encontrou múltiplos candidatos, ser mais flexível
      if (validation.allCandidates && validation.allCandidates.length > 1) {
        confidenceThreshold = 0.25;
      }
      
      if (validation.isValid && validation.confidence >= 0.80) {
        const formattedPlate = formatPlate(validation.plate, validation.format);
        setDetectedPlate(formattedPlate);
        console.log('Placa válida detectada:', formattedPlate);
        
        // Feedback baseado na confiança
        if (combinedConfidence > 0.7) {
          toast.success(`Placa detectada com alta confiança: ${formattedPlate} (${validation.format})`);
        } else if (combinedConfidence > 0.5) {
          toast.success(`Placa detectada: ${formattedPlate} (${validation.format}) - Confiança média`);
        } else {
          toast.success(`Placa detectada: ${formattedPlate} (${validation.format}) - Verifique se está correta`);
        }
        
        consultarVeiculo(formattedPlate);
      } else {
        console.log('Placa não válida ou confiança baixa');
        
        // Feedback mais específico baseado no que foi encontrado
        if (validation.allCandidates && validation.allCandidates.length > 0) {
          const bestCandidate = validation.allCandidates[0];
          toast.warning(`Possível placa detectada: ${bestCandidate.plate} - Aproxime-se mais para melhor detecção`);
        } else if (detectedText.length > 0) {
          toast.info(`Texto detectado mas não parece ser uma placa. Posicione melhor a câmera.`);
        } else {
          toast.error(`Nenhum texto detectado. Aproxime-se da placa e melhore a iluminação.`);
        }
      }
      
    } catch (error) {
      console.error('Erro no OCR:', error);
      toast.error('Erro ao processar imagem. Verifique se a câmera está funcionando corretamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para formatar placa conforme padrão
  const formatPlate = (plate, format) => {
    const clean = plate.replace(/[^A-Z0-9]/g, '');
    
    switch (format) {
      case 'Mercosul':
        return `${clean.slice(0, 3)}${clean.slice(3, 4)}${clean.slice(4, 5)}${clean.slice(5, 7)}`;
      case 'Antiga':
        return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
      case 'Moto Mercosul':
        return `${clean.slice(0, 2)}${clean.slice(2, 3)}${clean.slice(3, 4)}${clean.slice(4, 6)}`;
      case 'Moto Antiga':
        return `${clean.slice(0, 2)}-${clean.slice(2, 6)}`;
      default:
        return clean;
    }
  };



  // Consultar dados do veículo
  const consultarVeiculo = async (placa) => {
    try {
      if (!user?.IdPontoAtendimento) {
        toast.error('Usuário não autenticado');
        return;
      }

      setIsProcessing(true);
      
      const response = await Api.getAgendamentoPontoAtendimentoByPlaca({
        idPontoAtendimento: user.IdPontoAtendimento,
        placa: placa
      });
      
      console.log(response);

      if (response && response.data) {
        const dados = response.data;
        
        console.log('Dados retornados da API:', dados);
        
        if (dados) {
          const primeiroRegistro = dados;
          
          console.log('Primeiro registro:', primeiroRegistro);
          console.log('NomeSocio:', primeiroRegistro.NomeSocio);
          console.log('IdSocioVeiculoAgenda:', primeiroRegistro.IdSocioVeiculoAgenda);
          console.log('IdSocioVeiculo:', primeiroRegistro.IdSocioVeiculo);
          
          // Situação 1: Tem agendamento (IdSocioVeiculoAgenda existe)
          if (primeiroRegistro.IdSocioVeiculoAgenda) {
            toast.success('Agendamento encontrado! Redirecionando...');
            setTimeout(() => {
              navigate(`/execucao-os/${primeiroRegistro.IdSocioVeiculoAgenda}`);
            }, 1500);
          }
          // Situação 2: É sócio mas não tem agendamento (tem NomeSocio mas IdSocioVeiculoAgenda é null)
          else if (primeiroRegistro.NomeSocio && !primeiroRegistro.IdSocioVeiculoAgenda) {
            setVehicleData({
              placa: primeiroRegistro.PlacaVeiculo,
              nomeSocio: primeiroRegistro.NomeSocio,
              veiculo: `${primeiroRegistro.MarcaVeiculo} ${primeiroRegistro.ModeloVeiculo} ${primeiroRegistro.AnoVeiculo}`,
              modelo: `${primeiroRegistro.MarcaVeiculo} ${primeiroRegistro.ModeloVeiculo}`,
              ano: primeiroRegistro.AnoVeiculo,
              proprietario: primeiroRegistro.NomeSocio,
              idSocioVeiculo: primeiroRegistro.IdSocioVeiculo
            });
            setShowAgendamentoModal(true);
            toast.info('Sócio encontrado! Abrindo modal de novo agendamento.');
          }
          // Situação 3: Tem sócio/veículo mas sem agendamento (fallback para compatibilidade)
          else if (primeiroRegistro.IdSocioVeiculo) {
            setVehicleData({
              placa: primeiroRegistro.PlacaVeiculo,
              nomeSocio: primeiroRegistro.NomeSocio,
              veiculo: `${primeiroRegistro.MarcaVeiculo} ${primeiroRegistro.ModeloVeiculo} ${primeiroRegistro.AnoVeiculo}`,
              modelo: `${primeiroRegistro.MarcaVeiculo} ${primeiroRegistro.ModeloVeiculo}`,
              ano: primeiroRegistro.AnoVeiculo,
              proprietario: primeiroRegistro.NomeSocio,
              idSocioVeiculo: primeiroRegistro.IdSocioVeiculo
            });
            setShowAgendamentoModal(true);
            toast.info('Veículo encontrado! Abrindo modal de agendamento.');
          }
        } else {
          // Situação 3: Não há dados - abrir modal de convite
          setShowConviteModal(true);
          toast.info('Veículo não encontrado. Envie um convite para o proprietário se tornar sócio.');
        }
      } else {
        // Situação 3: Erro na API ou sem dados
        setShowConviteModal(true);
        toast.info('Veículo não encontrado. Envie um convite para o proprietário se tornar sócio.');
      }
    } catch (err) {
      console.error('Erro ao consultar veículo:', err);
      toast.error('Erro ao consultar dados do veículo.');
      // Em caso de erro, também abre modal de convite
      setShowConviteModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmar placa detectada
  const confirmarPlaca = () => {
    if (detectedPlate) {
      consultarVeiculo(detectedPlate);
      stopCamera();
    }
  };

  // Enviar convite para se tornar sócio
  const enviarConvite = async () => {
    if (!telefoneConvite.trim()) {
      toast.error('Por favor, informe o número de telefone.');
      return;
    }

    try {
      setEnviandoConvite(true);
      
      // Simular envio de convite (aqui você implementaria a API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Convite enviado com sucesso!');
      setShowConviteModal(false);
      setTelefoneConvite('');
      setDetectedPlate('');
      
      // Reiniciar scanner
      startCamera();
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro ao enviar convite. Tente novamente.');
    } finally {
      setEnviandoConvite(false);
    }
  };

  // Tentar novamente
  const tentarNovamente = () => {
    setDetectedPlate('');
    setError('');
    setIsProcessing(false);
  };

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  return (
    <div>
      <Sidebar />
      <div>
        <Header />
        <div className="scan-container">
          <div className="scan-header">
            <h1>Scanner de Placas</h1>
            <p style={{marginBottom: '15px'}}>Posicione a placa do veículo dentro do quadro para escaneamento</p>
          </div>

          <div className="scan-content">
            {cameraPermission === 'denied' || (error && !isScanning) ? (
              <div className="scan-error">
                <div className="scan-error-icon">
                  <FiAlertCircle size={64} />
                </div>
                <h2>Problema com a Câmera</h2>
                <p>{error}</p>
                {cameraPermission === 'denied' && (
                  <div className="scan-permission-help">
                    <h3>Como permitir acesso à câmera:</h3>
                    <ol>
                      <li>Clique no ícone da câmera na barra de endereços</li>
                      <li>Selecione "Permitir" para este site</li>
                      <li>Recarregue a página ou clique em "Tentar Novamente"</li>
                    </ol>
                  </div>
                )}
                <Button variant='transparent' onClick={startCamera}>
                  <FiRefreshCw />
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="scan-active">
                {cameraPermission === 'checking' || !isScanning ? (
                  <div className="scan-loading-overlay">
                    <div className="scan-loading-icon">
                      <FiCamera size={64} className="scan-spinning" />
                    </div>
                    <h2>Iniciando Câmera...</h2>
                    <p>Aguarde enquanto ativamos a câmera para escaneamento</p>
                    <Button variant='transparent' onClick={startCamera}>
                      <FiCamera />
                      Iniciar Câmera Manualmente
                    </Button>
                  </div>
                ) : null}
                
                <div className="scan-video-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="scan-video"
                    style={{ opacity: isScanning ? 1 : 0 }}
                  />
                  <div className="scan-overlay">
                    <div className="scan-frame">
                      <div className="scan-corners">
                        <div className="scan-corner scan-corner-top-left"></div>
                        <div className="scan-corner scan-corner-top-right"></div>
                        <div className="scan-corner scan-corner-bottom-left"></div>
                        <div className="scan-corner scan-corner-bottom-right"></div>
                      </div>
                      {isProcessing && (
                        <div className="scan-processing">
                          <FiRefreshCw className="scan-spinning" />
                          <span>Reconhecendo placa...</span>
                          <small>Aguarde, processando imagem com OCR</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="scan-controls">
                  {detectedPlate ? (
                    <div className="scan-plate-detected">
                      <div className="scan-detected-plate">
                        <FiCheck className="scan-check-icon" />
                        <span className="scan-plate-text">{detectedPlate}</span>
                      </div>
                      <div className="scan-plate-actions">
                        <Button variant='primary' onClick={confirmarPlaca}>
                          <FiCheck />
                          Confirmar
                        </Button>
                        <Button variant='transparent' onClick={tentarNovamente}>
                          <FiRefreshCw />
                          Tentar Novamente
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="scan-actions">
                      <button 
                        className="scan-btn-capture" 
                        onClick={captureFrame}
                        disabled={isProcessing}
                      >
                        <FiCamera />
                        {isProcessing ? 'Processando...' : 'Capturar'}
                      </button>
                      <button className="scan-btn-stop" onClick={stopCamera}>
                        <FiX />
                        Parar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
      
      {/* Modal de Agendamento */}
      <AgendamentoModal
        isOpen={showAgendamentoModal}
        onClose={() => setShowAgendamentoModal(false)}
        vehicleData={vehicleData}
      />
      
      {/* Modal de Convite de Sócio */}
      <Modal
        isOpen={showConviteModal}
        onClose={() => {
          setShowConviteModal(false);
          setTelefoneConvite('');
          setDetectedPlate('');
        }}
        title="Convidar para ser Sócio"
        size="medium"
      >
        <div className="convite-modal-content">
          <div className="convite-info">
            <FiUser size={48} className="convite-icon" />
            <h3>Veículo não encontrado</h3>
            <p>A placa <strong>{detectedPlate}</strong> não está cadastrada em nosso sistema.</p>
            <p>Envie um convite para o proprietário se tornar sócio da VCar Clube!</p>
          </div>
          
          <div className="convite-form">
            <div className="form-group">
              <label htmlFor="telefone">Número do WhatsApp:</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <Input
                  ref={useMask({
                    mask: '(__) _____-____',
                    replacement: { _: /\d/ }
                  })}
                  type="tel"
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={telefoneConvite}
                  onChange={(e) => setTelefoneConvite(e.target.value)}
                  disabled={enviandoConvite}
                />
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <Button 
              variant="transparent" 
              onClick={() => {
                setShowConviteModal(false);
                setTelefoneConvite('');
                setDetectedPlate('');
              }}
              disabled={enviandoConvite}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={enviarConvite}
              disabled={enviandoConvite || !telefoneConvite.trim()}
            >
              {enviandoConvite ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Scanner;