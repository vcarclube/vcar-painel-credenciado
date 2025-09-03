import React, { useState, useEffect } from 'react';
import Modal from './index';
import { Button, Input } from '../index';
import Api from '../../Api';
import { toast } from 'react-toastify';
import { FiSave, FiX } from 'react-icons/fi';
import { useMask } from '@react-input/mask';
import './style.css';

const DadosBancariosCreateModal = ({ isOpen, onClose, onSave, dado = null }) => {
  const [formData, setFormData] = useState({
    tipoPagamento: 'PIX',
    TipoChavePix: 'CPF',
    ChavePix: '',
    Banco: '',
    NumeroAgencia: '',
    NumeroConta: '',
    TipoConta: 'CORRENTE',
    NomeTitular: '',
    DocumentoTitular: '',
    Selecionado: 'N'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Declarar todas as máscaras no topo para evitar erros de React Hooks
  const phonePixMask = useMask({
    mask: '(__) _____-____',
    replacement: { _: /\d/ }
  });
  
  const cpfPixMask = useMask({
    mask: '___.___.___-__',
    replacement: { _: /\d/ }
  });
  
  const cnpjPixMask = useMask({
    mask: '__.___.___/____-__',
    replacement: { _: /\d/ }
  });
  
  const cpfTitularMask = useMask({
    mask: '___.___.___-__',
    replacement: { _: /\d/ }
  });
  
  const cnpjTitularMask = useMask({
    mask: '__.___.___/____-__',
    replacement: { _: /\d/ }
  });
  
  const agenciaMask = useMask({
    mask: '____-_',
    replacement: { _: /\d/ }
  });
  
  const contaMask = useMask({
    mask: '_______-_',
    replacement: { _: /\d/ }
  });

  useEffect(() => {
    if (dado && isOpen) {
      setFormData({
        tipoPagamento: (dado.ChavePix && dado.TipoChavePix) ? 'PIX' : 'TRANSFERENCIA',
        TipoChavePix: dado.TipoChavePix || 'CPF',
        ChavePix: dado.ChavePix || '',
        Banco: dado.Banco || '',
        NumeroAgencia: dado.NumeroAgencia || '',
        NumeroConta: dado.NumeroConta || '',
        TipoConta: dado.TipoConta || 'CORRENTE',
        NomeTitular: dado.NomeTitular || '',
        DocumentoTitular: dado.DocumentoTitular || '',
        Selecionado: dado.Selecionado || 'N'
      });
    } else if (!dado && isOpen) {
      setFormData({
        tipoPagamento: 'PIX',
        TipoChavePix: 'CPF',
        ChavePix: '',
        Banco: '',
        NumeroAgencia: '',
        NumeroConta: '',
        TipoConta: 'CORRENTE',
        NomeTitular: '',
        DocumentoTitular: '',
        Selecionado: 'N'
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
  
  const handleInputChangeEvent = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validações para PIX
    if (formData.tipoPagamento === 'PIX') {
      if (!formData.TipoChavePix) {
        newErrors.TipoChavePix = 'Tipo de chave PIX é obrigatório';
      }
      
      if (!formData.ChavePix.trim()) {
        newErrors.ChavePix = 'Chave PIX é obrigatória';
      }
    }
    
    // Validações para TRANSFERENCIA
    if (formData.tipoPagamento === 'TRANSFERENCIA') {
      if (!formData.Banco.trim()) {
        newErrors.Banco = 'Nome do banco é obrigatório';
      }
      
      if (!formData.NumeroAgencia.trim()) {
        newErrors.NumeroAgencia = 'Número da agência é obrigatório';
      }
      
      if (!formData.NumeroConta.trim()) {
        newErrors.NumeroConta = 'Número da conta é obrigatório';
      }
      
      if (!formData.TipoConta) {
        newErrors.TipoConta = 'Tipo de conta é obrigatório';
      }
    }
    
    // Validações comuns
    if (!formData.NomeTitular.trim()) {
      newErrors.NomeTitular = 'Nome do titular é obrigatório';
    }
    
    if (!formData.DocumentoTitular.trim()) {
      newErrors.DocumentoTitular = 'CPF do titular é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const idPontoAtendimento = localStorage.getItem('idPontoAtendimento') || 'C75C6ADC-E2CA-4212-AD69-77A01610D25A';
      
      const dadoToSave = {
        TipoChavePix: formData.tipoPagamento === 'PIX' ? formData.TipoChavePix : '',
        ChavePix: formData.tipoPagamento === 'PIX' ? formData.ChavePix : '',
        Banco: formData.tipoPagamento === 'TRANSFERENCIA' ? formData.Banco : '',
        NumeroAgencia: formData.tipoPagamento === 'TRANSFERENCIA' ? formData.NumeroAgencia : '',
        NumeroConta: formData.tipoPagamento === 'TRANSFERENCIA' ? formData.NumeroConta : '',
        TipoConta: formData.tipoPagamento === 'TRANSFERENCIA' ? formData.TipoConta : '',
        NomeTitular: formData.NomeTitular,
        DocumentoTitular: formData.DocumentoTitular,
        Selecionado: formData.Selecionado,
        IdPontoAtendimento: idPontoAtendimento
      };
      
      if (dado) {
        dadoToSave.IdDadoBancario = dado.IdDadoBancario;
      }
      
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
        TipoChavePix: 'CPF',
        ChavePix: '',
        banco: '',
        agencia: '',
        conta: '',
        tipoConta: 'CORRENTE',
        NomeTitular: '',
        DocumentoTitular: '',
        Selecionado: 'N'
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
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Tipo de Pagamento *</label>
                <select
                  name="tipoPagamento"
                  value={formData.tipoPagamento}
                  onChange={handleInputChangeEvent}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="PIX">PIX</option>
                  <option value="TRANSFERENCIA">TRANSFERÊNCIA</option>
                </select>
              </div>
            </div>
          </div>

          {formData.tipoPagamento === 'PIX' && (
            <div className="form-section">
              <h4 className="section-title">Dados PIX</h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo de Chave PIX *</label>
                  <select
                    name="TipoChavePix"
                    value={formData.TipoChavePix}
                    onChange={handleInputChangeEvent}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="TELEFONE">Telefone</option>
                    <option value="CHAVE_ALEATORIA">Chave Aleatória</option>
                  </select>
                </div>
                
                <div className="form-group">
                        <label className="form-label">Chave PIX *</label>
                        {(formData.TipoChavePix === 'TELEFONE' || formData.TipoChavePix === 'CPF' || formData.TipoChavePix === 'CNPJ') ? (
                          <Input
                            ref={
                              formData.TipoChavePix === 'TELEFONE' ? phonePixMask :
                              formData.TipoChavePix === 'CPF' ? cpfPixMask :
                              cnpjPixMask
                            }
                            type="text"
                            name="ChavePix"
                            value={formData.ChavePix}
                            onChange={handleInputChangeEvent}
                            placeholder={
                              formData.TipoChavePix === 'TELEFONE' ? '(11) 99999-9999' :
                              formData.TipoChavePix === 'CPF' ? '000.000.000-00' :
                              '00.000.000/0000-00'
                            }
                            disabled={loading}
                            className="form-input"
                          />
                        ) : (
                          <input
                            type="text"
                            name="ChavePix"
                            value={formData.ChavePix}
                            onChange={handleInputChangeEvent}
                            placeholder={
                              formData.TipoChavePix === 'EMAIL' ? 'email@exemplo.com' :
                              'Chave aleatória'
                            }
                            disabled={loading}
                            className="form-input"
                          />
                        )}
                        {errors.ChavePix && <span className="error-message">{errors.ChavePix}</span>}
                      </div>
              </div>
            </div>
          )}
          
          {formData.tipoPagamento === 'TRANSFERENCIA' && (
            <div className="form-section">
              <h4 className="section-title">Dados Bancários</h4>
              
              <div className="form-row">
                <div className="form-group">
                <label className="form-label">Banco *</label>
                <input
                  type="text"
                  name="Banco"
                  value={formData.Banco}
                  onChange={handleInputChangeEvent}
                  placeholder="Nome do banco"
                  disabled={loading}
                  className="form-input"
                />
                {errors.Banco && <span className="error-message">{errors.Banco}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Agência *</label>
                <Input
                  ref={agenciaMask}
                  type="text"
                  name="NumeroAgencia"
                  value={formData.NumeroAgencia}
                  onChange={handleInputChangeEvent}
                  placeholder="0000-0"
                  disabled={loading}
                  className="form-input"
                />
                {errors.NumeroAgencia && <span className="error-message">{errors.NumeroAgencia}</span>}
              </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Conta *</label>
                  <Input
                    ref={contaMask}
                    type="text"
                    name="NumeroConta"
                    value={formData.NumeroConta}
                    onChange={handleInputChangeEvent}
                    placeholder="00000-0"
                    disabled={loading}
                    className="form-input"
                  />
                  {errors.NumeroConta && <span className="error-message">{errors.NumeroConta}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tipo de Conta *</label>
                  <select
                    name="TipoConta"
                    value={formData.TipoConta}
                    onChange={handleInputChangeEvent}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="">Selecione o tipo de conta</option>
                    <option value="CORRENTE">Conta Corrente</option>
                    <option value="POUPANCA">Conta Poupança</option>
                  </select>
                  {errors.TipoConta && <span className="error-message">{errors.TipoConta}</span>}
                </div>
              </div>
            </div>
          )}
          
          <div className="form-section">
            <h4 className="section-title">Dados do Titular</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Titular *</label>
                <input
                  type="text"
                  name="NomeTitular"
                  value={formData.NomeTitular}
                  onChange={handleInputChangeEvent}
                  placeholder="Nome completo do titular"
                  disabled={loading}
                  className="form-input"
                />
                {errors.NomeTitular && <span className="error-message">{errors.NomeTitular}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">CPF do Titular *</label>
                <Input
                  ref={formData.DocumentoTitular?.length <= 14 ? cpfTitularMask : cnpjTitularMask}
                  type="text"
                  name="DocumentoTitular"
                  value={formData.DocumentoTitular}
                  onChange={handleInputChangeEvent}
                  placeholder="CPF ou CNPJ do titular"
                  disabled={loading}
                  className="form-input"
                />
                {errors.DocumentoTitular && <span className="error-message">{errors.DocumentoTitular}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Selecionado *</label>
                <select
                  name="Selecionado"
                  value={formData.Selecionado}
                  onChange={handleInputChangeEvent}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </select>
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
          border-bottom: 1px solid #e9ecef;
        }

        .section-title {
          margin: 20px 0 20px 0;
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
          height: 57px;
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

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Modal>
  );
};

export default DadosBancariosCreateModal;