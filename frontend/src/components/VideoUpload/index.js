import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiVideo, FiX, FiCheck, FiCamera, FiZap } from 'react-icons/fi';
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
  
  // Estados para compressão ULTRA RÁPIDA
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [ffmpeg, setFfmpeg] = useState(null);
  const [compressionSpeed, setCompressionSpeed] = useState(0);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const compressionStartTime = useRef(null);
  const lastProgressTime = useRef(null);

  // Inicializar FFmpeg com configurações EXTREMAS de velocidade
  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      
      ffmpegInstance.on('log', ({ message }) => {
        // Só logs críticos para não atrasar
        if (message.includes('error') || message.includes('warning')) {
          console.log(message);
        }
      });
      
      ffmpegInstance.on('progress', ({ progress }) => {
        const currentProgress = Math.round(progress * 100);
        setCompressionProgress(currentProgress);
        
        // Calcular velocidade de compressão
        const now = Date.now();
        if (lastProgressTime.current && compressionStartTime.current) {
          const timeElapsed = (now - compressionStartTime.current) / 1000;
          const speed = currentProgress / timeElapsed;
          setCompressionSpeed(speed.toFixed(1));
        }
        lastProgressTime.current = now;
      });

      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFfmpeg(ffmpegInstance);
        console.log('🚀 COMPRESSOR ULTRA-RÁPIDO CARREGADO!');
      } catch (error) {
        console.error('Erro ao carregar FFmpeg:', error);
      }
    };

    loadFFmpeg();
  }, []);

  // CONFIGURAÇÕES EXTREMAS DE VELOCIDADE
  const getUltraFastSettings = (fileSize) => {
    const sizeMB = fileSize / (1024 * 1024);
    
    if (sizeMB > 500) {
      // MODO DESTRUIÇÃO TOTAL - VELOCIDADE MÁXIMA
      return {
        preset: 'ultrafast',
        crf: '35', // Qualidade baixa, mas RÁPIDO
        scale: 'scale=854:480', // 480p para velocidade extrema
        audioBitrate: '64k', // Áudio mínimo
        videoCodec: 'libx264',
        extraParams: [
          '-tune', 'zerolatency',
          '-x264opts', 'no-cabac:no-deblock:no-weightb:weightp=0:me=dia:subme=1:ref=1:analyse=none:trellis=0:8x8dct=0',
          '-threads', '0',
          '-slices', '4'
        ]
      };
    } else if (sizeMB > 200) {
      // MODO SPEED DEMON
      return {
        preset: 'ultrafast',
        crf: '32',
        scale: 'scale=1280:720', // 720p
        audioBitrate: '80k',
        videoCodec: 'libx264',
        extraParams: [
          '-tune', 'zerolatency',
          '-x264opts', 'no-cabac:no-deblock:weightp=0:me=dia:subme=2:ref=1:analyse=none',
          '-threads', '0'
        ]
      };
    } else if (sizeMB > 100) {
      // MODO LIGHTNING
      return {
        preset: 'ultrafast',
        crf: '30',
        scale: 'scale=1280:720',
        audioBitrate: '96k',
        videoCodec: 'libx264',
        extraParams: [
          '-tune', 'zerolatency',
          '-threads', '0'
        ]
      };
    } else {
      // MODO ROCKET
      return {
        preset: 'veryfast',
        crf: '28',
        scale: 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        audioBitrate: '128k',
        videoCodec: 'libx264',
        extraParams: ['-threads', '0']
      };
    }
  };

  // COMPRESSOR ULTRA-RÁPIDO - O MAIS RÁPIDO DO MUNDO! 🚀
  const ultraFastCompress = async (file) => {
    if (!ffmpeg) {
      throw new Error('FFmpeg não está carregado');
    }

    setIsCompressing(true);
    setCompressionProgress(0);
    setCompressionSpeed(0);
    compressionStartTime.current = Date.now();
    lastProgressTime.current = Date.now();

    try {
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      
      const settings = getUltraFastSettings(file.size);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

      console.log(`🔥 INICIANDO COMPRESSÃO ULTRA-RÁPIDA: ${sizeMB}MB`);
      console.log(`⚡ MODO: ${settings.preset.toUpperCase()}`);

      // Escrever arquivo
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // ARGUMENTOS EXTREMOS DE VELOCIDADE
      const ffmpegArgs = [
        '-i', inputName,
        '-c:v', settings.videoCodec,
        '-preset', settings.preset,
        '-crf', settings.crf,
        '-c:a', 'aac',
        '-b:a', settings.audioBitrate,
        '-vf', settings.scale,
        '-movflags', '+faststart',
        '-profile:v', 'baseline', // Perfil mais simples
        '-level', '3.0',
        '-r', '24', // FPS reduzido para velocidade
        '-g', '48', // GOP menor
        '-sc_threshold', '0', // Desabilitar scene cut
        '-bf', '0', // Sem B-frames
        '-refs', '1', // Apenas 1 referência
        '-me_method', 'dia', // Algoritmo mais rápido
        '-subq', '1', // Subpixel mais rápido
        '-trellis', '0', // Sem trellis
        '-aq-mode', '0', // Sem adaptive quantization
        '-fast-pskip', '1',
        '-dct-decimate', '1',
        ...settings.extraParams,
        outputName
      ];

      console.log('�� EXECUTANDO COMPRESSÃO EXTREMA...');
      
      // EXECUÇÃO ULTRA-RÁPIDA
      await ffmpeg.exec(ffmpegArgs);

      // Ler resultado
      const data = await ffmpeg.readFile(outputName);
      const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
      
      const compressedFile = new File(
        [compressedBlob], 
        `turbo_${file.name.replace(/\.[^/.]+$/, '')}.mp4`, 
        { type: 'video/mp4' }
      );

      // Limpar
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const compressionTime = ((Date.now() - compressionStartTime.current) / 1000).toFixed(1);
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      const reductionPercent = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      const speedMBps = (originalSizeMB / compressionTime).toFixed(1);

      console.log(`🎯 COMPRESSÃO CONCLUÍDA EM ${compressionTime}s!`);
      console.log(`📊 ${originalSizeMB}MB → ${compressedSizeMB}MB (${reductionPercent}% redução)`);
      console.log(`⚡ VELOCIDADE: ${speedMBps} MB/s`);

      return compressedFile;
    } catch (error) {
      console.error('❌ Erro na compressão ultra-rápida:', error);
      throw error;
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
      setCompressionSpeed(0);
      compressionStartTime.current = null;
      lastProgressTime.current = null;
    }
  };

  // Compressão agressiva - sempre comprimir vídeos >30MB
  const shouldCompress = (file) => {
    return file.size > 30 * 1024 * 1024; // 30MB
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      
      if (shouldCompress(file) && ffmpeg) {
        try {
          const compressedFile = await ultraFastCompress(file);
          handleUpload(compressedFile);
        } catch (error) {
          console.error('Erro na compressão, enviando original:', error);
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

      // Progresso simulado mais rápido
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + 15; // Incremento maior
        });
      }, 150); // Intervalo menor

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
    setCompressionSpeed(0);
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
        
        if (shouldCompress(file) && ffmpeg) {
          try {
            const compressedFile = await ultraFastCompress(file);
            handleUpload(compressedFile);
          } catch (error) {
            console.error('Erro na compressão, enviando original:', error);
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
        videoBitsPerSecond: 1000000 // 1 Mbps para gravação mais leve
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
        const file = new File([blob], `turbo_record_${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedVideo(file);
        
        if (ffmpeg && shouldCompress(file)) {
          try {
            const compressedFile = await ultraFastCompress(file);
            handleUpload(compressedFile);
          } catch (error) {
            console.error('Erro na compressão, enviando original:', error);
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
            <FiZap className="video-upload__icon video-upload__icon--turbo" />
            <p className="video-upload__text">
              <strong>(Selecionar vídeo)</strong>
            </p>
            <p className="video-upload__hint">
              Clique ou arraste um vídeo
              <br />
              <small>Formatos: MP4, AVI, MOV</small>
            </p>
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
                  Comprimindo... {compressionProgress}%
                </span>
                {compressionSpeed > 0 && (
                  <span className="video-upload__speed">
                    {compressionSpeed}%/s
                  </span>
                )}
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