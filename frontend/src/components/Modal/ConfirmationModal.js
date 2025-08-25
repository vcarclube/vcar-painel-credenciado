import React from 'react';
import Modal from './index';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger', 'warning', 'primary'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: '#ef4444',
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          buttonColor: '#ef4444'
        };
      case 'warning':
        return {
          iconColor: '#f59e0b',
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b',
          buttonColor: '#f59e0b'
        };
      case 'primary':
      default:
        return {
          iconColor: '#3b82f6',
          backgroundColor: '#eff6ff',
          borderColor: '#3b82f6',
          buttonColor: '#3b82f6'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
    >
      <div className="confirmation-modal-content">
        <div className="confirmation-icon">
          <FiAlertTriangle size={48} />
        </div>
        
        <div className="confirmation-message">
          <p>{message}</p>
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            onClick={onClose}
            className="confirmation-button-cancel"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="confirmation-button-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirmation-modal-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          text-align: center;
          padding: 20px;
        }

        .confirmation-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background-color: ${styles.backgroundColor};
          border-radius: 50%;
          color: ${styles.iconColor};
        }

        .confirmation-message {
          max-width: 400px;
        }

        .confirmation-message p {
          margin: 0;
          font-size: 16px;
          color: #374151;
          line-height: 1.5;
        }

        .confirmation-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
        }

        .confirmation-button-cancel {
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 100px;
        }

        .confirmation-button-cancel:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .confirmation-button-confirm {
          padding: 10px 20px;
          border: none;
          background: ${styles.buttonColor};
          color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 100px;
        }

        .confirmation-button-confirm:hover {
          opacity: 0.9;
        }

        @media (max-width: 480px) {
          .confirmation-actions {
            flex-direction: column;
          }

          .confirmation-button-cancel,
          .confirmation-button-confirm {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ConfirmationModal;