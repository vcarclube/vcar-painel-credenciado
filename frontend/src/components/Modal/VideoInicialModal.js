import React, { useState } from 'react';
import Modal from './index';
import VideoUpload from '../VideoUpload';
import Button from '../Button';
import './style.css';
import { useNavigate } from 'react-router-dom';

const VideoInicialModal = ({ isOpen, onConfirm }) => {
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [videoResult, setVideoResult] = useState(null);

  const handleVideoChange = (videoFile, result) => {
    setVideo(videoFile);
    setVideoResult(result);
  };

  const handleConfirm = () => {
    if (video) {
      onConfirm(video, videoResult);
      setVideo(null);
    }
  };

  // Função vazia para impedir fechamento do modal
  const handleClose = () => {
    // Modal obrigatório - não pode ser fechado
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vídeo Inicial Obrigatório"
      showCloseButton={false}
      size="medium"
      preventClose={true}
    >
      <div className="video-modal-info">
        <p>Antes de iniciar o serviço, é obrigatório fazer o upload de um vídeo do veículo.</p>
        <p>Este vídeo servirá como registro do estado inicial do veículo.</p>
      </div>
      
      <VideoUpload
        onVideoChange={handleVideoChange}
        accept="video/*"
        label="Selecione ou arraste o vídeo do veículo"
      />
      
      <div className="modal-actions">
        <Button 
          variant="default"
          size="medium"
          onClick={() => {navigate('/')}}
        >
          Voltar
        </Button>
        <Button 
          variant="primary"
          size="medium"
          onClick={handleConfirm}
          disabled={!video}
        >
          Confirmar e Iniciar Serviço
        </Button>
      </div>
    </Modal>
  );
};

export default VideoInicialModal;