import React, { useState, useEffect, useContext } from 'react';
import { FiCalendar, FiClock, FiTool } from 'react-icons/fi';
import Modal from '../index';
import { Button, SearchableSelect } from '../../index';
import { toast } from 'react-toastify';
import Api from '../../../Api';
import { MainContext } from '../../../helpers/MainContext';
import './style.css';

const AgendamentoModal = ({ isOpen, onClose, vehicleData }) => {
  const { user } = useContext(MainContext);
  const [formData, setFormData] = useState({
    motivacao: '',
    dataAgendamento: '',
    horario: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([{ value: '', label: '__:__' }]);
  const [motivacoesDisponiveis, setMotivacoesDisponiveis] = useState([]);

  // useEffect para buscar horários disponíveis quando a data for selecionada
  useEffect(() => {
    if (user?.IdPontoAtendimento && formData.dataAgendamento) {
      const dataAtual = new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })?.replace(",", "")?.split(" ")[0];
      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      Api.listaHorariosDisponiveis({
        idPontoAtendimento: user.IdPontoAtendimento,
        dataAgendamento: formData.dataAgendamento,
        dataAtual: dataAtual,
        horaAtual: horaAtual
      }).then(res => {
        const horarios = res?.data || [];
        setHorariosDisponiveis(horarios.map(horario => ({ value: horario, label: horario })));
      }).catch(error => {
        console.error('Erro ao buscar horários:', error);
        toast.error('Erro ao carregar horários disponíveis');
      });
    }
  }, [user?.IdPontoAtendimento, formData.dataAgendamento]);

  // useEffect para buscar motivações disponíveis
  useEffect(() => {
    Api.listaMotivacoes().then(res => {
      console.log(res?.data?.motivacoes);
      const motivacoes = res?.data?.motivacoes || [];
      setMotivacoesDisponiveis(motivacoes.map(motivacao => ({ 
        value: motivacao.IdMotivacao, 
        label: motivacao.Descricao?.toUpperCase() 
      })));
    }).catch(error => {
      console.error('Erro ao buscar motivações:', error);
      toast.error('Erro ao carregar motivações disponíveis');
      setMotivacoesDisponiveis([]);
    });
  }, []);

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
      await Api.agendar({
        idPontoAtendimento: user.IdPontoAtendimento,
        idSocio: user.IdSocio,
        idSocioVeiculo: vehicleData?.idSocioVeiculo,
        data: formData.dataAgendamento,
        hora: formData.horario,
        motivo: formData.motivacao,
        pecaPorContaDoSocio: 'N'
      });
      
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
      setHorariosDisponiveis([]);
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
          {vehicleData?.nomeSocio && (
            <p className="socio-name">
              <strong>Sócio: {vehicleData?.nomeSocio}</strong>
            </p>
          )}
          <p className="vehicle-plate">
            <strong>Placa: {vehicleData?.placa}</strong>
          </p>
          {vehicleData?.veiculo && (
            <p className="vehicle-details">
              <strong>Veículo: {vehicleData?.veiculo}</strong>
            </p>
          )}
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
              options={motivacoesDisponiveis}
              value={formData.motivacao}
              onChange={(option) => handleInputChange('motivacao', option?.value || '')}
              placeholder="Selecione a motivação..."
              className={errors.motivacao ? 'error' : ''}
            />
            {errors.motivacao && <span className="error-text">{errors.motivacao}</span>}
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>

            <div className="form-group" style={{width: '100%'}}>
              <label htmlFor="dataAgendamento">
                <FiCalendar />
                Data *
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
            </div>&nbsp;

            <div className="form-group" style={{width: '100%'}}>
              <label htmlFor="horario">
                <FiClock />
                Horário *
              </label>
              <SearchableSelect
                hideSearchInput={true}
                options={horariosDisponiveis}
                value={formData.horario}
                onChange={(option) => handleInputChange('horario', option?.value || '')}
                placeholder={""}
                className={errors.horario ? 'error' : ''}
                disabled={horariosDisponiveis.length === 0}
              />
              {errors.horario && <span className="error-text">{errors.horario}</span>}
            </div>
          
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