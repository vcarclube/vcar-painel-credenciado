import React, { useState } from 'react';
import Modal from './index';
import VideoUpload from '../VideoUpload';
import Button from '../Button';
import { Input } from '../index';
import './style.css';

const VideoFinalizacaoModal = ({ isOpen, onCancel, onConfirm, servicosPendentes = [] }) => {
  const [video, setVideo] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [responsavel, setResponsavel] = useState('');
  const [km, setKm] = useState('');
  const [observacao, setObservacao] = useState('');

  const hasServicosPendentes = servicosPendentes.length > 0;
  const canFinalize = video && !hasServicosPendentes && responsavel.trim() !== '';

  const handleVideoChange = (videoFile, result) => {
    setVideo(videoFile);
    setVideoResult(result);
  };

  const handleConfirm = () => {
    if (video && servicosPendentes.length === 0 && responsavel.trim() !== '') {
      onConfirm(video, videoResult, {
        responsavel: responsavel.trim(),
        km: km?.toString() || '',
        observacao: observacao?.trim() || ''
      });
      setVideo(null);
      setResponsavel('');
      setKm('');
      setObservacao('');
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
        <p>Para finalizar a OS, é necessário fazer o upload de um vídeo dos serviços concluídos.</p>
      </div>
      {servicosPendentes.length > 0 && (
        <div className="video-modal-error">
          <p><strong>Atenção:</strong> Existem {servicosPendentes.length} serviço(s) pendente(s) de aprovação:</p>
          <ul style={{listStyle: 'none'}}>
            {servicosPendentes.map((servico, index) => (
              <li key={index} style={{fontSize: '10pt'}}>
                • {servico.label}
              </li>
            ))}
          </ul>
          <p style={{marginTop: '15px'}}></p>
        </div>
      )}
      
      <VideoUpload
        onVideoChange={handleVideoChange}
        accept="video/*"
        label="Selecione ou arraste o vídeo dos serviços finalizados"
      />
      <div className="video-finalizacao-modal__form" style={{ marginTop: 16, marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="responsavel" style={{ display: 'block', marginBottom: 6 }}>Responsável/Mecânico <span style={{ color: '#ef4444' }}>*</span></label>
          <Input
            id="responsavel"
            type="text"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Digite o nome do responsável"
          />
          {responsavel.trim() === '' && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>Campo obrigatório</div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="km" style={{ display: 'block', marginBottom: 6 }}>KM atual do veículo (opcional)</label>
          <Input
            id="km"
            type="number"
            inputMode="numeric"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="Informe o KM atual"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="observacao" style={{ display: 'block', marginBottom: 6 }}>Observação (opcional)</label>
          <textarea
            id="observacao"
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Adicione alguma observação, se necessário"
            className="input-component"
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>
      
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