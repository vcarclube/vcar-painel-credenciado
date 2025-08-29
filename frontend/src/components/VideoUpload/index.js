import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiVideo, FiX, FiCheck, FiCamera } from 'react-icons/fi';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './style.css';
import Api from '../../Api';

const VideoUpload = ({ onVideoUpload, onVideoChange, required = false, label = "Upload de Vídeo" }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  // Estados para compressão
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [ffmpeg, setFfmpeg] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Inicializar FFmpeg
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

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      
      // Compactar se arquivo for maior que 25MB
      const shouldCompress = file.size > 25 * 1024 * 1024;
      
      if (shouldCompress && ffmpeg) {
        try {
          const compressedFile = await compressVideo(file);
          handleUpload(compressedFile);
        } catch (error) {
          console.error('Erro na compressão, enviando arquivo original:', error);
          handleUpload(file);
        }
      } else {
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

      const result = await Api.upload(formData);

      if (result.success) {
        setIsUploaded(true);
        if (onVideoUpload) onVideoUpload(file, result);
        if (onVideoChange) onVideoChange(file, result);
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
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
    if (onVideoUpload) {
      onVideoUpload(null);
    }
    if (onVideoChange) {
      onVideoChange(null);
    }
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
        
        const shouldCompress = file.size > 25 * 1024 * 1024;
        
        if (shouldCompress && ffmpeg) {
          try {
            const compressedFile = await compressVideo(file);
            handleUpload(compressedFile);
          } catch (error) {
            console.error('Erro na compressão, enviando arquivo original:', error);
            handleUpload(file);
          }
        } else {
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
        videoBitsPerSecond: 2000000 // 2 Mbps
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
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedVideo(file);
        
        // Compactar vídeo gravado se necessário
        if (ffmpeg && blob.size > 20 * 1024 * 1024) { // 20MB
          try {
            const compressedFile = await compressVideo(file);
            handleUpload(compressedFile);
          } catch (error) {
            console.error('Erro na compressão, enviando arquivo original:', error);
            handleUpload(file);
          }
        } else {
          handleUpload(file);
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setRecordedChunks([]);
        chunksRef.current = [];
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordedChunks([]);
    chunksRef.current = [];
  };

  return (
    <div className="video-upload">
      <label className="video-upload__label">
        {label}
        {required && <span className="video-upload__required">*</span>}
      </label>
      
      {isRecording ? (
        <div className="video-upload__recording">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            className="video-upload__camera-preview"
          />
          <div className="video-upload__recording-controls">
            <button 
              className="video-upload__record-btn video-upload__record-btn--stop"
              onClick={stopRecording}
              type="button"
            >
              <FiCheck /> Finalizar Gravação
            </button>
            <button 
              className="video-upload__record-btn video-upload__record-btn--cancel"
              onClick={cancelRecording}
              type="button"
            >
              <FiX /> Cancelar
            </button>
          </div>
        </div>
      ) : !selectedVideo ? (
        <div className="video-upload__options">
          <div 
            className="video-upload__dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FiVideo className="video-upload__icon" />
            <p className="video-upload__text">
              Clique aqui ou arraste um vídeo
            </p>
            <p className="video-upload__hint">
              Formatos aceitos: MP4, AVI, MOV
            </p>
          </div>
          
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
            >
              <FiX />
            </button>
          </div>
          
          {isCompressing && (
            <div className="video-upload__progress">
              <div className="video-upload__progress-bar">
                <div 
                  className="video-upload__progress-fill"
                  style={{ width: `${compressionProgress}%` }}
                />
              </div>
              <span className="video-upload__progress-text">
                Compactando... {compressionProgress}%
              </span>
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
                {uploadProgress}%
              </span>
            </div>
          )}
          
          {isUploaded && (
            <div className="video-upload__success">
              <FiCheck className="video-upload__success-check" />
              <span>Vídeo enviado com sucesso!</span>
            </div>
          )}
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