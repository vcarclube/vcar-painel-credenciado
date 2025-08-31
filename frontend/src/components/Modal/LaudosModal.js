import React, { useState } from 'react';
import Modal from './index';
import { Button } from '../index';
import { FiFileText, FiTrash2, FiUpload, FiDownload } from 'react-icons/fi';
import Api from '../../Api';
import { toast } from 'react-toastify';

const LaudosModal = ({ isOpen, onClose, laudos, onRemoveLaudo, onAddLaudo }) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleRemove = async (laudoId) => {
    if (window.confirm('Tem certeza que deseja excluir este laudo?')) {
      setLoading(true);
      try {
        await onRemoveLaudo(laudoId);
      } catch (error) {
        console.error('Erro ao remover laudo:', error);
        toast.error('Erro ao remover laudo');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Fazer upload do arquivo
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await Api.upload(formData);
      
      if (uploadResponse.success) {
        // Adicionar o laudo com dados básicos do arquivo
        const laudoData = {
          nome: file.name,
          arquivo: uploadResponse.file,
          nomeArquivo: uploadResponse.file,
          notaFiscal: uploadResponse.file,
          tamanho: file.size,
          data: new Date().toISOString(),
          dataUpload: new Date().toLocaleDateString('pt-BR')
        };
        
        await onAddLaudo(laudoData);
        toast.success('Laudo adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do laudo');
    } finally {
      setLoading(false);
      // Limpar o input
      e.target.value = '';
    }
  };

  const handleDownload = (laudo) => {
    // Simular download do laudo
    const link = document.createElement('a');
    link.href = laudo.url;
    link.download = laudo.nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Laudos da OS"
      size="large"
    >
      <div className="laudos-modal-content">
        {laudos.length === 0 ? (
          <div className="laudos-empty-state">
            <FiFileText className="laudos-empty-icon" />
            <h4>Nenhum laudo adicionado</h4>
            <p>Os laudos adicionados à esta OS aparecerão aqui.</p>
            <div className="upload-input-container">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                disabled={loading}
                id="laudo-upload"
                style={{ display: 'none' }}
              />
              <Button
                variant="primary"
                onClick={() => document.getElementById('laudo-upload').click()}
                disabled={loading}
              >
                <FiUpload size={16} />
                {loading ? 'Enviando...' : 'Adicionar Primeiro Laudo'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="laudos-header">
              <div className="laudos-count">
                <span>{laudos.length} laudo{laudos.length !== 1 ? 's' : ''} encontrado{laudos.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="upload-input-container">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={loading}
                  id="laudo-upload-list"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="primary"
                  onClick={() => document.getElementById('laudo-upload-list').click()}
                  disabled={loading}
                >
                  <FiUpload size={16} />
                  {loading ? 'Enviando...' : 'Adicionar Laudo'}
                </Button>
              </div>
            </div>
            
            <div className="laudos-list">
              {laudos.map(laudo => (
                <div key={laudo.IdSocioVeiculoAgendaLaudo} className="laudo-item">
                  <div className="laudo-icon">
                    <FiFileText size={24} />
                  </div>
                  
                  <div className="laudo-info">
                    <h4 className="laudo-name">{laudo.NomeArquivo}</h4>
                    <div className="laudo-details">
                      <span className="laudo-size">{formatFileSize(laudo?.tamanho)}</span>
                      <span className="laudo-date">Adicionado em {new Date(laudo.DataLog).toLocaleDateString()}</span>
                    </div>
                    {laudo.descricao && (
                      <p className="laudo-description">{laudo?.descricao}</p>
                    )}
                  </div>
                  
                  <div className="laudo-actions">
                    <button
                      className="laudo-action-btn laudo-download-btn"
                      onClick={() => handleDownload(laudo)}
                      title="Baixar laudo"
                    >
                      <FiDownload size={16} />
                    </button>
                    <button
                      className="laudo-action-btn laudo-remove-btn"
                      onClick={() => handleRemove(laudo.IdSocioVeiculoAgendaLaudo )}
                      disabled={loading}
                      title="Excluir laudo"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="modal-actions">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Fechar
        </Button>
      </div>

      <style jsx>{`
        .laudos-modal-content {
          min-height: 300px;
        }

        .laudos-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .laudos-empty-icon {
          width: 64px;
          height: 64px;
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .laudos-empty-state h4 {
          font-size: 20px;
          font-weight: 600;
          color: #334155;
          margin: 0 0 8px 0;
        }

        .laudos-empty-state p {
          font-size: 16px;
          color: #64748b;
          margin: 0 0 32px 0;
        }

        .laudos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .laudos-count span {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .laudos-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .laudo-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .laudo-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .laudo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #e0f2fe;
          border-radius: 8px;
          color: #0369a1;
          flex-shrink: 0;
        }

        .laudo-info {
          flex: 1;
          min-width: 0;
        }

        .laudo-name {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
          word-break: break-word;
        }

        .laudo-details {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
        }

        .laudo-size,
        .laudo-date {
          font-size: 14px;
          color: #64748b;
        }

        .laudo-description {
          font-size: 14px;
          color: #475569;
          margin: 8px 0 0 0;
          line-height: 1.5;
        }

        .laudo-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .laudo-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .laudo-download-btn {
          background: #e0f2fe;
          color: #0369a1;
        }

        .laudo-download-btn:hover {
          background: #bae6fd;
        }

        .laudo-remove-btn {
          background: #fef2f2;
          color: #dc2626;
        }

        .laudo-remove-btn:hover {
          background: #fee2e2;
        }

        .laudo-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .laudos-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .laudo-item {
            flex-direction: column;
            gap: 12px;
          }

          .laudo-details {
            flex-direction: column;
            gap: 4px;
          }

          .laudo-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </Modal>
  );
};

export default LaudosModal;