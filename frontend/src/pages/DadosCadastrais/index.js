import React, { useState, useEffect, useContext } from 'react';
import {
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaCog,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaUsers,
  FaServicestack
} from 'react-icons/fa';
import { Header, Sidebar, BottomNavigation, Modal } from '../../components';
import { toast } from 'react-toastify';
import Api from '../../Api';
import '../Home/style.css';
import './style.css';
import { MainContext } from '../../helpers/MainContext';

const DadosCadastrais = () => {
  const { user } = useContext(MainContext);

  // Estados principais
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Dados do formulário
  const [formData, setFormData] = useState({
    // Dados pessoais
    RazaoSocial: '',
    Cnpj: '',
    InscricaoEstadual: '',
    QtdeElevadores: '',
    EnderecoCep: '',

    // Endereço
    Endereco: '',
    EnderecoUf: '',
    EnderecoCidade: '',
    EnderecoBairro: '',
    EnderecoComplemento: '',

    // Horários
    SegSexInicio: '',
    SegSexFim: '',
    SabadoInicio: '',
    SabadoFim: '',
    DomingoInicio: '',
    DomingoFim: '',
    FeriadoInicio: '',
    FeriadoFim: '',
    
    // Descrição
    Descricao: ''
  });

  // Dados iniciais para comparação
  const [initialData, setInitialData] = useState({});

  // Serviços disponíveis
  const [availableServices] = useState([
    { id: 1, name: 'Manutenção Preventiva', description: 'Manutenções programadas e inspeções regulares' },
    { id: 2, name: 'Manutenção Corretiva', description: 'Reparos e correções de problemas' },
    { id: 3, name: 'Modernização', description: 'Atualização e modernização de equipamentos' },
    { id: 4, name: 'Instalação', description: 'Instalação de novos elevadores' },
    { id: 5, name: 'Consultoria Técnica', description: 'Consultoria especializada e assessoria técnica' }
  ]);

  const [selectedServices, setSelectedServices] = useState([1, 2, 3]);

  // Usuários do sistema
  const [users, setUsers] = useState([
    { id: 1, name: 'João Silva', email: 'joao@techlift.com', role: 'Administrador' },
    { id: 2, name: 'Maria Santos', email: 'maria@techlift.com', role: 'Gerente' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@techlift.com', role: 'Técnico' }
  ]);

  // Função para extrair hora de timestamp ISO
  const extractTimeFromISO = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Função para carregar dados da API
  const loadDadosCadastrais = async () => {
    try {
      setIsLoading(true);
      const response = await Api.getDadosCadastrais({idPontoAtendimento: user.IdPontoAtendimento});
      
      if (response.status === 200 && response.data.success) {
        const data = response.data.data;
        const mappedData = {
          RazaoSocial: data.RazaoSocial || '',
          Cnpj: data.Cnpj || '',
          InscricaoEstadual: data.InscricaoEstadual || '',
          QtdeElevadores: data.QtdeElevadores || '',
          EnderecoCep: data.EnderecoCep || '',
          Endereco: data.Endereco || '',
          EnderecoUf: data.EnderecoUf || '',
          EnderecoCidade: data.EnderecoCidade || '',
          EnderecoBairro: data.EnderecoBairro || '',
          EnderecoComplemento: data.EnderecoComplemento || '',
          SegSexInicio: extractTimeFromISO(data.SegSexInicio),
           SegSexFim: extractTimeFromISO(data.SegSexFim),
           SabInicio: extractTimeFromISO(data.SabadoInicio),
           SabFim: extractTimeFromISO(data.SabadoFim),
           DomInicio: extractTimeFromISO(data.DomingoInicio),
           DomFim: extractTimeFromISO(data.DomingoFim),
           FerInicio: extractTimeFromISO(data.FeriadoInicio),
           FerFim: extractTimeFromISO(data.FeriadoFim),
          Descricao: data.Descricao || ''
        };
        setFormData(mappedData);
        setInitialData(JSON.parse(JSON.stringify(mappedData)));
      } else {
        toast.error('Erro ao carregar dados cadastrais');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados cadastrais');
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar dados
  useEffect(() => {
    loadDadosCadastrais();
  }, []);

  // Verificar mudanças
  const checkForChanges = () => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(hasChanged);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isEditing) {
      checkForChanges();
    }
  }, [formData, isEditing]);

  // Handlers
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleEdit = () => {
    setOriginalData(JSON.parse(JSON.stringify(formData)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(JSON.parse(JSON.stringify(originalData)));
    setIsEditing(false);
    setHasChanges(false);
  };

  const convertTimeToISO = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const date = new Date('1970-01-01T00:00:00.000Z');
    date.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toISOString();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Converter horários de volta para formato ISO
      const dataToSend = {
        ...formData,
        SegSexInicio: convertTimeToISO(formData.SegSexInicio),
        SegSexFim: convertTimeToISO(formData.SegSexFim),
        SabadoInicio: convertTimeToISO(formData.SabInicio),
        SabadoFim: convertTimeToISO(formData.SabFim),
        DomingoInicio: convertTimeToISO(formData.DomInicio),
        DomingoFim: convertTimeToISO(formData.DomFim),
        FeriadoInicio: convertTimeToISO(formData.FerInicio),
        FeriadoFim: convertTimeToISO(formData.FerFim),
        IdPontoAtendimento: user.IdPontoAtendimento,
      };
      
      // Remover campos que não devem ser enviados
      delete dataToSend.SabInicio;
      delete dataToSend.SabFim;
      delete dataToSend.DomInicio;
      delete dataToSend.DomFim;
      delete dataToSend.FerInicio;
      delete dataToSend.FerFim;
      
      const response = await Api.atualizarDadosCadastrais({ data: dataToSend });
      
      if (response.status === 200) {
        toast.success('Dados atualizados com sucesso!');
        setInitialData(JSON.parse(JSON.stringify(formData)));
        setOriginalData(JSON.parse(JSON.stringify(formData)));
        setIsEditing(false);
        setHasChanges(false);
      } else {
        toast.error('Erro ao atualizar dados cadastrais');
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao atualizar dados cadastrais');
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers dos modais
  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAddUser = () => {
    const newUser = {
      id: Date.now(),
      name: '',
      email: '',
      role: ''
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleUserChange = (userId, field, value) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, [field]: value } : user
    ));
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content" style={{marginBottom: '0px', paddingBottom: '0px'}}>
        <Header />
        <div className="content-area">
          <div className="dadoscadastrais-container">
            {/* Header */}
            <div className="dadoscadastrais-header">
              <div className="dadoscadastrais-header-content">
                <div className="dadoscadastrais-header-left">
                  <h1>Dados Cadastrais</h1>
                </div>

                <div className="dadoscadastrais-header-actions">
                  {!isEditing ? (
                    <>
                      <button
                        className="dadoscadastrais-btn dadoscadastrais-btn-outline"
                        onClick={() => setShowServicesModal(true)}
                        style={{display: 'none'}}
                      >
                        <FaServicestack />
                        <span>Serviços</span>
                      </button>
                      <button
                        className="dadoscadastrais-btn dadoscadastrais-btn-outline"
                        onClick={() => setShowUsersModal(true)}
                        style={{display: 'none'}}
                      >
                        <FaUsers />
                        <span>Usuários</span>
                      </button>
                      <button
                        className="dadoscadastrais-btn dadoscadastrais-btn-primary"
                        onClick={handleEdit}
                      >
                        <FaEdit />
                        <span>Editar</span>
                      </button>
                    </>
                  ) : (
                    <div className="dadoscadastrais-edit-actions">
                      <button
                        className="dadoscadastrais-btn dadoscadastrais-btn-secondary"
                        onClick={handleCancel}
                      >
                        <FaTimes />
                        <span>Cancelar</span>
                      </button>
                      <button
                        className={`dadoscadastrais-btn dadoscadastrais-btn-primary ${hasChanges ? 'dadoscadastrais-has-changes' : ''
                          } ${isSaving ? 'dadoscadastrais-loading' : ''}`}
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                      >
                        <FaSave />
                        <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="dadoscadastrais-content">
              {/* Cards Container */}
              <div className="dadoscadastrais-cards">
                {/* Card Dados Pessoais */}
                <div className="dadoscadastrais-card">
                  <div className="dadoscadastrais-card-header">
                    <h2>Dados do Credenciado</h2>
                  </div>
                  <div className="dadoscadastrais-card-content">
                    <div className="dadoscadastrais-form-grid">
                      <div className="dadoscadastrais-form-group dadoscadastrais-full-width">
                        <label>Razão Social</label>
                        <input
                          type="text"
                          value={formData.RazaoSocial}
                          onChange={(e) => handleInputChange('RazaoSocial', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>CNPJ</label>
                        <input
                          type="text"
                          value={formData.Cnpj}
                          onChange={(e) => handleInputChange('Cnpj', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Inscrição Estadual</label>
                        <input
                          type="text"
                          value={formData.InscricaoEstadual}
                          onChange={(e) => handleInputChange('InscricaoEstadual', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Qtde. Elevadores</label>
                        <input
                          type="number"
                          value={formData.QtdeElevadores}
                          onChange={(e) => handleInputChange('QtdeElevadores', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>CEP</label>
                        <input
                          type="text"
                          value={formData.EnderecoCep}
                          onChange={(e) => handleInputChange('EnderecoCep', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Endereço */}
                <div className="dadoscadastrais-card">
                  <div className="dadoscadastrais-card-header">
                    <h2>Endereço</h2>
                  </div>
                  <div className="dadoscadastrais-card-content">
                    <div className="dadoscadastrais-form-grid">
                      <div className="dadoscadastrais-form-group dadoscadastrais-full-width">
                        <label>Endereço</label>
                        <input
                          type="text"
                          value={formData.Endereco}
                          onChange={(e) => handleInputChange('Endereco', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>UF</label>
                        <select
                          value={formData.EnderecoUf}
                          onChange={(e) => handleInputChange('EnderecoUf', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        >
                          <option value="">Selecione</option>
                          <option value="AC">AC</option>
                          <option value="AL">AL</option>
                          <option value="AP">AP</option>
                          <option value="AM">AM</option>
                          <option value="BA">BA</option>
                          <option value="CE">CE</option>
                          <option value="DF">DF</option>
                          <option value="ES">ES</option>
                          <option value="GO">GO</option>
                          <option value="MA">MA</option>
                          <option value="MT">MT</option>
                          <option value="MS">MS</option>
                          <option value="MG">MG</option>
                          <option value="PA">PA</option>
                          <option value="PB">PB</option>
                          <option value="PR">PR</option>
                          <option value="PE">PE</option>
                          <option value="PI">PI</option>
                          <option value="RJ">RJ</option>
                          <option value="RN">RN</option>
                          <option value="RS">RS</option>
                          <option value="RO">RO</option>
                          <option value="RR">RR</option>
                          <option value="SC">SC</option>
                          <option value="SP">SP</option>
                          <option value="SE">SE</option>
                          <option value="TO">TO</option>
                        </select>
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Cidade</label>
                        <input
                          type="text"
                          value={formData.EnderecoCidade}
                          onChange={(e) => handleInputChange('EnderecoCidade', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Bairro</label>
                        <input
                          type="text"
                          value={formData.EnderecoBairro}
                          onChange={(e) => handleInputChange('EnderecoBairro', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Complemento</label>
                        <input
                          type="text"
                          value={formData.EnderecoComplemento}
                          onChange={(e) => handleInputChange('EnderecoComplemento', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Horários */}
                <div className="dadoscadastrais-card dadoscadastrais-card-full">
                  <div className="dadoscadastrais-card-header">
                    <h2>Horários de Funcionamento</h2>
                  </div>
                  <div className="dadoscadastrais-card-content">
                    <div className="dadoscadastrais-horarios-grid">
                      {/* Segunda a Sexta */}
                      <div className="dadoscadastrais-horario-item">
                        <label>Segunda a Sexta</label>
                        <div className="dadoscadastrais-horario-inputs">
                          <select
                            value={formData.SegSexInicio}
                            onChange={(e) => handleInputChange('SegSexInicio', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Início</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                          <span className="dadoscadastrais-time-separator">às</span>
                          <select
                            value={formData.SegSexFim}
                            onChange={(e) => handleInputChange('SegSexFim', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Fim</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Sábados */}
                      <div className="dadoscadastrais-horario-item">
                        <label>Sábados</label>
                        <div className="dadoscadastrais-horario-inputs">
                          <select
                            value={formData.SabInicio}
                            onChange={(e) => handleInputChange('SabInicio', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Início</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                          <span className="dadoscadastrais-time-separator">às</span>
                          <select
                            value={formData.SabFim}
                            onChange={(e) => handleInputChange('SabFim', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Fim</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Domingos */}
                      <div className="dadoscadastrais-horario-item">
                        <label>Domingos</label>
                        <div className="dadoscadastrais-horario-inputs">
                          <select
                            value={formData.DomInicio}
                            onChange={(e) => handleInputChange('DomInicio', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Fechado</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                          <span className="dadoscadastrais-time-separator">às</span>
                          <select
                            value={formData.DomFim}
                            onChange={(e) => handleInputChange('DomFim', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Fechado</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Feriados */}
                      <div className="dadoscadastrais-horario-item">
                        <label>Feriados</label>
                        <div className="dadoscadastrais-horario-inputs">
                          <select
                            value={formData.FerInicio}
                            onChange={(e) => handleInputChange('FerInicio', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Fechado</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                          <span className="dadoscadastrais-time-separator">às</span>
                          <select
                            value={formData.FerFim}
                            onChange={(e) => handleInputChange('FerFim', e.target.value)}
                            disabled={!isEditing}
                            className={isEditing ? 'dadoscadastrais-editing' : ''}
                          >
                            <option value="">Fechado</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal de Serviços */}
            <Modal
              isOpen={showServicesModal}
              onClose={() => setShowServicesModal(false)}
              title="Gerenciar Serviços Disponíveis"
              size="medium"
            >
              <div className="dadoscadastrais-services-list">
                {availableServices.map((service) => (
                  <div key={service.id} className="dadoscadastrais-service-item">
                    <label className="dadoscadastrais-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                      />
                      <span className="dadoscadastrais-checkmark"></span>
                      <div className="dadoscadastrais-service-info">
                        <strong>{service.name}</strong>
                        <p>{service.description}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="modal-actions" style={{flexDirection: 'row !important'}}>
                <button
                  className="dadoscadastrais-btn dadoscadastrais-btn-secondary"
                  onClick={() => setShowServicesModal(false)}
                >
                  <FaTimes />
                  <span>Cancelar</span>
                </button>
                <button
                  className="dadoscadastrais-btn dadoscadastrais-btn-primary"
                  onClick={() => {
                    console.log('Serviços selecionados:', selectedServices);
                    setShowServicesModal(false);
                  }}
                >
                  <FaSave />
                  <span>Salvar Serviços</span>
                </button>
              </div>
            </Modal>

            {/* Modal de Usuários */}
            <Modal
              isOpen={showUsersModal}
              onClose={() => setShowUsersModal(false)}
              title="Gerenciar Usuários do Sistema"
              size="large"
            >
              <div className="dadoscadastrais-users-header">
                <button
                  className="dadoscadastrais-btn dadoscadastrais-btn-primary"
                  onClick={handleAddUser}
                >
                  <FaPlus />
                  <span>Adicionar Novo Usuário</span>
                </button>
                <p className="dadoscadastrais-users-description">
                  Gerencie os usuários que têm acesso ao sistema
                </p>
              </div>
              <div className="dadoscadastrais-users-list">
                {users.length === 0 ? (
                  <div className="dadoscadastrais-empty-state">
                    <FaUsers className="dadoscadastrais-empty-icon" />
                    <p>Nenhum usuário cadastrado</p>
                    <p className="dadoscadastrais-empty-subtitle">Clique em "Adicionar Novo Usuário" para começar</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="dadoscadastrais-user-item">
                      <div className="dadoscadastrais-user-fields">
                        <input
                          type="text"
                          placeholder="Nome completo"
                          value={user.name}
                          onChange={(e) => handleUserChange(user.id, 'name', e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Email de acesso"
                          value={user.email}
                          onChange={(e) => handleUserChange(user.id, 'email', e.target.value)}
                        />
                        <select
                          value={user.role}
                          onChange={(e) => handleUserChange(user.id, 'role', e.target.value)}
                        >
                          <option value="">Selecione o cargo</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Gerente">Gerente</option>
                          <option value="Operador">Operador</option>
                          <option value="Técnico">Técnico</option>
                          <option value="Visualizador">Visualizador</option>
                        </select>
                      </div>
                      <button
                        className="dadoscadastrais-btn dadoscadastrais-btn-danger dadoscadastrais-btn-small"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Excluir usuário"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="modal-actions" style={{flexDirection: 'row !important'}}>
                <button
                  className="dadoscadastrais-btn dadoscadastrais-btn-secondary"
                  onClick={() => setShowUsersModal(false)}
                >
                  <FaTimes />
                  <span>Cancelar</span>
                </button>
                <button
                  className="dadoscadastrais-btn dadoscadastrais-btn-primary"
                  onClick={() => {
                    console.log('Usuários salvos:', users);
                    setShowUsersModal(false);
                  }}
                >
                  <FaSave />
                  <span>Salvar Usuários</span>
                </button>
              </div>
            </Modal>
          </div>
        </div>

        {/* Botões de ação na parte inferior */}
        {isEditing && (
          <div className="dadoscadastrais-bottom-actions">
            <div className="dadoscadastrais-edit-actions">
              <button
                className="dadoscadastrais-btn dadoscadastrais-btn-secondary"
                onClick={handleCancel}
              >
                <FaTimes />
                <span>Cancelar</span>
              </button>
              <button
                className={`dadoscadastrais-btn dadoscadastrais-btn-primary ${hasChanges ? 'dadoscadastrais-has-changes' : ''
                  } ${isSaving ? 'dadoscadastrais-loading' : ''}`}
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <FaSave />
                <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default DadosCadastrais;