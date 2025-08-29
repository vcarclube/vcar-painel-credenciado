import React, { useState, useRef, useCallback } from 'react';
import { FiCamera, FiVideo, FiUpload, FiX, FiPlay, FiPause, FiSquare } from 'react-icons/fi';
import './style.css';

const MediaUpload = ({ 
  onMediaAdd, 
  acceptedTypes = 'image/*,video/*',
  multiple = true,
  showCamera = true,
  showVideoRecording = true,
  className = '',
  hideButtons = false,
  triggerRef = null
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // Expor funções para o componente pai através do triggerRef
  React.useImperativeHandle(triggerRef, () => ({
    openFileSelector: () => fileInputRef.current?.click(),
    startCamera: () => startCamera(false),
    startVideoRecording: () => startCamera(true)
  }), []);

  // Função para lidar com upload de arquivos
  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const mediaItem = {
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size
      };
      onMediaAdd(mediaItem);
    });
    // Reset input
    event.target.value = '';
  }, [onMediaAdd]);

  // Função para iniciar a câmera
  const startCamera = useCallback(async (videoMode = false) => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Câmera traseira por padrão
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: videoMode
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCameraPreview(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }, []);

  // Função para parar a câmera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraPreview(false);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [stream]);

  // Função para capturar foto
  const capturePhoto = useCallback(() => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const photoItem = {
          id: Date.now() + Math.random(),
          file: new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' }),
          url: URL.createObjectURL(blob),
          name: `foto_${Date.now()}.jpg`,
          type: 'image',
          size: blob.size
        };
        onMediaAdd(photoItem);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  }, [stream, onMediaAdd, stopCamera]);

  // Função para iniciar gravação de vídeo
  const startRecording = useCallback(() => {
    if (stream) {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoItem = {
          id: Date.now() + Math.random(),
          file: new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' }),
          url: URL.createObjectURL(blob),
          name: `video_${Date.now()}.webm`,
          type: 'video',
          size: blob.size
        };
        onMediaAdd(videoItem);
        stopCamera();
      };
      
      setRecordedChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      // Timer para mostrar tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  }, [stream, onMediaAdd, stopCamera]);

  // Função para pausar/retomar gravação
  const togglePauseRecording = useCallback(() => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorder.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [mediaRecorder, isPaused]);

  // Função para parar gravação
  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [mediaRecorder, isRecording]);

  // Formatar tempo de gravação
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`media-upload ${className}`}>
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        capture="camera"
        multiple={multiple}
        accept={acceptedTypes}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Preview da câmera */}
      {showCameraPreview && (
        <div className="media-upload__camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="media-upload__video-preview"
          />
          
          {/* Timer de gravação */}
          {isRecording && (
            <div className="media-upload__recording-timer">
              <div className="media-upload__recording-dot" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          )}
          
          {/* Controles da câmera */}
          <div className="media-upload__camera-controls">
            <button
              className="media-upload__control-btn media-upload__control-btn--secondary"
              onClick={stopCamera}
            >
              <FiX size={20} />
            </button>
            
            {!isRecording ? (
              <>
                <button
                  className="media-upload__control-btn media-upload__control-btn--photo"
                  onClick={capturePhoto}
                >
                  <FiCamera size={24} />
                </button>
                
                {showVideoRecording && (
                  <button
                    className="media-upload__control-btn media-upload__control-btn--video"
                    onClick={startRecording}
                  >
                    <FiVideo size={20} />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  className="media-upload__control-btn media-upload__control-btn--pause"
                  onClick={togglePauseRecording}
                >
                  {isPaused ? <FiPlay size={20} /> : <FiPause size={20} />}
                </button>
                
                <button
                  className="media-upload__control-btn media-upload__control-btn--stop"
                  onClick={stopRecording}
                >
                  <FiSquare size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Botões de ação quando não está na preview */}
      {!showCameraPreview && !hideButtons && (
        <div className="media-upload__actions">
          <button
            className="media-upload__action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload size={16} />
            Selecionar Arquivos
          </button>
          
          {showCamera && (
            <button
              className="media-upload__action-btn"
              onClick={() => startCamera(false)}
            >
              <FiCamera size={16} />
              Tirar Foto
            </button>
          )}
          
          {showVideoRecording && (
            <button
              className="media-upload__action-btn"
              onClick={() => startCamera(true)}
            >
              <FiVideo size={16} />
              Gravar Vídeo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;