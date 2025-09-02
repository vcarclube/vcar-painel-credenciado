import React from 'react';
import Modal from './index';
import { Button } from '../index';

const DadosBancariosViewModal = ({ isOpen, onClose, dado }) => {
  if (!dado) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Dados Bancários"
      size="medium"
    >
      <div className="view-modal-content">
        {/* Seção PIX - só mostra se tiver dados PIX */}
        {dado.ChavePix && (
          <div className="view-info">
            <div className="info-header">
              <h4 className="info-title">PIX</h4>
              <span className="info-subtitle">Dados para recebimento via PIX</span>
            </div>
            
            <div className="info-details">
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Tipo de Chave PIX</label>
                  <span className="detail-value">{dado.TipoChavePix || 'CPF'}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Chave PIX</label>
                  <span className="detail-value">{dado.ChavePix}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Seção Dados Bancários - só mostra se tiver dados bancários */}
        {dado.Banco && (
          <div className="view-info">
            <div className="info-header">
              <h4 className="info-title">Dados Bancários</h4>
              <span className="info-subtitle">Dados para recebimento via transferência</span>
            </div>
            
            <div className="info-details">
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Banco</label>
                  <span className="detail-value">{dado.Banco}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Agência</label>
                  <span className="detail-value">{dado.NumeroAgencia}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item">
                  <label className="detail-label">Conta</label>
                  <span className="detail-value">{dado.NumeroConta}</span>
                </div>
                
                <div className="detail-item">
                  <label className="detail-label">Tipo de Conta</label>
                  <span className="detail-value">{dado.TipoConta === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="view-info">
          <div className="info-header">
            <h4 className="info-title">Dados do Titular</h4>
          </div>
          
          <div className="info-details">
            <div className="detail-row">
              <div className="detail-item">
                <label className="detail-label">Nome do Titular</label>
                <span className="detail-value">{dado.NomeTitular}</span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">CPF/CNPJ do Titular</label>
                <span className="detail-value">{dado.DocumentoTitular}</span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-item">
                <label className="detail-label">Selecionado</label>
                <span className={`detail-value status-badge ${dado.Selecionado === 'S' ? 'selecionado' : 'nao-selecionado'}`}>
                  {dado.Selecionado === 'S' ? 'SIM' : 'NÃO'}
                </span>
              </div>
              
              <div className="detail-item">
                <label className="detail-label">Ponto de Atendimento</label>
                <span className="detail-value">V-CAR</span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-item">
                <label className="detail-label">Data de Cadastro</label>
                <span className="detail-value">{new Date(dado.DataCadastro).toLocaleDateString('pt-BR')}</span>
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
        .view-modal-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .view-info {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-ativo {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-inativo {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .info-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
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
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          text-align: center;
        }

        .status-badge.selecionado {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .status-badge.nao-selecionado {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .detail-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .view-info {
            padding: 20px;
          }

          .info-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .info-title {
            font-size: 16px;
          }

          .modal-actions {
            justify-content: stretch;
          }
        }
      `}</style>
    </Modal>
  );
};

export default DadosBancariosViewModal;