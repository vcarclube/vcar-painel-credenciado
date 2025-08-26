import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiX, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation, AgendamentoModal, Button } from '../../components';
import '../Home/style.css';
import './style.css';

const Scanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [detectedPlate, setDetectedPlate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
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

  // Capturar frame e processar placa
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simular reconhecimento de placa (aqui você integraria com uma API de OCR)
    setIsProcessing(true);
    
    // Simulação de processamento
    setTimeout(() => {
      const simulatedPlate = generateSimulatedPlate();
      setDetectedPlate(simulatedPlate);
      setIsProcessing(false);
      
      // Consultar dados do veículo
      consultarVeiculo(simulatedPlate);
    }, 2000);
  };

  // Gerar placa simulada para demonstração
  const generateSimulatedPlate = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    return (
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      numbers[Math.floor(Math.random() * numbers.length)]
    );
  };

  // Consultar dados do veículo
  const consultarVeiculo = async (placa) => {
    try {
      // Simular consulta na API
      const hasData = Math.random() > 0.5; // 50% chance de ter dados
      
      if (hasData) {
        // Veículo encontrado - redirecionar para execução
        const mockData = {
          placa,
          modelo: 'Honda Civic',
          ano: '2020',
          proprietario: 'João Silva',
          agendamentoId: '12345'
        };
        
        setTimeout(() => {
          navigate(`/execucao-os/${mockData.agendamentoId}`);
        }, 1500);
      } else {
        // Veículo não encontrado - abrir modal de agendamento
        setVehicleData({ placa });
        setShowAgendamentoModal(true);
      }
    } catch (err) {
      console.error('Erro ao consultar veículo:', err);
      setError('Erro ao consultar dados do veículo.');
    }
  };

  // Confirmar placa detectada
  const confirmarPlaca = () => {
    if (detectedPlate) {
      consultarVeiculo(detectedPlate);
      stopCamera();
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
                          <span>Processando...</span>
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
    </div>
  );
};

export default Scanner;