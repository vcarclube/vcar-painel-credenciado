import React, { useState } from 'react';
import Modal from './index';
import { Button } from '../index';
import { FiDollarSign, FiTrash2, FiUpload, FiDownload } from 'react-icons/fi';

const RecibosModal = ({ isOpen, onClose, recibos, onRemoveRecibo }) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleRemove = async (reciboId) => {
    if (window.confirm('Tem certeza que deseja excluir este recibo?')) {
      setLoading(true);
      try {
        await onRemoveRecibo(reciboId);
      } catch (error) {
        console.error('Erro ao remover recibo:', error);
        alert('Erro ao remover recibo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = (recibo) => {
    // Simular download do recibo
    const link = document.createElement('a');
    link.href = recibo.url;
    link.download = recibo.nome;
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recibos da OS"
      size="large"
    >
      <div className="recibos-modal-content">
        {recibos.length === 0 ? (
          <div className="recibos-empty-state">
            <FiDollarSign className="recibos-empty-icon" />
            <h4>Nenhum recibo adicionado</h4>
            <p>Os recibos adicionados à esta OS aparecerão aqui.</p>
            <Button
              variant="primary"
              onClick={() => {
                // Aqui seria implementada a funcionalidade de upload
                console.log('Implementar upload de recibo');
              }}
            >
              <FiUpload size={16} />
              Adicionar Primeiro Recibo
            </Button>
          </div>
        ) : (
          <>
            <div className="recibos-header">
              <div className="recibos-count">
                <span>{recibos.length} recibo{recibos.length !== 1 ? 's' : ''} encontrado{recibos.length !== 1 ? 's' : ''}</span>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  // Aqui seria implementada a funcionalidade de upload
                  console.log('Implementar upload de recibo');
                }}
              >
                <FiUpload size={16} />
                Adicionar Recibo
              </Button>
            </div>
            
            <div className="recibos-list">
              {recibos.map(recibo => (
                <div key={recibo.id} className="recibo-item">
                  <div className="recibo-icon">
                    <FiDollarSign size={24} />
                  </div>
                  
                  <div className="recibo-info">
                    <h4 className="recibo-name">{recibo.nome}</h4>
                    <div className="recibo-details">
                      <span className="recibo-size">{formatFileSize(recibo.tamanho)}</span>
                      <span className="recibo-date">Adicionado em {recibo.dataUpload}</span>
                      {recibo.valor && (
                        <span className="recibo-value">{formatCurrency(recibo.valor)}</span>
                      )}
                    </div>
                    {recibo.descricao && (
                      <p className="recibo-description">{recibo.descricao}</p>
                    )}
                  </div>
                  
                  <div className="recibo-actions">
                    <button
                      className="recibo-action-btn recibo-download-btn"
                      onClick={() => handleDownload(recibo)}
                      title="Baixar recibo"
                    >
                      <FiDownload size={16} />
                    </button>
                    <button
                      className="recibo-action-btn recibo-remove-btn"
                      onClick={() => handleRemove(recibo.id)}
                      disabled={loading}
                      title="Excluir recibo"
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
        .recibos-modal-content {
          min-height: 300px;
        }

        .recibos-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .recibos-empty-icon {
          width: 64px;
          height: 64px;
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .recibos-empty-state h4 {
          font-size: 20px;
          font-weight: 600;
          color: #334155;
          margin: 0 0 8px 0;
        }

        .recibos-empty-state p {
          font-size: 16px;
          color: #64748b;
          margin: 0 0 32px 0;
        }

        .recibos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .recibos-count span {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .recibos-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .recibo-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .recibo-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .recibo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #ecfdf5;
          border-radius: 8px;
          color: #059669;
          flex-shrink: 0;
        }

        .recibo-info {
          flex: 1;
          min-width: 0;
        }

        .recibo-name {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
          word-break: break-word;
        }

        .recibo-details {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .recibo-size,
        .recibo-date {
          font-size: 14px;
          color: #64748b;
        }

        .recibo-value {
          font-size: 14px;
          color: #059669;
          font-weight: 600;
        }

        .recibo-description {
          font-size: 14px;
          color: #475569;
          margin: 8px 0 0 0;
          line-height: 1.5;
        }

        .recibo-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .recibo-action-btn {
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

        .recibo-download-btn {
          background: #e0f2fe;
          color: #0369a1;
        }

        .recibo-download-btn:hover {
          background: #bae6fd;
        }

        .recibo-remove-btn {
          background: #fef2f2;
          color: #dc2626;
        }

        .recibo-remove-btn:hover {
          background: #fee2e2;
        }

        .recibo-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .recibos-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .recibo-item {
            flex-direction: column;
            gap: 12px;
          }

          .recibo-details {
            flex-direction: column;
            gap: 4px;
          }

          .recibo-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </Modal>
  );
};

export default RecibosModal;