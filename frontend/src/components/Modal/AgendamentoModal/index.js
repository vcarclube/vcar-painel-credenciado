import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiCar, FiPhone, FiMail } from 'react-icons/fi';
import './style.css';

const AgendamentoModal = ({ isOpen, onClose, vehicleData }) => {
  const [formData, setFormData] = useState({
    placa: vehicleData?.placa || '',
    cliente: '',
    telefone: '',
    email: '',
    modelo: '',
    ano: '',
    cor: '',
    dataAgendamento: '',
    horario: '',
    servico: '',
    observacoes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Atualizar placa quando vehicleData mudar
  React.useEffect(() => {
    if (vehicleData?.placa) {
      setFormData(prev => ({ ...prev, placa: vehicleData.placa }));
    }
  }, [vehicleData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cliente.trim()) {
      newErrors.cliente = 'Nome do cliente é obrigatório';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'Modelo do veículo é obrigatório';
    }
    
    if (!formData.dataAgendamento) {
      newErrors.dataAgendamento = 'Data do agendamento é obrigatória';
    }
    
    if (!formData.horario) {
      newErrors.horario = 'Horário é obrigatório';
    }
    
    if (!formData.servico.trim()) {
      newErrors.servico = 'Tipo de serviço é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você faria a chamada real para a API
      console.log('Dados do agendamento:', formData);
      
      // Fechar modal e mostrar sucesso
      onClose();
      alert('Agendamento criado com sucesso!');
      
      // Resetar formulário
      setFormData({
        placa: '',
        cliente: '',
        telefone: '',
        email: '',
        modelo: '',
        ano: '',
        cor: '',
        dataAgendamento: '',
        horario: '',
        servico: '',
        observacoes: ''
      });
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="agendamento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FiCalendar />
            Novo Agendamento
          </h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <FiX />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="vehicle-info">
            <div className="vehicle-plate">
              <FiCar />
              <span>Placa: <strong>{formData.placa}</strong></span>
            </div>
            <p className="info-text">
              Veículo não encontrado no sistema. Preencha os dados abaixo para criar um novo agendamento.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="agendamento-form">
            <div className="form-section">
              <h3>Dados do Cliente</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cliente">
                    <FiUser />
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    id="cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleInputChange}
                    className={errors.cliente ? 'error' : ''}
                    placeholder="Digite o nome completo"
                  />
                  {errors.cliente && <span className="error-text">{errors.cliente}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="telefone">
                    <FiPhone />
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={errors.telefone ? 'error' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.telefone && <span className="error-text">{errors.telefone}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <FiMail />
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Dados do Veículo</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modelo">
                    <FiCar />
                    Modelo *
                  </label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    className={errors.modelo ? 'error' : ''}
                    placeholder="Ex: Honda Civic"
                  />
                  {errors.modelo && <span className="error-text">{errors.modelo}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="ano">Ano</label>
                  <input
                    type="number"
                    id="ano"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1990"
                    max="2024"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cor">Cor</label>
                  <input
                    type="text"
                    id="cor"
                    name="cor"
                    value={formData.cor}
                    onChange={handleInputChange}
                    placeholder="Ex: Branco"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Agendamento</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataAgendamento">
                    <FiCalendar />
                    Data *
                  </label>
                  <input
                    type="date"
                    id="dataAgendamento"
                    name="dataAgendamento"
                    value={formData.dataAgendamento}
                    onChange={handleInputChange}
                    className={errors.dataAgendamento ? 'error' : ''}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dataAgendamento && <span className="error-text">{errors.dataAgendamento}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="horario">
                    <FiClock />
                    Horário *
                  </label>
                  <select
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleInputChange}
                    className={errors.horario ? 'error' : ''}
                  >
                    <option value="">Selecione</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                  {errors.horario && <span className="error-text">{errors.horario}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="servico">Tipo de Serviço *</label>
                <select
                  id="servico"
                  name="servico"
                  value={formData.servico}
                  onChange={handleInputChange}
                  className={errors.servico ? 'error' : ''}
                >
                  <option value="">Selecione o serviço</option>
                  <option value="Revisão">Revisão</option>
                  <option value="Troca de Óleo">Troca de Óleo</option>
                  <option value="Alinhamento">Alinhamento</option>
                  <option value="Balanceamento">Balanceamento</option>
                  <option value="Freios">Freios</option>
                  <option value="Suspensão">Suspensão</option>
                  <option value="Ar Condicionado">Ar Condicionado</option>
                  <option value="Outros">Outros</option>
                </select>
                {errors.servico && <span className="error-text">{errors.servico}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhes adicionais sobre o serviço..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoModal;