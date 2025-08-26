import React, { useState, useEffect } from 'react';
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
import '../Home/style.css';
import './style.css';

const DadosCadastrais = () => {
  // Estados principais
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Dados do formulário
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: 'Elevadores TechLift Ltda',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'TechLift Elevadores e Manutenção Ltda',
    inscricaoEstadual: '123.456.789.012',
    qtdElevadores: '25',
    cep: '01310-100',

    // Endereço
    endereco: 'Av. Paulista, 1578',
    uf: 'SP',
    cidade: 'São Paulo',
    bairro: 'Bela Vista',
    complemento: 'Sala 1205',

    // Horários
    segundaASexta: { inicio: '08:00', fim: '18:00' },
    sabados: { inicio: '08:00', fim: '12:00' },
    domingos: { inicio: '', fim: '' },
    feriados: { inicio: '', fim: '' }
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

  // Inicializar dados
  useEffect(() => {
    setInitialData(JSON.parse(JSON.stringify(formData)));
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

  const handleSave = async () => {
    setIsSaving(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    setInitialData(JSON.parse(JSON.stringify(formData)));
    setOriginalData(JSON.parse(JSON.stringify(formData)));
    setIsEditing(false);
    setHasChanges(false);
    setIsSaving(false);

    console.log('Dados salvos:', formData);
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
                      >
                        <FaServicestack />
                        <span>Serviços</span>
                      </button>
                      <button
                        className="dadoscadastrais-btn dadoscadastrais-btn-outline"
                        onClick={() => setShowUsersModal(true)}
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
                      <div className="dadoscadastrais-form-group">
                        <label>Nome</label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Qtde. Elevadores</label>
                        <input
                          type="number"
                          value={formData.qtdElevadores}
                          onChange={(e) => handleInputChange('qtdElevadores', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>CNPJ</label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => handleInputChange('cnpj', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group dadoscadastrais-full-width">
                        <label>Razão Social</label>
                        <input
                          type="text"
                          value={formData.razaoSocial}
                          onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Inscrição Estadual</label>
                        <input
                          type="text"
                          value={formData.inscricaoEstadual}
                          onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>CEP</label>
                        <input
                          type="text"
                          value={formData.cep}
                          onChange={(e) => handleInputChange('cep', e.target.value)}
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
                          value={formData.endereco}
                          onChange={(e) => handleInputChange('endereco', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>UF</label>
                        <select
                          value={formData.uf}
                          onChange={(e) => handleInputChange('uf', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        >
                          <option value="SP">SP</option>
                          <option value="RJ">RJ</option>
                          <option value="MG">MG</option>
                          <option value="RS">RS</option>
                        </select>
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Cidade</label>
                        <input
                          type="text"
                          value={formData.cidade}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Bairro</label>
                        <input
                          type="text"
                          value={formData.bairro}
                          onChange={(e) => handleInputChange('bairro', e.target.value)}
                          disabled={!isEditing}
                          className={isEditing ? 'dadoscadastrais-editing' : ''}
                        />
                      </div>
                      <div className="dadoscadastrais-form-group">
                        <label>Complemento</label>
                        <input
                          type="text"
                          value={formData.complemento}
                          onChange={(e) => handleInputChange('complemento', e.target.value)}
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
                            value={formData.segundaASexta.inicio}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                segundaASexta: { ...formData.segundaASexta, inicio: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.segundaASexta.fim}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                segundaASexta: { ...formData.segundaASexta, fim: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.sabados.inicio}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                sabados: { ...formData.sabados, inicio: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.sabados.fim}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                sabados: { ...formData.sabados, fim: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.domingos.inicio}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                domingos: { ...formData.domingos, inicio: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.domingos.fim}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                domingos: { ...formData.domingos, fim: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.feriados.inicio}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                feriados: { ...formData.feriados, inicio: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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
                            value={formData.feriados.fim}
                            onChange={(e) => {
                              const newFormData = {
                                ...formData,
                                feriados: { ...formData.feriados, fim: e.target.value }
                              };
                              setFormData(newFormData);
                              const hasDataChanged = JSON.stringify(newFormData) !== JSON.stringify(originalData);
                              setHasChanges(hasDataChanged);
                            }}
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