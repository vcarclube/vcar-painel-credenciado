import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiX, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import AgendamentoModal from '../../components/Modal/AgendamentoModal';
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

  // Iniciar câmera
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira no mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

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
  }, []);

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="scanner-container">
          <div className="scanner-header">
            <h1>Scanner de Placas</h1>
            <p>Posicione a placa do veículo dentro do quadro para escaneamento</p>
          </div>

          <div className="scanner-content">
            {!isScanning ? (
              <div className="scanner-start">
                <div className="scanner-icon">
                  <FiCamera size={64} />
                </div>
                <h2>Iniciar Escaneamento</h2>
                <p>Toque no botão abaixo para ativar a câmera e começar a escanear placas</p>
                <button className="btn-start-scan" onClick={startCamera}>
                  <FiCamera />
                  Ativar Câmera
                </button>
                {error && (
                  <div className="error-message">
                    <FiAlertCircle />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="scanner-active">
                <div className="video-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="scanner-video"
                  />
                  <div className="scan-overlay">
                    <div className="scan-frame">
                      <div className="scan-corners">
                        <div className="corner top-left"></div>
                        <div className="corner top-right"></div>
                        <div className="corner bottom-left"></div>
                        <div className="corner bottom-right"></div>
                      </div>
                      {isProcessing && (
                        <div className="processing-indicator">
                          <FiRefreshCw className="spinning" />
                          <span>Processando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="scanner-controls">
                  {detectedPlate ? (
                    <div className="plate-detected">
                      <div className="detected-plate">
                        <FiCheck className="check-icon" />
                        <span className="plate-text">{detectedPlate}</span>
                      </div>
                      <div className="plate-actions">
                        <button className="btn-confirm" onClick={confirmarPlaca}>
                          <FiCheck />
                          Confirmar
                        </button>
                        <button className="btn-retry" onClick={tentarNovamente}>
                          <FiRefreshCw />
                          Tentar Novamente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="scan-actions">
                      <button 
                        className="btn-capture" 
                        onClick={captureFrame}
                        disabled={isProcessing}
                      >
                        <FiCamera />
                        {isProcessing ? 'Processando...' : 'Capturar Placa'}
                      </button>
                      <button className="btn-stop" onClick={stopCamera}>
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