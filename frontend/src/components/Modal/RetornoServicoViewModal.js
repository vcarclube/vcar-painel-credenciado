import React from 'react';
import Modal from './index';
import { Button } from '../index';
import { FiUser, FiTruck, FiFileText, FiCalendar, FiClock } from 'react-icons/fi';

const RetornoServicoViewModal = ({ isOpen, onClose, retorno }) => {
  if (!retorno) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente': return '#f59e0b';
      case 'Em Andamento': return '#3b82f6';
      case 'Concluído': return '#10b981';
      case 'Cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Garantia': return '#10b981';
      case 'Retrabalho': return '#f59e0b';
      case 'Manutenção': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Retorno de Serviço"
      size="large"
    >
      <div className="retorno-view-content">
        {/* Informações principais */}
        <div className="retorno-view-header">
          <div className="retorno-view-os">
            <FiFileText className="retorno-view-icon" />
            <div>
              <span className="retorno-view-label">OS</span>
              <span className="retorno-view-value">{retorno.os}</span>
            </div>
          </div>
          
          <div className="retorno-view-status">
            <span 
              className="retorno-view-status-badge"
              style={{ backgroundColor: getStatusColor(retorno.status) }}
            >
              {retorno.status}
            </span>
            <span 
              className="retorno-view-tipo-badge"
              style={{ backgroundColor: getTipoColor(retorno.tipo) }}
            >
              {retorno.tipo}
            </span>
          </div>
        </div>

        {/* Informações do cliente e veículo */}
        <div className="retorno-view-section">
          <h4 className="retorno-view-section-title">
            <FiUser className="retorno-view-section-icon" />
            Cliente e Veículo
          </h4>
          <div className="retorno-view-grid">
            <div className="retorno-view-field">
              <span className="retorno-view-field-label">Placa:</span>
              <span className="retorno-view-field-value">{retorno.placa}</span>
            </div>
            <div className="retorno-view-field">
              <span className="retorno-view-field-label">Parceiro:</span>
              <span className="retorno-view-field-value">{retorno.parceiro}</span>
            </div>
          </div>
        </div>

        {/* Informações do serviço */}
        <div className="retorno-view-section">
          <h4 className="retorno-view-section-title">
            <FiTruck className="retorno-view-section-icon" />
            Serviço
          </h4>
          <div className="retorno-view-field">
            <span className="retorno-view-field-label">Descrição:</span>
            <span className="retorno-view-field-value">{retorno.servico}</span>
          </div>
        </div>

        {/* Data e hora */}
        <div className="retorno-view-section">
          <h4 className="retorno-view-section-title">
            <FiCalendar className="retorno-view-section-icon" />
            Data e Hora
          </h4>
          <div className="retorno-view-grid">
            <div className="retorno-view-field">
              <span className="retorno-view-field-label">Data:</span>
              <span className="retorno-view-field-value">{formatDate(retorno.data)}</span>
            </div>
            <div className="retorno-view-field">
              <span className="retorno-view-field-label">Hora:</span>
              <span className="retorno-view-field-value">{formatTime(retorno.data)}</span>
            </div>
          </div>
        </div>

        {/* Observações (se houver) */}
        {retorno.observacoes && (
          <div className="retorno-view-section">
            <h4 className="retorno-view-section-title">
              <FiFileText className="retorno-view-section-icon" />
              Observações
            </h4>
            <div className="retorno-view-observacoes">
              {retorno.observacoes}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="retorno-view-actions">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>

      <style jsx>{`
        .retorno-view-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .retorno-view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .retorno-view-os {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .retorno-view-icon {
          font-size: 24px;
          color: #3b82f6;
        }

        .retorno-view-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .retorno-view-value {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-top: 2px;
        }

        .retorno-view-status {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .retorno-view-status-badge,
        .retorno-view-tipo-badge {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .retorno-view-section {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .retorno-view-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          padding: 16px 20px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .retorno-view-section-icon {
          font-size: 16px;
          color: #64748b;
        }

        .retorno-view-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px;
        }

        .retorno-view-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .retorno-view-field:only-child {
          grid-column: 1 / -1;
        }

        .retorno-view-field-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .retorno-view-field-value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
        }

        .retorno-view-observacoes {
          padding: 20px;
          background: #fefefe;
          color: #374151;
          line-height: 1.6;
          font-size: 14px;
        }

        .retorno-view-actions {
          display: flex;
          justify-content: center;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .retorno-view-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .retorno-view-status {
            justify-content: center;
          }

          .retorno-view-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }

          .retorno-view-section-title {
            padding: 12px 16px;
            font-size: 13px;
          }

          .retorno-view-observacoes {
            padding: 16px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default RetornoServicoViewModal;