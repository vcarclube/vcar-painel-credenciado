import React, { useState } from 'react';
import { FiCalendar, FiClock, FiTool } from 'react-icons/fi';
import Modal from '../index';
import { Button, SearchableSelect } from '../../index';
import './style.css';

const AgendamentoModal = ({ isOpen, onClose, vehicleData }) => {
  const [formData, setFormData] = useState({
    motivacao: '',
    dataAgendamento: '',
    horario: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Opções para motivação de serviço
  const motivacaoOptions = [
    { value: 'manutencao-preventiva', label: 'Manutenção Preventiva' },
    { value: 'manutencao-corretiva', label: 'Manutenção Corretiva' },
    { value: 'revisao', label: 'Revisão' },
    { value: 'troca-oleo', label: 'Troca de Óleo' },
    { value: 'alinhamento', label: 'Alinhamento e Balanceamento' },
    { value: 'freios', label: 'Sistema de Freios' },
    { value: 'suspensao', label: 'Suspensão' },
    { value: 'ar-condicionado', label: 'Ar Condicionado' },
    { value: 'eletrica', label: 'Sistema Elétrico' },
    { value: 'outros', label: 'Outros' }
  ];

  // Opções para horário
  const horarioOptions = [
    { value: '08:00', label: '08:00' },
    { value: '08:30', label: '08:30' },
    { value: '09:00', label: '09:00' },
    { value: '09:30', label: '09:30' },
    { value: '10:00', label: '10:00' },
    { value: '10:30', label: '10:30' },
    { value: '11:00', label: '11:00' },
    { value: '11:30', label: '11:30' },
    { value: '13:00', label: '13:00' },
    { value: '13:30', label: '13:30' },
    { value: '14:00', label: '14:00' },
    { value: '14:30', label: '14:30' },
    { value: '15:00', label: '15:00' },
    { value: '15:30', label: '15:30' },
    { value: '16:00', label: '16:00' },
    { value: '16:30', label: '16:30' },
    { value: '17:00', label: '17:00' },
    { value: '17:30', label: '17:30' }
  ];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.motivacao) {
      newErrors.motivacao = 'Motivação do serviço é obrigatória';
    }
    
    if (!formData.dataAgendamento) {
      newErrors.dataAgendamento = 'Data do agendamento é obrigatória';
    }
    
    if (!formData.horario) {
      newErrors.horario = 'Horário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Dados do agendamento:', {
        ...formData,
        placa: vehicleData?.placa
      });
      
      // Resetar formulário
      setFormData({
        motivacao: '',
        dataAgendamento: '',
        horario: ''
      });
      
      setErrors({});
      onClose();
      
      // Aqui você pode adicionar uma notificação de sucesso
      alert('Agendamento criado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        motivacao: '',
        dataAgendamento: '',
        horario: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Novo Agendamento"
      size="medium"
      preventClose={isSubmitting}
    >
      <div className="agendamento-modal-content">
        <div className="vehicle-info">
          <p className="vehicle-plate">
            <strong>Placa: {vehicleData?.placa}</strong>
          </p>
          <p className="info-text">
            Preencha os dados abaixo para criar um novo agendamento.
          </p>
        </div>
        
        <div className="agendamento-form">
          <div className="form-group">
            <label htmlFor="motivacao">
              <FiTool />
              Motivação do Serviço *
            </label>
            <SearchableSelect
              options={motivacaoOptions}
              value={formData.motivacao}
              onChange={(option) => handleInputChange('motivacao', option?.value || '')}
              placeholder="Selecione a motivação..."
              className={errors.motivacao ? 'error' : ''}
            />
            {errors.motivacao && <span className="error-text">{errors.motivacao}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dataAgendamento">
              <FiCalendar />
              Data do Agendamento *
            </label>
            <input
              style={{width: '100%'}}
              type="date"
              id="dataAgendamento"
              name="dataAgendamento"
              value={formData.dataAgendamento}
              onChange={handleDateChange}
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
            <SearchableSelect
              options={horarioOptions}
              value={formData.horario}
              onChange={(option) => handleInputChange('horario', option?.value || '')}
              placeholder="Selecione o horário..."
              className={errors.horario ? 'error' : ''}
            />
            {errors.horario && <span className="error-text">{errors.horario}</span>}
          </div>
          
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Agendar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AgendamentoModal;