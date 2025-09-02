import React, { useState, useContext, useEffect } from 'react';
import Modal from './index';
import { Button, Input, SearchableSelect } from '../index';
import { FiPlus, FiX, FiCamera, FiVideo, FiUpload, FiSave } from 'react-icons/fi';
import { MainContext } from '../../helpers/MainContext';
import { toast } from 'react-toastify';
import Api from '../../Api';

const RetornoServicoCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useContext(MainContext);
  const [formData, setFormData] = useState({
    IdSocioVeiculoAgenda: '',
    Tipo: '',
    Status: 'PENDENTE',
    Descricao: '',
    Fotos: '',
    Videos: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agendamentos, setAgendamentos] = useState([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);

  // Opções para os selects
  const tipoRetornoOptions = [
    { value: 'PEÇA', label: 'PEÇA' },
    { value: 'MÃO DE OBRA', label: 'MÃO DE OBRA' },
    { value: 'ATENDIMENTO', label: 'ATENDIMENTO' },
    { value: 'OUTROS', label: 'OUTROS' }
  ];

    const statusOptions = [
    { value: 'A', label: 'PENDENTE' },
    { value: 'P', label: 'EM CHAMADO' },
    { value: 'C', label: 'CONCLUÍDO' }
  ];

  // Carregar agendamentos disponíveis quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadAgendamentos();
    }
  }, [isOpen]);

  const loadAgendamentos = async () => {
    setLoadingAgendamentos(true); 
    try {
      const response = await Api.getAgendamentosDisponiveis({idPontoAtendimento: user.IdPontoAtendimento});
      if (response?.data?.success) {
        const agendamentosFormatados = response.data.data.map(agendamento => ({
          value: agendamento.IdSocioVeiculoAgenda,
          label: `OS ${agendamento.NumeroOS} - ${agendamento.SocioNome} - ${agendamento.Placa} - ${agendamento.NomeServico.toUpperCase()}`
        }));
        setAgendamentos([{ value: '', label: 'SELECIONE...' }, ...agendamentosFormatados]);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos disponíveis');
    } finally {
      setLoadingAgendamentos(false);
    }
  };

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

    if (!formData.IdSocioVeiculoAgenda) {
      newErrors.IdSocioVeiculoAgenda = 'Agendamento é obrigatório';
    }

    if (!formData.Tipo) {
      newErrors.Tipo = 'Tipo do Retorno é obrigatório';
    }

    if (!formData.Status) {
      newErrors.Status = 'Status é obrigatório';
    }

    if (!formData.Descricao.trim()) {
      newErrors.Descricao = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funções para upload de arquivos
  const handleFileUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await Api.upload(formData);
        
        if (uploadResponse.success) {
          uploadedFiles.push(uploadResponse.file);
        }
      }
      
      if (uploadedFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          [type]: uploadedFiles.join(',')
        }));
        toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await Api.addRetornoServico({ data: formData });
      
      if (response?.data?.success) {
        toast.success('Retorno de serviço criado com sucesso!');
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Erro ao criar retorno de serviço');
      }
    } catch (error) {
      console.error('Erro ao criar retorno:', error);
      toast.error('Erro ao criar retorno de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Resetar formulário
      setFormData({
        IdSocioVeiculoAgenda: '',
        Tipo: '',
        Status: 'PENDENTE',
        Descricao: '',
        Fotos: '',
        Videos: ''
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
          {/* Agendamento */}
          <div className="retorno-create-row">
            <div className="retorno-create-field">
              <label className="retorno-create-label">Agendamento</label>
              <SearchableSelect
                options={agendamentos}
                value={formData.IdSocioVeiculoAgenda}
                onChange={(option) => handleInputChange('IdSocioVeiculoAgenda', option?.value || '')}
                placeholder={loadingAgendamentos ? "Carregando agendamentos..." : "Pesquise e selecione um agendamento..."}
                error={errors.IdSocioVeiculoAgenda}
                searchable
                disabled={loadingAgendamentos}
              />
            </div>
          </div>

          {/* Tipo do Retorno e Status */}
          <div className="retorno-create-row" style={{display: 'flex'}}>
            <div className="retorno-create-field">
              <label className="retorno-create-label">Tipo do Retorno</label>
              <SearchableSelect
                options={tipoRetornoOptions}
                value={formData.Tipo}
                onChange={(option) => handleInputChange('Tipo', option?.value || '')}
                placeholder="SELECIONE..."
                error={errors.Tipo}
              />
            </div>
            <div className="retorno-create-field">
              <label className="retorno-create-label">Status</label>
              <SearchableSelect
                options={statusOptions}
                value={formData.Status}
                onChange={(option) => handleInputChange('Status', option?.value || '')}
                placeholder="PENDENTE"
                error={errors.Status}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="retorno-create-row">
            <div className="retorno-create-field">
              <label className="retorno-create-label">Descrição</label>
              <textarea
                className="retorno-create-textarea"
                value={formData.Descricao}
                onChange={(e) => handleInputChange('Descricao', e.target.value)}
                placeholder="Descreva o retorno..."
                rows={4}
              />
              {errors.Descricao && (
                <span className="retorno-create-error">{errors.Descricao}</span>
              )}
            </div>
          </div>

          {/* Upload de Fotos */}
          <div className="retorno-create-row">
            <div className="retorno-create-field">
              <label className="retorno-create-label">Fotos</label>
              <div className="upload-area">
                <div className="upload-icon">📷</div>
                <p>Clique ou arraste fotos aqui</p>
                <p className="upload-hint">JPG, PNG até 5MB cada</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'Fotos')}
                  style={{ display: 'none' }}
                  id="foto-upload"
                />
                <label htmlFor="foto-upload" className="upload-button">
                  <FiCamera />
                  <span>Selecionar Fotos</span>
                </label>
              </div>
              {formData.Fotos && (
                <div className="uploaded-files">
                  <div className="uploaded-file">
                    <span>📷 {formData.Fotos}</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('Fotos', '')}
                      className="remove-file"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload de Vídeos */}
          <div className="retorno-create-row">
            <div className="retorno-create-field">
              <label className="retorno-create-label">Vídeos</label>
              <div className="upload-area">
                <div className="upload-icon">🎥</div>
                <p>Clique ou arraste vídeos aqui</p>
                <p className="upload-hint">MP4, MOV até 50MB cada</p>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'Videos')}
                  style={{ display: 'none' }}
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="upload-button">
                  <FiVideo />
                  <span>Selecionar Vídeos</span>
                </label>
              </div>
              {formData.Videos && (
                <div className="uploaded-files">
                  <div className="uploaded-file">
                    <span>🎥 {formData.Videos}</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('Videos', '')}
                      className="remove-file"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              )}
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