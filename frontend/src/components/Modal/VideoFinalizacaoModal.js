import React, { useState } from 'react';
import Modal from './index';
import VideoUpload from '../VideoUpload';
import Button from '../Button';
import './style.css';

const VideoFinalizacaoModal = ({ isOpen, onCancel, onConfirm, servicosPendentes = [] }) => {
  const [video, setVideo] = useState(null);
  const [videoResult, setVideoResult] = useState(null);

  const hasServicosPendentes = servicosPendentes.length > 0;
  const canFinalize = video && !hasServicosPendentes;

  const handleVideoChange = (videoFile, result) => {
    setVideo(videoFile);
    setVideoResult(result);
  };

  const handleConfirm = () => {
    if (video && servicosPendentes.length === 0) {
      onConfirm(video, videoResult);
      setVideo(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Finalizar Ordem de Serviço"
      showCloseButton={true}
      size="medium"
    >
      <div className="video-modal-info">
        <p>Para finalizar a OS, é necessário fazer o upload de um vídeo do serviço concluído.</p>
      </div>
      
      {servicosPendentes.length > 0 && (
        <div className="video-modal-error">
          <p><strong>Atenção:</strong> Existem {servicosPendentes.length} serviço(s) pendente(s):</p>
          <ul>
            {servicosPendentes.map((servico, index) => (
              <li key={index}>{servico.nome} - Status: {servico.status}</li>
            ))}
          </ul>
          <p>Complete todos os serviços antes de finalizar a OS.</p>
        </div>
      )}
      
      <VideoUpload
        onVideoChange={handleVideoChange}
        accept="video/*"
        label="Selecione ou arraste o vídeo do serviço finalizado"
      />
      
      <div className="modal-actions">
        <Button 
          variant="secondary"
          size="medium"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary"
          size="medium"
          onClick={handleConfirm}
          disabled={!canFinalize}
        >
          Finalizar OS
        </Button>
      </div>
    </Modal>
  );
};

export default VideoFinalizacaoModal;