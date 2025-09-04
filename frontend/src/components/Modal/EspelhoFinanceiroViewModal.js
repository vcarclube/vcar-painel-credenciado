import React from 'react';
import Modal from './index';
import { Button } from '../index';
import { FiDollarSign, FiCalendar, FiUser, FiTruck, FiFileText } from 'react-icons/fi';

const EspelhoFinanceiroViewModal = ({ isOpen, onClose, transacao }) => {
  if (!transacao) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONCLUÍDO':
        return 'status-concluido';
      case 'PENDENTE':
        return 'status-pendente';
      default:
        return 'status-default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes Financeiros"
      size="large"
    >
      <div className="espelho-view-modal-content">
        <div className="espelho-view-info">
          <div className="info-header">
            <h4 className="info-title">Informações da Transação</h4>
            <span className={`status-badge ${getStatusClass(transacao.statusPagamento)}`}>
              {transacao.statusPagamento}
            </span>
          </div>
          
          <div className="info-details">
            <div className="detail-section">
              <h5 className="section-title">
                <FiUser className="section-icon" />
                Dados do Credenciado
              </h5>
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Matrícula:</label>
                  <span className="detail-value">{transacao.matricula}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Razão Social:</label>
                  <span className="detail-value">{transacao.razaoSocial}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">CNPJ:</label>
                  <span className="detail-value">{transacao.cnpj}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h5 className="section-title">
                <FiTruck className="section-icon" />
                Dados do Veículo
              </h5>
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Placa:</label>
                  <span className="detail-value">{transacao.placa}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h5 className="section-title">
                <FiFileText className="section-icon" />
                Dados do Serviço
              </h5>
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Número OS:</label>
                  <span className="detail-value">{transacao.numeroOS}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Serviço:</label>
                  <span className="detail-value">{transacao.servico}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h5 className="section-title">
                <FiCalendar className="section-icon" />
                Datas
              </h5>
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Data Agendamento:</label>
                  <span className="detail-value">{transacao.dataAgendamento}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Data Execução:</label>
                  <span className="detail-value">{transacao.dataExecucao}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h5 className="section-title">
                <FiDollarSign className="section-icon" />
                Informações Financeiras
              </h5>
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Valor Repasse:</label>
                  <span className="detail-value highlight">{transacao.valorRepasse}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Código Espelho:</label>
                  <span className="detail-value">{transacao.codigoEspelho}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Tipo Comissão:</label>
                  <span className="detail-value">{transacao.tipoComissao}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item full-width">
                  <label className="detail-label">Descrição:</label>
                  <span className="detail-value">{transacao.descricao}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>

      <style jsx>{`
        .espelho-view-modal-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .espelho-view-info {
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 0px;
        }

        .info-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-concluido {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-pendente {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .status-default {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .info-details {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .section-icon {
          font-size: 18px;
          color: var(--primary);
        }

        .detail-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
          background: #f8fafc;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .detail-value.highlight {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #059669;
          font-weight: 600;
          border-color: #a7f3d0;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .detail-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .espelho-view-info {
     
          }

          .detail-section {
            padding: 16px;
          }

          .info-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .info-title {
            font-size: 16px;
          }

          .section-title {
            font-size: 14px;
          }

          .modal-actions {
            justify-content: stretch;
          }
        }
      `}</style>
    </Modal>
  );
};

export default EspelhoFinanceiroViewModal;