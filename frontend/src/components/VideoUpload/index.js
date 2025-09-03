import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiVideo, FiX, FiCheck, FiCamera, FiZap } from 'react-icons/fi';
import './style.css';
import Api from '../../Api';
import mediaBunnyCompression from '../../utils/MediaBunnyCompression';

const VideoUpload = ({ onVideoUpload, onVideoChange, required = false, label = "Upload de Vídeo" }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  // Estados para compressão usando WebCodecs
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStartTime, setCompressionStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Verificar se há suporte ao MediaBunny
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🎬 MediaBunny carregado para compressão de vídeo');
    }
  }, []);



  // Função para compactar vídeo usando MediaBunny
  const compressVideo = async (file) => {
    setIsCompressing(true);
    setCompressionProgress(0);
    setCompressionStartTime(Date.now());
    setEstimatedTimeRemaining(null);

    try {
      const startTime = Date.now();
      const compressedFile = await mediaBunnyCompression.compressVideo(file, (progress) => {
        setCompressionProgress(progress);
        
        // Calcular tempo estimado restante
        if (progress > 0) {
          const elapsed = Date.now() - startTime;
          const estimated = elapsed / (progress / 100);
          const remaining = Math.max(0, estimated - elapsed);
          setEstimatedTimeRemaining(Math.round(remaining / 1000));
        }
      });
      
      return compressedFile;
    } catch (error) {
      console.error('❌ Erro na compressão:', error);
      throw error;
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
      setEstimatedTimeRemaining(null);
    }
  };

  const shouldCompress = (file) => {
    return mediaBunnyCompression.needsCompression(file);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      
      console.log(`📁 Arquivo selecionado: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      
      if (shouldCompress(file)) {
        try {
          console.log('🚀 Iniciando compressão...');
          const compressedFile = await compressVideo(file);
          console.log(`✅ Compressão concluída: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);
          handleUpload(compressedFile);
        } catch (error) {
          console.error('❌ Erro na compressão, enviando arquivo original:', error);
          handleUpload(file);
        }
      } else {
        console.log('⏭️ Enviando arquivo original');
        handleUpload(file);
      }
    } else {
      alert('Por favor, selecione um arquivo de vídeo válido.');
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Progresso simulado
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 150);

      const result = await Api.upload(formData);
      
      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (result.success) {
        setIsUploaded(true);
        if (onVideoUpload) onVideoUpload(file, result);
        if (onVideoChange) onVideoChange(file, result);
      } else {
        console.error(result.error);
        alert('Erro ao enviar o vídeo. Tente novamente.');
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert('Erro ao enviar o vídeo. Verifique sua conexão e tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setIsUploaded(false);
    setUploadProgress(0);
    setCompressionProgress(0);
    setIsCompressing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onVideoUpload) onVideoUpload(null);
    if (onVideoChange) onVideoChange(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setSelectedVideo(file);
        
        console.log(`📁 Arquivo arrastado: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        
        if (shouldCompress(file)) {
          try {
            console.log('🚀 Iniciando compressão...');
            const compressedFile = await compressVideo(file);
            console.log(`✅ Compressão concluída: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);
            handleUpload(compressedFile);
          } catch (error) {
            console.error('❌ Erro na compressão, enviando arquivo original:', error);
            handleUpload(file);
          }
        } else {
          console.log('⏭️ Enviando arquivo original');
          handleUpload(file);
        }
      } else {
        alert('Por favor, selecione um arquivo de vídeo válido.');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1000000 // 1 Mbps
      });
      
      setMediaRecorder(recorder);
      setRecordedChunks([]);
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedVideo(file);
        
        if (shouldCompress(file)) {
          try {
            console.log('🚀 Comprimindo gravação...');
            const compressedFile = await compressVideo(file);
            handleUpload(compressedFile);
          } catch (error) {
            console.error('❌ Erro na compressão da gravação:', error);
            handleUpload(file);
          }
        } else {
          handleUpload(file);
        }
        
        stopCamera();
      };
      
      setIsRecording(true);
      recorder.start();
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="video-upload">
      <label className="video-upload__label">
        {label}
        {required && <span className="video-upload__required">*</span>}
      </label>
      
      {!selectedVideo ? (
        <div 
          className="video-upload__dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="video-upload__icon">
            <FiUpload size={48} />
          </div>
          <div className="video-upload__text">
            <span className="video-upload__main-text">Clique ou arraste um vídeo aqui</span>
            <span className="video-upload__sub-text">MP4, AVI, MOV, WebM (máx. 500MB)</span>
          </div>
          
          <button 
            style={{display: 'none'}} 
            className="video-upload__record-btn"
            onClick={startRecording}
            type="button"
          >
            <FiCamera /> Gravar Vídeo
          </button>
        </div>
      ) : (
        <div className="video-upload__preview">
          <div className="video-upload__file-info">
            <FiVideo className="video-upload__file-icon" />
            <div className="video-upload__file-details">
              <span className="video-upload__file-name">{selectedVideo.name}</span>
              <span className="video-upload__file-size">
                {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            {isUploaded && (
              <FiCheck className="video-upload__success-icon" />
            )}
            <button 
              className="video-upload__remove-btn"
              onClick={handleRemoveVideo}
              type="button"
              disabled={isCompressing || isUploading}
            >
              <FiX />
            </button>
          </div>
          
          {isCompressing && (
            <div className="video-upload__progress">
              <div className="video-upload__progress-bar">
                <div 
                  className="video-upload__progress-fill video-upload__progress-fill--turbo"
                  style={{ width: `${compressionProgress}%` }}
                />
              </div>
              <div className="video-upload__progress-info">
                <span className="video-upload__progress-text">
                  ⚡ Compressão ultra-rápida... {compressionProgress}%
                </span>
                <span className="video-upload__progress-subtitle">
                  {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 
                    ? `⏱️ Tempo restante: ${estimatedTimeRemaining}s` 
                    : 'Calculando tempo restante...'}
                </span>
                <span className="video-upload__progress-details">
                  🚀 Otimizado para velocidade máxima
                </span>
              </div>
            </div>
          )}
          
          {isUploading && !isCompressing && (
            <div className="video-upload__progress">
              <div className="video-upload__progress-bar">
                <div 
                  className="video-upload__progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="video-upload__progress-text">
                Enviando... {uploadProgress}%
              </span>
            </div>
          )}
          
          {isUploaded && (
            <div className="video-upload__success">
              <FiCheck className="video-upload__success-check" />
              <span>🎯 Vídeo enviado com sucesso!</span>
            </div>
          )}
        </div>
      )}
      
      {isRecording && (
        <div className="video-upload__recording">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            className="video-upload__preview-video"
          />
          <div className="video-upload__recording-controls">
            <button 
              className="video-upload__stop-btn"
              onClick={stopRecording}
              type="button"
            >
              <FiX /> Parar Gravação
            </button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="camera"
        onChange={handleFileSelect}
        className="video-upload__input"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default VideoUpload;