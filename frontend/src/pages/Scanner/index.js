import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiRefreshCw, FiCheck, FiAlertCircle, FiUser, FiPhone } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, AgendamentoModal, Button, Modal, Input } from '../../components';
import { MainContext } from '../../helpers/MainContext';
import Api from '../../Api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMask } from '@react-input/mask';
import { createWorker } from 'tesseract.js';
import '../Home/style.css';
import './style.css';

const Scanner = () => {
  const { user } = useContext(MainContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isScanningActiveRef = useRef(false);
  
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
  const [cameraPermission, setCameraPermission] = useState('checking');
  const [scanCount, setScanCount] = useState(0);

  // Lista de palavras irrelevantes para filtrar
  const IRRELEVANT_WORDS = [
    'BRASIL', 'BRAZIL', 'MERCOSUL', 'MERCOSUR', 'REPUBLICA', 'FEDERATIVA',
    // Estados
    'ACRE', 'ALAGOAS', 'AMAPA', 'AMAZONAS', 'BAHIA', 'CEARA', 'DISTRITO', 'FEDERAL',
    'ESPIRITO', 'SANTO', 'GOIAS', 'MARANHAO', 'MATO', 'GROSSO', 'MINAS', 'GERAIS',
    'PARA', 'PARAIBA', 'PARANA', 'PERNAMBUCO', 'PIAUI', 'RIO', 'JANEIRO', 'GRANDE',
    'NORTE', 'SUL', 'RONDONIA', 'RORAIMA', 'SANTA', 'CATARINA', 'SAO', 'PAULO',
    'SERGIPE', 'TOCANTINS',
    // Siglas dos estados
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    // Cidades comuns
    'BRASILIA', 'SALVADOR', 'FORTALEZA', 'RECIFE', 'MANAUS', 'BELEM', 'GOIANIA',
    'CURITIBA', 'FLORIANOPOLIS', 'VITORIA', 'ARACAJU', 'MACEIO', 'JOAO', 'PESSOA',
    'NATAL', 'TERESINA', 'CUIABA', 'PALMAS', 'MACAPA', 'BOA', 'VISTA', 'PORTO', 'ALEGRE',
    // Palavras comuns em placas
    'VEICULO', 'AUTOMOVEL', 'CARRO', 'MOTO', 'MOTOCICLETA', 'CAMINHAO', 'ONIBUS'
  ];

  // Inicializar worker do Tesseract
  const initializeWorker = useCallback(async () => {
    try {
      if (workerRef.current) {
        await workerRef.current.terminate();
      }
      
      console.log('🔧 Inicializando worker OCR...');
      workerRef.current = await createWorker('eng');
      
      await workerRef.current.setParameters({
        tessedit_pageseg_mode: 7, // ALTERADO: De 6 para 7 - trata como uma única linha de texto
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        tessedit_ocr_engine_mode: 1,
        preserve_interword_spaces: '1',
        user_defined_dpi: '300',
        tessedit_zero_rejection: '1'
      });
      
      console.log('✅ Worker OCR inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar worker:', error);
      return false;
    }
  }, []);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    console.log('📹 Iniciando câmera...');
    setError('');
    setIsProcessing(false);
    isProcessingRef.current = false;
    setCameraPermission('checking');
    setIsScanning(false);
    isScanningActiveRef.current = false;
    setScanCount(0);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Câmera não suportada pelo navegador');
      }

      const constraints = [
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: 'environment' } },
        { video: true }
      ];

      let mediaStream = null;
      for (let i = 0; i < constraints.length; i++) {
        try {
          console.log(`🔄 Tentando configuração de câmera ${i + 1}...`);
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints[i]);
          break;
        } catch (err) {
          console.log(`❌ Configuração ${i + 1} falhou:`, err.message);
        }
      }
      
      if (!mediaStream) {
        throw new Error('Não foi possível acessar a câmera');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout ao carregar vídeo')), 8000);
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                clearTimeout(timeout);
                console.log('✅ Vídeo carregado:', {
                  width: videoRef.current.videoWidth,
                  height: videoRef.current.videoHeight
                });
                resolve();
              })
              .catch(reject);
          };
          
          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Erro no vídeo'));
          };
        });
        
        setCameraPermission('granted');
        setIsScanning(true);
        isScanningActiveRef.current = true;
        
        // Inicializar worker e começar scanner
        const workerReady = await initializeWorker();
        if (workerReady) {
          setTimeout(() => {
            console.log('🚀 Iniciando scanner periódico...');
            startPeriodicScan();
          }, 1000);
        }
      }
      
    } catch (err) {
      console.error('❌ Erro ao acessar câmera:', err);
      setCameraPermission('denied');
      setError(err.message || 'Erro ao acessar a câmera');
    }
  }, [stream, initializeWorker]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    console.log('🛑 Parando câmera e scanner...');
    
    isScanningActiveRef.current = false;
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    setIsScanning(false);
    setDetectedPlate('');
    setError('');
    setIsProcessing(false);
    isProcessingRef.current = false;
    setScanCount(0);
  }, [stream]);

  // Iniciar verificação periódica A CADA SEGUNDO
  const startPeriodicScan = useCallback(() => {
    console.log('⏰ Configurando scanner para executar A CADA SEGUNDO...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    // SCANNER A CADA 1 SEGUNDO
    scanIntervalRef.current = setInterval(() => {
      if (!isProcessingRef.current && 
          isScanningActiveRef.current && 
          videoRef.current && 
          canvasRef.current && 
          workerRef.current &&
          videoRef.current.readyState >= 2) {
        
        setScanCount(prev => prev + 1);
        console.log(`🔍 Executando scan #${scanCount + 1}...`);
        captureAndAnalyze();
      } else {
        console.log('⏸️ Scanner pausado - condições não atendidas');
      }
    }, 1000); // ⭐ A CADA 1 SEGUNDO
    
    console.log('✅ Scanner periódico configurado para 1 segundo');
  }, [scanCount]);

  // Filtrar texto removendo palavras irrelevantes
  const filterText = (text) => {
    if (!text) return '';
    
    console.log('📝 Texto original:', text);
    
    // Converter para maiúsculas e limpar caracteres especiais
    let cleanText = text.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
    
    // Remover múltiplos espaços
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    console.log('🧹 Texto limpo:', cleanText);
    
    // Dividir em palavras
    const words = cleanText.split(' ');
    
    // Filtrar palavras irrelevantes
    const filteredWords = words.filter(word => {
      // Manter palavras com pelo menos 2 caracteres
      if (word.length < 2) return false;
      
      // Remover palavras irrelevantes
      if (IRRELEVANT_WORDS.includes(word)) return false;
      
      // Manter palavras que podem ser parte de placas
      const hasLetters = /[A-Z]/.test(word);
      const hasNumbers = /[0-9]/.test(word);
      
      // Manter se tem letras E números, ou se é uma sequência de letras/números válida
      return (hasLetters && hasNumbers) || 
             (hasLetters && word.length >= 2) || 
             (hasNumbers && word.length >= 2);
    });
    
    const filteredText = filteredWords.join(' ');
    console.log('🎯 Texto filtrado:', filteredText);
    
    return filteredText;
  };

  // Extrair todas as possíveis placas do texto filtrado
  const extractAllPossiblePlates = (text) => {
    const filteredText = filterText(text);
    if (!filteredText) return [];
    
    console.log('🔍 Buscando placas no texto filtrado:', filteredText);
    
    const possiblePlates = [];
    
    // 1. Buscar sequências contínuas de 7 caracteres
    const continuousText = filteredText.replace(/\s+/g, '');
    console.log('📋 Texto contínuo:', continuousText);
    
    for (let i = 0; i <= continuousText.length - 7; i++) {
      const candidate = continuousText.substring(i, i + 7);
      
      // Verificar padrões de placa brasileira
      if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(candidate)) {
        possiblePlates.push({ 
          plate: candidate, 
          format: 'Mercosul', 
          source: 'continuous',
          confidence: 0.9 
        });
        console.log('🎯 Placa Mercosul encontrada (contínua):', candidate);
      } else if (/^[A-Z]{3}[0-9]{4}$/.test(candidate)) {
        possiblePlates.push({ 
          plate: candidate, 
          format: 'Antiga', 
          source: 'continuous',
          confidence: 0.9 
        });
        console.log('🎯 Placa Antiga encontrada (contínua):', candidate);
      }
    }
    
    // 2. Buscar padrões com espaços usando regex
    const patterns = [
      {
        regex: /([A-Z]{3})\s*([0-9])\s*([A-Z])\s*([0-9]{2})/g,
        format: 'Mercosul',
        confidence: 0.8
      },
      {
        regex: /([A-Z]{3})\s*([0-9]{4})/g,
        format: 'Antiga',
        confidence: 0.8
      }
    ];
    
    patterns.forEach(pattern => {
      const matches = [...filteredText.matchAll(pattern.regex)];
      matches.forEach(match => {
        let plate = '';
        if (pattern.format === 'Mercosul') {
          plate = match[1] + match[2] + match[3] + match[4];
        } else {
          plate = match[1] + match[2];
        }
        
        if (plate.length === 7) {
          possiblePlates.push({
            plate,
            format: pattern.format,
            source: 'pattern',
            confidence: pattern.confidence
          });
          console.log(`🎯 Placa ${pattern.format} encontrada (padrão):`, plate);
        }
      });
    });
    
    // 3. Buscar combinando palavras adjacentes
    const words = filteredText.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const combined = words[i] + words[i + 1];
      if (combined.length === 7) {
        if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(combined)) {
          possiblePlates.push({
            plate: combined,
            format: 'Mercosul',
            source: 'words',
            confidence: 0.7
          });
          console.log('🎯 Placa Mercosul encontrada (palavras):', combined);
        } else if (/^[A-Z]{3}[0-9]{4}$/.test(combined)) {
          possiblePlates.push({
            plate: combined,
            format: 'Antiga',
            source: 'words',
            confidence: 0.7
          });
          console.log('🎯 Placa Antiga encontrada (palavras):', combined);
        }
      }
    }
    
    // 4. Buscar em palavras individuais
    words.forEach(word => {
      if (word.length >= 7) {
        const candidate = word.substring(0, 7);
        if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(candidate)) {
          possiblePlates.push({
            plate: candidate,
            format: 'Mercosul',
            source: 'word',
            confidence: 0.6
          });
          console.log('🎯 Placa Mercosul encontrada (palavra):', candidate);
        } else if (/^[A-Z]{3}[0-9]{4}$/.test(candidate)) {
          possiblePlates.push({
            plate: candidate,
            format: 'Antiga',
            source: 'word',
            confidence: 0.6
          });
          console.log('🎯 Placa Antiga encontrada (palavra):', candidate);
        }
      }
    });
    
    // Remover duplicatas e ordenar por confiança
    const uniquePlates = [];
    const seen = new Set();
    
    possiblePlates
      .sort((a, b) => b.confidence - a.confidence)
      .forEach(item => {
        if (!seen.has(item.plate)) {
          seen.add(item.plate);
          uniquePlates.push(item);
        }
      });
    
    console.log('📊 Placas únicas encontradas:', uniquePlates);
    return uniquePlates;
  };

  // Testar placa com a API
  const testPlateWithAPI = async (plate) => {
    try {
      console.log(`🔍 Testando placa ${plate} com a API...`);
      
      const response = await Api.getAgendamentoPontoAtendimentoByPlaca({
        idPontoAtendimento: user.IdPontoAtendimento,
        placa: plate
      });

      if (response?.data) {
        console.log(`✅ PLACA ${plate} ENCONTRADA NA API:`, response.data);
        return { found: true, data: response.data };
      } else {
        console.log(`❌ Placa ${plate} não encontrada na API`);
        return { found: false };
      }
    } catch (error) {
      console.log(`❌ Erro ao testar placa ${plate}:`, error.message);
      return { found: false, error: error.message };
    }
  };

  // Capturar e analisar frame
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current || isProcessingRef.current) {
      return;
    }

    console.log(`🎬 === INICIANDO SCAN #${scanCount} ===`);
    setIsProcessing(true);
    isProcessingRef.current = true;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Configurar canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.log('⏸️ Vídeo ainda não está pronto');
        return;
      }
      
      // Capturar frame completo
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      console.log('🔍 Executando OCR...');
      
      // Executar OCR na imagem completa
      const result = await workerRef.current.recognize(canvas);
      const detectedText = result.data.text.trim();
      const confidence = result.data.confidence;
      
      console.log('📊 OCR resultado:', { 
        text: detectedText.substring(0, 100) + (detectedText.length > 100 ? '...' : ''), 
        confidence,
        fullLength: detectedText.length
      });
      
      // ALTERAÇÃO: Aceitar qualquer resultado (confiança >= 0) OU se o texto tem formato de placa
      const hasPlatePattern = /[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2}/.test(detectedText.replace(/[^A-Z0-9]/g, ''));
      
      if (confidence >= 0 || hasPlatePattern) { // ALTERADO: de 15 para 0
        // Extrair todas as possíveis placas
        const possiblePlates = extractAllPossiblePlates(detectedText);
        
        if (possiblePlates.length > 0) {
          console.log(`🎯 Encontradas ${possiblePlates.length} possíveis placas. Testando com a API...`);
          
          // Testar cada placa com a API (ordenadas por confiança)
          for (const plateInfo of possiblePlates) {
            console.log(`🧪 Testando placa: ${plateInfo.plate} (${plateInfo.format}, confiança: ${plateInfo.confidence})`);
            
            const apiResult = await testPlateWithAPI(plateInfo.plate);

            if(apiResult?.found == false){
              // Parar scanner
              isScanningActiveRef.current = false;
              if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
              }
              
              const formattedPlate = formatPlate(plateInfo.plate, plateInfo.format);
              setDetectedPlate(formattedPlate);
              
              toast.info('Veículo encontrado mas não é sócio. Envie um convite.');
              setShowConviteModal(true);
              
              return;
            }

            if (apiResult.found) {
              console.log(`🎉 PLACA VÁLIDA ENCONTRADA: ${plateInfo.plate}`);
              
              // Parar scanner
              isScanningActiveRef.current = false;
              if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
              }
              
              const formattedPlate = formatPlate(plateInfo.plate, plateInfo.format);
              setDetectedPlate(formattedPlate);
              
              toast.success(`Placa encontrada: ${formattedPlate} (${plateInfo.format})`);
              
              // Processar resultado da API
              setTimeout(() => {
                processAPIResult(apiResult.data, formattedPlate);
              }, 500);
              
              return; // Parar o loop
            }
            
            // Delay entre requisições
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.log('❌ Nenhuma das placas encontradas foi válida na API');
        } else {
          console.log('❌ Nenhuma possível placa encontrada no texto');
        }
      } else {
        console.log('❌ Confiança do OCR muito baixa:', confidence);
      }
      
    } catch (error) {
      console.error('❌ Erro na análise do frame:', error);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      console.log(`✅ Scan #${scanCount} finalizado`);
    }
  }, [scanCount]);

  // Processar resultado da API
  const processAPIResult = (dados, placa) => {
    console.log('📋 Processando resultado da API:', dados);
    
    if (dados.IdSocioVeiculoAgenda) {
      toast.success('Agendamento encontrado! Redirecionando...');
      setTimeout(() => {
        navigate(`/execucao-os/${dados.IdSocioVeiculoAgenda}`);
      }, 1500);
    } else if (dados.NomeSocio) {
      setVehicleData({
        placa: dados.PlacaVeiculo || placa,
        nomeSocio: dados.NomeSocio,
        veiculo: `${dados.MarcaVeiculo || ''} ${dados.ModeloVeiculo || ''} ${dados.AnoVeiculo || ''}`.trim(),
        idSocioVeiculo: dados.IdSocioVeiculo
      });
      setShowAgendamentoModal(true);
    }
  };

  // Formatar placa
  const formatPlate = (plate, format) => {
    const clean = plate.replace(/[^A-Z0-9]/g, '');
    
    if (format === 'Mercosul') {
      return `${clean.slice(0, 3)}${clean.slice(3, 4)}${clean.slice(4, 5)}${clean.slice(5, 7)}`;
    } else {
      return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
    }
  };

  // Confirmar placa detectada
  const confirmarPlaca = () => {
    if (detectedPlate) {
      toast.success('Placa confirmada!');
    }
  };

  // Enviar convite
  const enviarConvite = async () => {
    if (!telefoneConvite.trim()) {
      toast.error('Por favor, informe o número de telefone.');
      return;
    }

    try {
      setEnviandoConvite(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Convite enviado com sucesso!');
      setShowConviteModal(false);
      setTelefoneConvite('');
      setDetectedPlate('');
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
    isProcessingRef.current = false;
    setScanCount(0);
    isScanningActiveRef.current = true;
    startPeriodicScan();
  };

  // Captura manual
  const captureManual = () => {
    if (!isProcessingRef.current) {
      setScanCount(prev => prev + 1);
      captureAndAnalyze();
    }
  };

  // Inicialização
  useEffect(() => {
    window.scrollTo(0, 0);
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      isScanningActiveRef.current = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      stopCamera();
    };
  }, []);

  return (
    <div>
      <Sidebar />
      <div>
        <Header />
        <div className="scan-container">
          <div className="scan-header">
            <h1>Scanner de Placas</h1>
            <p style={{marginBottom: '15px'}}>Posicione a placa do veículo na tela - verificação automática a cada segundo</p>
          </div>

          <div className="scan-content">
            {cameraPermission === 'denied' ? (
              <div className="scan-error">
                <div className="scan-error-icon">
                  <FiAlertCircle size={64} />
                </div>
                <h2>Problema com a Câmera</h2>
                <p>{error}</p>
                <Button variant='transparent' onClick={startCamera}>
                  <FiRefreshCw />
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="scan-active">
                {(cameraPermission === 'checking' || (cameraPermission === 'granted' && !isScanning)) && (
                  <div className="scan-loading-overlay">
                    <div className="scan-loading-icon">
                      <FiCamera size={64} className="scan-spinning" />
                    </div>
                    <h2>Iniciando Câmera...</h2>
                    <p>Aguarde enquanto ativamos a câmera e o sistema de OCR</p>
                  </div>
                )}
                
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
                      {/*isProcessing && (
                        <div className="scan-processing">
                          <FiRefreshCw className="scan-spinning" />
                          <span>Scan #{scanCount}</span>
                          <small>Analisando texto e testando placas...</small>
                        </div>
                      )*/}
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
                        {/*<Button variant='primary' onClick={confirmarPlaca}>
                          <FiCheck />
                          Confirmar
                        </Button>*/}
                        <Button variant='transparent' onClick={tentarNovamente}>
                          <FiRefreshCw />
                          Tentar Novamente
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="scan-status">
                      {/*<div className="scan-manual-controls">
                        <Button 
                          variant='transparent' 
                          onClick={captureManual}
                          disabled={isProcessing}
                        >
                          <FiCamera />
                          Capturar Agora
                        </Button>
                      </div>*/}
                      
                      {isProcessing && (
                        <div className="scan-processing-indicator">
                          <div className="scan-spinner"></div>
                          <span>Capturando placa...</span>
                        </div>
                      )}
                      
                      {/* isScanning && !isProcessing && (
                        <div className="scan-auto-indicator">
                          <div className="scan-pulse"></div>
                          <span>Scanner ativo - Verificando A CADA SEGUNDO</span>
                        </div>
                      )*/}
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
      
      {/* Modal de Convite */}
      <Modal
        isOpen={showConviteModal}
        onClose={() => {
          setShowConviteModal(false);
          setTelefoneConvite('');
          setDetectedPlate('');
          startCamera();
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
                startCamera();
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