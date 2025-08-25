import React, { useState } from 'react';
import Modal from './index';
import { Button } from '../index';

const CancelModal = ({ isOpen, onClose, onConfirm, agendamento }) => {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo do cancelamento.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(agendamento?.id, motivo.trim());
      handleClose();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancelar Agendamento"
      size="medium"
    >
      <div className="cancel-modal-content">
        <div className="cancel-info">
          <p><strong>Agendamento:</strong> #{agendamento?.numero}</p>
          <p><strong>Cliente:</strong> {agendamento?.cliente}</p>
          <p><strong>Data/Hora:</strong> {agendamento?.data} às {agendamento?.hora}</p>
        </div>

        <div className="cancel-form">
          <label htmlFor="motivo-cancelamento" className="form-label">
            Motivo do Cancelamento *
          </label>
          <textarea
            id="motivo-cancelamento"
            className="form-textarea"
            placeholder="Descreva o motivo do cancelamento..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
          >
            Confirmar Cancelamento
          </Button>
        </div>
      </div>

      <style jsx>{`
        .cancel-modal-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cancel-info {
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
        }

        .cancel-info p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .cancel-info p:last-child {
          margin-bottom: 0;
        }

        .cancel-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.2s;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea:disabled {
          background-color: #f9fafb;
          color: #6b7280;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 480px) {
          .modal-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </Modal>
  );
};

export default CancelModal;