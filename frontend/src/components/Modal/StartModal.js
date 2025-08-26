import React, { useState } from 'react';
import Modal from './index';
import { Button } from '../index';

const StartModal = ({ isOpen, onClose, onConfirm, agendamento }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(agendamento?.id);
      handleClose();
    } catch (error) {
      console.error('Erro ao iniciar OS:', error);
      alert('Erro ao iniciar a Ordem de Serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Iniciar Ordem de Serviço"
      size="small"
    >
      <div className="start-modal-content">
        <div className="start-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
            <path d="m9 12 2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="start-info">
          <h4 className="start-title">Deseja iniciar a OS?</h4>
          <p className="start-description">
            Você está prestes a iniciar a Ordem de Serviço para o agendamento:
          </p>
          
          <div className="agendamento-details">
            <p><strong>Agendamento:</strong> #{agendamento?.numero}</p>
            <p><strong>Cliente:</strong> {agendamento?.solicitante}</p>
            <p><strong>Serviço:</strong> {agendamento?.servico}</p>
            <p><strong>Data/Hora:</strong> {agendamento?.data} às {agendamento?.hora}</p>
          </div>

          <p className="start-warning">
            Após iniciar, o status do agendamento será alterado para "EM ANDAMENTO".
          </p>
        </div>

        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={loading}
          >
            Sim, Iniciar OS
          </Button>
        </div>
      </div>

      <style jsx>{`
        .start-modal-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          text-align: center;
        }

        .start-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background-color: #ecfdf5;
          border-radius: 50%;
        }

        .start-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .start-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .start-description {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .agendamento-details {
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          text-align: left;
        }

        .agendamento-details p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .agendamento-details p:last-child {
          margin-bottom: 0;
        }

        .start-warning {
          margin: 0;
          font-size: 13px;
          color: #f59e0b;
          font-weight: 500;
          background-color: #fffbeb;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #fed7aa;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 480px) {
          .modal-actions {
            flex-direction: column-reverse;
          }
          
          .start-icon {
            width: 60px;
            height: 60px;
          }
          
          .start-icon svg {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default StartModal;