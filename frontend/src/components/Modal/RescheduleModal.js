import React, { useState } from 'react';
import Modal from './index';
import { Button } from '../index';

const RescheduleModal = ({ isOpen, onClose, onConfirm, agendamento }) => {
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!novaData || !novaHora || !motivo.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar se a nova data/hora não é no passado
    const agora = new Date();
    const novaDataHora = new Date(`${novaData}T${novaHora}`);
    
    if (novaDataHora <= agora) {
      alert('A nova data e hora deve ser futura.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(agendamento?.id, {
        data: novaData,
        hora: novaHora,
        motivo: motivo.trim()
      });
      handleClose();
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      alert('Erro ao reagendar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNovaData('');
    setNovaHora('');
    setMotivo('');
    setLoading(false);
    onClose();
  };

  // Função para obter data mínima (hoje)
  const getMinDate = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  // Função para obter hora mínima (se for hoje)
  const getMinTime = () => {
    if (novaData === getMinDate()) {
      const agora = new Date();
      const horas = String(agora.getHours()).padStart(2, '0');
      const minutos = String(agora.getMinutes()).padStart(2, '0');
      return `${horas}:${minutos}`;
    }
    return '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reagendar Agendamento"
      size="medium"
    >
      <div className="reschedule-modal-content">
        <div className="reschedule-info">
          <p><strong>Agendamento:</strong> #{agendamento?.numero}</p>
          <p><strong>Cliente:</strong> {agendamento?.cliente}</p>
          <p><strong>Data/Hora Atual:</strong> {agendamento?.data} às {agendamento?.hora}</p>
        </div>

        <div className="reschedule-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nova-data" className="form-label">
                Nova Data *
              </label>
              <input
                type="date"
                id="nova-data"
                className="form-input"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                min={getMinDate()}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="nova-hora" className="form-label">
                Nova Hora *
              </label>
              <input
                type="time"
                id="nova-hora"
                className="form-input"
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
                min={getMinTime()}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="motivo-reagendamento" className="form-label">
              Motivo do Reagendamento *
            </label>
            <textarea
              id="motivo-reagendamento"
              className="form-textarea"
              placeholder="Descreva o motivo do reagendamento..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
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
            Confirmar Reagendamento
          </Button>
        </div>
      </div>

      <style jsx>{`
        .reschedule-modal-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .reschedule-info {
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }

        .reschedule-info p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .reschedule-info p:last-child {
          margin-bottom: 0;
        }

        .reschedule-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled {
          background-color: #f9fafb;
          color: #6b7280;
        }

        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
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

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
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

export default RescheduleModal;