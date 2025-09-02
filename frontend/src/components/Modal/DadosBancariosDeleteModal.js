import React from 'react';
import Modal from './index';
import { Button } from '../index';

const DadosBancariosDeleteModal = ({ isOpen, onClose, onConfirm, dado, loading = false }) => {
  if (!dado) return null;

  const handleConfirm = () => {
    onConfirm(dado.IdDadoBancario || dado.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão"
      size="small"
    >
      <div className="delete-modal-content">
        <div className="delete-confirmation">
          
          <div className="confirmation-text">
            <p className="confirmation-message">
              Tem certeza que deseja excluir esta conta bancária?
            </p>
            
            <div className="account-details">
              <div className="detail-item">
                <strong>Titular:</strong> {dado.NomeTitular}
              </div>
              
              {dado.ChavePix && (
                <>
                  <div className="detail-item">
                    <strong>Chave PIX:</strong> {dado.ChavePix}
                  </div>
                  <div className="detail-item">
                    <strong>Tipo:</strong> {dado.TipoChavePix}
                  </div>
                </>
              )}
              
              {dado.Banco && (
                <>
                  <div className="detail-item">
                    <strong>Banco:</strong> {dado.Banco}
                  </div>
                  <div className="detail-item">
                    <strong>Agência:</strong> {dado.NumeroAgencia}
                  </div>
                  <div className="detail-item">
                    <strong>Conta:</strong> {dado.NumeroConta}
                  </div>
                </>
              )}
            </div>
            
          </div>
        </div>
        
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={loading}
          >
            Excluir
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        .delete-modal-content {
          padding: 0;
        }
        
        .delete-confirmation {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        
        .warning-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .confirmation-text {
          flex: 1;
        }
        
        .confirmation-message {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 500;
          color: #495057;
        }
        
        .account-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          border-left: 4px solid #dc3545;
        }
        
        .detail-item {
          margin-bottom: 8px;
          font-size: 14px;
          color: #495057;
        }
        
        .detail-item:last-child {
          margin-bottom: 0;
        }
        
        .warning-text {
          margin: 16px 0 0 0;
          font-size: 14px;
          color: #6c757d;
          font-style: italic;
        }
        
      `}</style>
    </Modal>
  );
};

export default DadosBancariosDeleteModal;