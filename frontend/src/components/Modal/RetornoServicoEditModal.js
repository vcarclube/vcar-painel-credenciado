import React, { useState, useEffect, useContext } from 'react';
import Modal from './index';
import { Button, Input, SearchableSelect } from '../index';
import { FiSave, FiX, FiCamera, FiVideo } from 'react-icons/fi';
import { MainContext } from '../../helpers/MainContext';
import { toast } from 'react-toastify';
import Api from '../../Api';
import mediaBunnyCompression from '../../utils/MediaBunnyCompression';

const RetornoServicoEditModal = ({ isOpen, onClose, onSuccess, retorno }) => {
  const { user } = useContext(MainContext);
  const [formData, setFormData] = useState({
    IdRetornoServico: '',
    IdSocioVeiculoAgenda: '',
    Tipo: '',
    Status: '',
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

  // Carregar dados do retorno quando o modal abrir
  useEffect(() => {
    if (isOpen && retorno) {
      setFormData({
        IdRetornoServico: retorno.IdRetornoServico || '',
        IdSocioVeiculoAgenda: retorno.IdSocioVeiculoAgenda || '',
        Tipo: retorno.Tipo || '',
        Status: retorno.Status || '',
        Descricao: retorno.Descricao || '',
        Fotos: retorno.Fotos || '',
        Videos: retorno.Videos || ''
      });
      setErrors({});
      loadAgendamentos();
    }
  }, [isOpen, retorno]);

  const loadAgendamentos = async () => {
    setLoadingAgendamentos(true);
    try {
      const response = await Api.getAgendamentosDisponiveis({idPontoAtendimento: user.IdPontoAtendimento});
      if (response?.data?.success) {
        const agendamentosFormatados = response.data.data.map(agendamento => ({
          value: agendamento.IdSocioVeiculoAgenda,
          label: `OS ${agendamento.NumeroOS} - ${agendamento.SocioNome} - ${agendamento.Placa} - ${agendamento.NomeServico.toUpperCase()}`
        }));
        // Adicionar o agendamento atual se não estiver na lista (caso já tenha retorno)
        if (retorno?.IdSocioVeiculoAgenda) {
          const agendamentoAtual = agendamentosFormatados.find(a => a.value === retorno.IdSocioVeiculoAgenda);
          if (!agendamentoAtual) {
            agendamentosFormatados.unshift({
              value: retorno.IdSocioVeiculoAgenda,
              label: `Agendamento ${retorno.IdSocioVeiculoAgenda} (Atual)`
            });
          }
        }
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
        let fileToUpload = file;
        
        // Verificar se precisa de compressão
        if (mediaBunnyCompression.needsCompression(file)) {
          try {
            const mediaType = file.type.startsWith('video/') ? 'vídeo' : 'imagem';
            toast.info(`Comprimindo ${mediaType}, aguarde...`);
            
            fileToUpload = await mediaBunnyCompression.compressFile(file, (progress) => {
              console.log(`Progresso da compressão: ${progress}%`);
            });
            
            toast.success(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} comprimido com sucesso!`);
          } catch (error) {
            console.error('Erro na compressão, usando arquivo original:', error);
            toast.warning('Erro na compressão, usando arquivo original');
            fileToUpload = file;
          }
        }
        
        const formData = new FormData();
        formData.append('file', fileToUpload);
        
        const uploadResponse = await Api.upload(formData);
        
        if (uploadResponse.success) {
          uploadedFiles.push(uploadResponse.file);
        }
      }
      
      if (uploadedFiles.length > 0) {
        const existingFiles = formData[type] ? formData[type].split(',').filter(f => f.trim()) : [];
        const allFiles = [...existingFiles, ...uploadedFiles];
        
        setFormData(prev => ({
          ...prev,
          [type]: allFiles.join(',')
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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await Api.updateRetornoServico({ 
        idRetornoServico: retorno.IdRetornoServico,
        data: formData 
      });
      
      if (response?.data?.success) {
        toast.success('Retorno de serviço atualizado com sucesso!');
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Erro ao atualizar retorno de serviço');
      }
    } catch (error) {
      console.error('Erro ao salvar retorno:', error);
      toast.error('Erro ao atualizar retorno de serviço');
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
          {/* Agendamento */}
          <div className="retorno-edit-row">
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Agendamento</label>
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
          <div className="retorno-edit-row">
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Tipo do Retorno</label>
              <SearchableSelect
                options={tipoRetornoOptions}
                value={formData.Tipo}
                onChange={(option) => handleInputChange('Tipo', option?.value || '')}
                placeholder="SELECIONE..."
                error={errors.Tipo}
              />
            </div>
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Status</label>
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
          <div className="retorno-edit-row">
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Descrição</label>
              <textarea
                className="retorno-edit-textarea"
                value={formData.Descricao}
                onChange={(e) => handleInputChange('Descricao', e.target.value)}
                placeholder="Descreva o retorno..."
                rows={4}
              />
              {errors.Descricao && (
                <span className="retorno-edit-error">{errors.Descricao}</span>
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
                  onChange={(e) => handleFileUpload(e, 'Fotos')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fotos-upload-edit" className="upload-button">
                  <FiCamera className="upload-icon" />
                  <span>Clique ou arraste fotos aqui</span>
                  <small>JPG, PNG, GIF (máx. 5MB cada)</small>
                </label>
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

            {/* Vídeos */}
            <div className="retorno-edit-field">
              <label className="retorno-edit-label">Vídeos</label>
              <div className="upload-area">
                <input
                  type="file"
                  id="videos-upload-edit"
                  multiple
                  accept="video/mp4,video/avi,video/mov"
                  onChange={(e) => handleFileUpload(e, 'Videos')}
                  style={{ display: 'none' }}
                />
                <label htmlFor="videos-upload-edit" className="upload-button">
                  <FiVideo className="upload-icon" />
                  <span>Clique ou arraste vídeos aqui</span>
                  <small>MP4, AVI, MOV (máx. 50MB cada)</small>
                </label>
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