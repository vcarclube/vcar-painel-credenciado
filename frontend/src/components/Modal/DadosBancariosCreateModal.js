import React, { useState, useEffect } from 'react';
import Modal from './index';
import { Button } from '../index';

const DadosBancariosCreateModal = ({ isOpen, onClose, onSave, dado = null }) => {
  const [formData, setFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: 'CORRENTE',
    pix: '',
    status: 'ATIVO'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dado && isOpen) {
      setFormData({
        banco: dado.banco || '',
        agencia: dado.agencia || '',
        conta: dado.conta || '',
        tipoConta: dado.tipoConta || 'CORRENTE',
        pix: dado.pix || '',
        status: dado.status || 'ATIVO'
      });
    } else if (!dado && isOpen) {
      setFormData({
        banco: '',
        agencia: '',
        conta: '',
        tipoConta: 'CORRENTE',
        pix: '',
        status: 'ATIVO'
      });
    }
    setErrors({});
    setLoading(false);
  }, [dado, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.banco.trim()) {
      newErrors.banco = 'Nome do banco é obrigatório';
    }

    if (!formData.agencia.trim()) {
      newErrors.agencia = 'Agência é obrigatória';
    }

    if (!formData.conta.trim()) {
      newErrors.conta = 'Conta é obrigatória';
    }

    if (!formData.tipoConta) {
      newErrors.tipoConta = 'Tipo de conta é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dadoToSave = {
        ...formData,
        id: dado?.id || Date.now(),
        dataCadastro: dado?.dataCadastro || new Date().toLocaleDateString('pt-BR')
      };
      
      await onSave(dadoToSave);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error);
      alert('Erro ao salvar dados bancários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        banco: '',
        agencia: '',
        conta: '',
        tipoConta: 'CORRENTE',
        pix: '',
        status: 'ATIVO'
      });
      setErrors({});
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={dado ? 'Editar Dados Bancários' : 'Novo Dado Bancário'}
      size="medium"
    >
      <div className="create-modal-content">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-section">
            <h4 className="section-title">Informações Bancárias</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Banco *</label>
                <input
                  type="text"
                  value={formData.banco}
                  onChange={(e) => handleInputChange('banco', e.target.value)}
                  className={`form-input ${errors.banco ? 'error' : ''}`}
                  placeholder="Ex: Banco do Brasil"
                  disabled={loading}
                />
                {errors.banco && <span className="form-error">{errors.banco}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Agência *</label>
                <input
                  type="text"
                  value={formData.agencia}
                  onChange={(e) => handleInputChange('agencia', e.target.value)}
                  className={`form-input ${errors.agencia ? 'error' : ''}`}
                  placeholder="Ex: 1234-5"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Conta *</label>
                <input
                  type="text"
                  value={formData.conta}
                  onChange={(e) => handleInputChange('conta', e.target.value)}
                  className={`form-input ${errors.conta ? 'error' : ''}`}
                  placeholder="Ex: 12345-6"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Conta *</label>
                <select
                  value={formData.tipoConta}
                  onChange={(e) => handleInputChange('tipoConta', e.target.value)}
                  className={`form-select ${errors.tipoConta ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="CORRENTE">Conta Corrente</option>
                  <option value="POUPANÇA">Conta Poupança</option>
                </select>
                {errors.tipoConta && <span className="form-error">{errors.tipoConta}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Chave PIX (opcional)</label>
                <input
                  type="text"
                  value={formData.pix}
                  onChange={(e) => handleInputChange('pix', e.target.value)}
                  className="form-input"
                  placeholder="Ex: email@exemplo.com, CPF, telefone..."
                  disabled={loading}
                />
              </div>
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
              type="submit"
              loading={loading}
            >
              {dado ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-modal-content {
          padding: 0;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .form-section {
          padding: 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .section-title {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 600;
          color: #495057;
        }

        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-row:last-child {
          margin-bottom: 0;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          flex: 1;
        }

        .form-label {
          font-weight: 500;
          color: #495057;
          font-size: 14px;
        }

        .form-input,
        .form-select {
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          background: white;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .form-input.error,
        .form-select.error {
          border-color: #dc3545;
        }

        .form-input:disabled,
        .form-select:disabled {
          background-color: #f8f9fa;
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-error {
          color: #dc3545;
          font-size: 12px;
          margin-top: 2px;
        }

        .modal-actions {
          padding: 20px 24px;
          background: #f8f9fa;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e9ecef;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 16px;
          }

          .form-section {
            padding: 20px;
          }

          .modal-actions {
            padding: 16px 20px;
            flex-direction: column;
          }
        }
      `}</style>
    </Modal>
  );
};

export default DadosBancariosCreateModal;