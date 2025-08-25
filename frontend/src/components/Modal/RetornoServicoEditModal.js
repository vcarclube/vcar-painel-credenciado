import React, { useState, useEffect } from 'react';
import Modal from './index';
import { Button, Input, SearchableSelect } from '../index';
import { FiSave, FiX, FiCamera, FiVideo } from 'react-icons/fi';

const RetornoServicoEditModal = ({ isOpen, onClose, onSave, retorno }) => {
  const [formData, setFormData] = useState({
    agendamentoConcluido: '',
    tipoRetorno: '',
    status: '',
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

  // Preencher formulário quando retorno mudar
  useEffect(() => {
    if (retorno) {
      setFormData({
        agendamentoConcluido: retorno.agendamentoConcluido || '',
        tipoRetorno: retorno.tipoRetorno || '',
        status: retorno.status || '',
        descricaoProblema: retorno.descricaoProblema || '',
        fotos: retorno.fotos || [],
        videos: retorno.videos || []
      });
      setErrors({});
    }
  }, [retorno]);

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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatedRetorno = {
        ...retorno,
        ...formData
      };
      
      await onSave(updatedRetorno);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar retorno:', error);
      alert('Erro ao salvar retorno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Retorno de Serviço"
      size="large"
      preventClose={loading}
    >
      <div className="retorno-edit-content">
        <div className="retorno-edit-form">
          {/* Agendamento Concluído */}
          <div className="retorno-edit-row">
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Agendamento Concluído</label>
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
          <div className="retorno-edit-row">
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Tipo do Retorno</label>
              <SearchableSelect
                options={tipoRetornoOptions}
                value={formData.tipoRetorno}
                onChange={(value) => handleInputChange('tipoRetorno', value)}
                placeholder="SELECIONE..."
                error={errors.tipoRetorno}
              />
            </div>
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Status</label>
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
          <div className="retorno-edit-row">
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Descrição do Problema</label>
              <textarea
                className="retorno-edit-textarea"
                value={formData.descricaoProblema}
                onChange={(e) => handleInputChange('descricaoProblema', e.target.value)}
                placeholder="Descreva o problema encontrado..."
                rows={4}
              />
              {errors.descricaoProblema && (
                <span className="retorno-edit-error">{errors.descricaoProblema}</span>
              )}
            </div>
          </div>

          {/* Upload de Fotos e Vídeos */}
          <div className="retorno-edit-row">
            {/* Fotos */}
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Fotos</label>
              <div className="upload-area">
                <input
                  type="file"
                  id="fotos-upload-edit"
                  multiple
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => handleFileUpload('fotos', e.target.files)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fotos-upload-edit" className="upload-button">
                  <FiCamera className="upload-icon" />
                  <span>Clique ou arraste fotos aqui</span>
                  <small>JPG, PNG, GIF (máx. 5MB cada)</small>
                </label>
                {formData.fotos.length > 0 && (
                  <div className="uploaded-files">
                    {formData.fotos.map((file, index) => (
                      <div key={index} className="uploaded-file">
                        <span>{file.name || `Foto ${index + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('fotos', index)}
                          className="remove-file"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vídeos */}
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Vídeos</label>
              <div className="upload-area">
                <input
                  type="file"
                  id="videos-upload-edit"
                  multiple
                  accept="video/mp4,video/avi,video/mov"
                  onChange={(e) => handleFileUpload('videos', e.target.files)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="videos-upload-edit" className="upload-button">
                  <FiVideo className="upload-icon" />
                  <span>Clique ou arraste vídeos aqui</span>
                  <small>MP4, AVI, MOV (máx. 50MB cada)</small>
                </label>
                {formData.videos.length > 0 && (
                  <div className="uploaded-files">
                    {formData.videos.map((file, index) => (
                      <div key={index} className="uploaded-file">
                        <span>{file.name || `Vídeo ${index + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('videos', index)}
                          className="remove-file"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="retorno-edit-actions">
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
            onClick={handleSave}
            loading={loading}
            icon={FiSave}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>

      <style jsx>{`
        .retorno-edit-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .retorno-edit-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .retorno-edit-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .retorno-edit-row:has(.retorno-edit-field:only-child) {
          grid-template-columns: 1fr;
        }

        .retorno-edit-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .retorno-edit-field > div {
          width: 100%;
        }

        .retorno-edit-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .retorno-edit-textarea {
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

        .retorno-edit-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .retorno-edit-textarea::placeholder {
          color: #9ca3af;
        }

        .retorno-edit-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

      `}</style>

      <style jsx>{`
        .retorno-edit-content {
          padding: 20px;
        }

        .retorno-edit-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .retorno-edit-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .retorno-edit-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .retorno-edit-label {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .retorno-edit-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          min-height: 100px;
        }

        .retorno-edit-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .retorno-edit-error {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }

        .upload-area {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: border-color 0.3s ease;
        }

        .upload-area:hover {
          border-color: #007bff;
        }

        .upload-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #666;
          transition: color 0.3s ease;
        }

        .upload-button:hover {
          color: #007bff;
        }

        .upload-icon {
          font-size: 32px;
          color: #999;
        }

        .upload-button span {
          font-size: 14px;
          font-weight: 500;
        }

        .upload-button small {
          font-size: 12px;
          color: #999;
        }

        .uploaded-files {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .uploaded-file {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 14px;
        }

        .remove-file {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-file:hover {
          background: #dc3545;
          color: white;
        }

        .retorno-edit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        @media (max-width: 768px) {
          .retorno-edit-content {
            padding: 12px;
          }

          .retorno-edit-form {
            gap: 16px;
          }

          .retorno-edit-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .retorno-edit-field {
            gap: 6px;
            width: 100%;
          }

          .retorno-edit-field > div {
            width: 100% !important;
            min-width: 100%;
          }

          .retorno-edit-label {
            font-size: 13px;
            font-weight: 600;
          }

          .retorno-edit-textarea {
            padding: 10px 12px;
            font-size: 14px;
            min-height: 80px;
          }

          .upload-area {
            padding: 12px;
            border-width: 1px;
          }

          .upload-button {
            gap: 6px;
          }

          .upload-icon {
            font-size: 20px;
          }

          .upload-button span {
            font-size: 13px;
          }

          .upload-button small {
            font-size: 11px;
          }

          .uploaded-files {
            margin-top: 10px;
            gap: 6px;
          }

          .uploaded-file {
            padding: 6px 10px;
            font-size: 13px;
          }

          .remove-file {
            padding: 3px;
          }

          .retorno-edit-actions {
            flex-direction: column-reverse;
            gap: 8px;
            margin-top: 20px;
            padding-top: 16px;
          }

          .retorno-edit-actions button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .retorno-edit-content {
            padding: 8px;
          }

          .retorno-edit-form {
            gap: 12px;
          }

          .retorno-edit-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .retorno-edit-field {
            width: 100%;
          }

          .retorno-edit-field > div {
            width: 100% !important;
            min-width: 100%;
          }

          .retorno-edit-label {
            font-size: 12px;
          }

          .retorno-edit-textarea {
            padding: 8px 10px;
            font-size: 13px;
            min-height: 70px;
          }

          .upload-area {
            padding: 10px;
          }

          .upload-icon {
            font-size: 18px;
          }

          .upload-button span {
            font-size: 12px;
          }

          .upload-button small {
            font-size: 10px;
          }

          .retorno-edit-actions {
            margin-top: 16px;
            padding-top: 12px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default RetornoServicoEditModal;