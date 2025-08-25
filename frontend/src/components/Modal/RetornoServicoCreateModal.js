import React, { useState } from 'react';
import Modal from './index';
import { Button, Input, SearchableSelect } from '../index';
import { FiPlus, FiX, FiCamera, FiVideo, FiUpload } from 'react-icons/fi';

const RetornoServicoCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    agendamentoConcluido: '',
    tipoRetorno: '',
    status: 'ABERTO',
    descricaoProblema: '',
    fotos: [],
    videos: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Opções para os selects
  const tipoRetornoOptions = [
    { value: 'SELECIONE...', label: 'SELECIONE...' },
    { value: 'Garantia', label: 'Garantia' },
    { value: 'Retrabalho', label: 'Retrabalho' },
    { value: 'Manutenção', label: 'Manutenção' }
  ];

  const statusOptions = [
    { value: 'ABERTO', label: 'ABERTO' },
    { value: 'EM_ANDAMENTO', label: 'EM ANDAMENTO' },
    { value: 'CONCLUIDO', label: 'CONCLUÍDO' },
    { value: 'CANCELADO', label: 'CANCELADO' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.agendamentoConcluido.trim()) {
      newErrors.agendamentoConcluido = 'Agendamento Concluído é obrigatório';
    }

    if (!formData.tipoRetorno || formData.tipoRetorno === 'SELECIONE...') {
      newErrors.tipoRetorno = 'Tipo do Retorno é obrigatório';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    if (!formData.descricaoProblema.trim()) {
      newErrors.descricaoProblema = 'Descrição do Problema é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funções para upload de arquivos
  const handleFileUpload = (type, files) => {
    const fileArray = Array.from(files);
    const maxSize = type === 'fotos' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB para fotos, 50MB para vídeos
    const allowedTypes = type === 'fotos' 
      ? ['image/jpeg', 'image/png', 'image/gif']
      : ['video/mp4', 'video/avi', 'video/mov'];

    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        alert(`Arquivo ${file.name} é muito grande. Tamanho máximo: ${type === 'fotos' ? '5MB' : '50MB'}`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de arquivo ${file.name} não suportado.`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...validFiles]
    }));
  };

  const removeFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newRetorno = {
        id: Date.now(), // ID temporário
        ...formData,
        dataRetorno: new Date().toLocaleDateString('pt-BR'),
        horaRetorno: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      await onCreate(newRetorno);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar retorno:', error);
      alert('Erro ao criar retorno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Resetar formulário
      setFormData({
        agendamentoConcluido: '',
        tipoRetorno: '',
        status: 'ABERTO',
        descricaoProblema: '',
        fotos: [],
        videos: []
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Novo Retorno de Serviço"
      size="large"
      preventClose={loading}
    >
      <div className="retorno-create-content">
        <div className="retorno-create-form">
          {/* Agendamento Concluído */}
          <div className="retorno-create-row">
            <div className="retorno-create-field">
              <label className="retorno-create-label">Agendamento Concluído</label>
              <SearchableSelect
                options={[]}
                value={formData.agendamentoConcluido}
                onChange={(value) => handleInputChange('agendamentoConcluido', value)}
                placeholder="Pesquise e selecione um agendamento..."
                error={errors.agendamentoConcluido}
                searchable
              />
            </div>
          </div>

          {/* Tipo do Retorno e Status */}
          <div className="retorno-create-row" style={{display: 'flex'}}>
            <div className="retorno-create-field">
              <label className="retorno-create-label">Tipo do Retorno</label>
              <SearchableSelect
                options={tipoRetornoOptions}
                value={formData.tipoRetorno}
                onChange={(value) => handleInputChange('tipoRetorno', value)}
                placeholder="SELECIONE..."
                error={errors.tipoRetorno}
              />
            </div>
            <div className="retorno-create-field">
              <label className="retorno-create-label">Status</label>
              <SearchableSelect
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                placeholder="ABERTO"
                error={errors.status}
              />
            </div>
          </div>

          {/* Descrição do Problema */}
          <div className="retorno-create-row">
            <div className="retorno-create-field">
              <label className="retorno-create-label">Descrição do Problema</label>
              <textarea
                className="retorno-create-textarea"
                value={formData.descricaoProblema}
                onChange={(e) => handleInputChange('descricaoProblema', e.target.value)}
                placeholder="Descreva o problema encontrado..."
                rows={4}
              />
              {errors.descricaoProblema && (
                <span className="retorno-create-error">{errors.descricaoProblema}</span>
              )}
            </div>
          </div>

          {/* Upload de Fotos e Vídeos */}
          <div className="retorno-create-row" style={{display: 'flex'}}>
            <div className="retorno-create-field">
              <label className="retorno-create-label">Fotos</label>
              <div className="upload-area">
                <input
                  type="file"
                  id="fotos-upload"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'fotos')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fotos-upload" className="upload-button">
                  <FiCamera className="upload-icon" />
                  <span>Clique ou arraste fotos aqui</span>
                  <small>JPG, PNG, GIF (máx. 5MB cada)</small>
                </label>
                {formData.fotos.length > 0 && (
                  <div className="uploaded-files">
                    {formData.fotos.map((file, index) => (
                      <div key={index} className="uploaded-file">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('fotos', index)}
                          className="remove-file"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.fotos && <div className="retorno-create-error">{errors.fotos}</div>}
            </div>
            <div className="retorno-create-field">
              <label className="retorno-create-label">Vídeos</label>
              <div className="upload-area">
                <input
                  type="file"
                  id="videos-upload"
                  multiple
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'videos')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="videos-upload" className="upload-button">
                  <FiVideo className="upload-icon" />
                  <span>Clique ou arraste vídeos aqui</span>
                  <small>MP4, AVI, MOV (máx. 50MB cada)</small>
                </label>
                {formData.videos.length > 0 && (
                  <div className="uploaded-files">
                    {formData.videos.map((file, index) => (
                      <div key={index} className="uploaded-file">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('videos', index)}
                          className="remove-file"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.videos && <div className="retorno-create-error">{errors.videos}</div>}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="retorno-create-actions">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            icon={FiX}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={loading}
            icon={FiPlus}
          >
            Salvar
          </Button>
        </div>
      </div>

      <style jsx>{`
        .retorno-create-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .retorno-create-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .retorno-create-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .retorno-create-row:has(.retorno-create-field:only-child) {
          grid-template-columns: 1fr;
        }

        .retorno-create-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .retorno-create-field > div {
          width: 100%;
        }

        .retorno-create-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .retorno-create-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.2s ease;
        }

        .retorno-create-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .retorno-create-textarea::placeholder {
          color: #9ca3af;
        }

        .retorno-create-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          transition: border-color 0.2s ease;
        }

        .upload-area:hover {
          border-color: #3b82f6;
        }

        .upload-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .upload-button:hover {
          color: #3b82f6;
        }

        .upload-icon {
          font-size: 24px;
          color: #9ca3af;
        }

        .upload-button span {
          font-size: 14px;
          font-weight: 500;
        }

        .upload-button small {
          font-size: 12px;
          color: #9ca3af;
        }

        .uploaded-files {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .uploaded-file {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #f3f4f6;
          border-radius: 6px;
          font-size: 14px;
        }

        .uploaded-file span {
          color: #374151;
          flex: 1;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .remove-file {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .remove-file:hover {
          background-color: #fee2e2;
        }

        .retorno-create-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .retorno-create-row {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }

          .retorno-create-field {
            width: 100%;
          }

          .retorno-create-field > div {
            width: 100% !important;
            min-width: 100%;
          }

          .retorno-create-actions {
            flex-direction: column-reverse;
          }

          .retorno-create-textarea {
            min-height: 80px;
          }

          .upload-area {
            padding: 12px;
          }

          .upload-button span {
            font-size: 13px;
          }

          .upload-button small {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .retorno-create-content {
            gap: 16px;
          }

          .retorno-create-form {
            gap: 16px;
          }

          .retorno-create-row {
            grid-template-columns: 1fr !important;
            gap: 12px;
          }

          .retorno-create-field {
            width: 100%;
          }

          .retorno-create-field > div {
            width: 100% !important;
            min-width: 100%;
          }

          .retorno-create-label {
            font-size: 13px;
          }

          .retorno-create-textarea {
            min-height: 70px;
            padding: 10px 12px;
            font-size: 13px;
          }

          .upload-area {
            padding: 10px;
          }

          .upload-icon {
            font-size: 20px;
          }

          .upload-button span {
            font-size: 12px;
          }

          .upload-button small {
            font-size: 10px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default RetornoServicoCreateModal;