import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useMask } from '@react-input/mask';
import { Header, Sidebar, BottomNavigation, Modal, Input, Button, SearchableSelect } from '../../components';
import '../Home/style.css';
import './style.css';
import { FiUsers, FiPlus, FiEdit, FiTrash } from 'react-icons/fi';
import Api from '../../Api';
import { toast } from 'react-toastify';
import { MainContext } from '../../helpers/MainContext';

const perfis = [];

const Usuarios = () => {
  const { user } = useContext(MainContext);
  const [users, setUsers] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [principalId, setPrincipalId] = useState(null);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tipoMap = useMemo(() => {
    const m = {};
    tipos.forEach(t => { m[t.IdUsuarioTipo] = t.Descricao; });
    return m;
  }, [tipos]);

  const celularMask = useMask({
    mask: '(__) _____-____',
    replacement: { _: /\d/ }
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchText = `${u.nome} ${u.email}`.toLowerCase().includes(filtroTexto.toLowerCase());
      const matchPerfil = !filtroPerfil || u.perfilDescricao === filtroPerfil;
      return matchText && matchPerfil;
    });
  }, [users, filtroTexto, filtroPerfil]);

  const perfisOptions = useMemo(() => tipos.map(t => ({ value: t.IdUsuarioTipo, label: t.Descricao })), [tipos]);

  const carregarUsuarios = async () => {
    try {
      if (!user?.IdPontoAtendimento) return;
      const response = await Api.listaUsuarios({ idPontoAtendimento: user.IdPontoAtendimento });
      if (response?.status === 200) {
        const lista = response?.data?.data || response?.data?.usuarios || response?.data || [];
        const mapped = lista.map((it) => ({
          id: it.IdPontoAtendimentoUsuario,
          nome: it.Nome,
          email: it.Email,
          celular: it.Telefone,
          perfilDescricao: tipoMap[it.IdUsuarioTipo] || '',
          perfilTipoId: it.IdUsuarioTipo,
          dataLog: it.DataLog
        }));
        const parseDate = (d) => { const t = Date.parse(d); return isNaN(t) ? Number.POSITIVE_INFINITY : t; };
        const sorted = [...mapped].sort((a, b) => parseDate(a.dataLog) - parseDate(b.dataLog));
        setUsers(sorted);
        setPrincipalId(sorted[0]?.id || null);
      } else {
        toast.error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const carregarTipos = async () => {
    try {
      const r = await Api.getUsuariosTipos();
      if (r?.status === 200) {
        const arr = r?.data?.data || r?.data || [];
        setTipos(arr);
      }
    } catch (e) {}
  };

  useEffect(() => {
    carregarTipos();
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [user, tipoMap]);

  const handleOpenCreate = () => {
    setEditUser({ id: null, nome: '', email: '', perfilTipoId: null, celular: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    if (u?.id === principalId) {
      toast.error('Usuário principal não pode ser editado');
      return;
    }
    setEditUser({ id: u.id, nome: u.nome, email: u.email, celular: u.celular || '', perfilTipoId: u.perfilTipoId });
    setIsModalOpen(true);
  };

  const handleAskDelete = (u) => {
    setSelectedUser(u);
    if (u?.id === principalId) {
      toast.error('Usuário principal não pode ser excluído');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    if (selectedUser?.id === principalId) { toast.error('Usuário principal não pode ser excluído'); return; }
    try {
      const response = await Api.deleteUsuario({ IdPontoAtendimentoUsuario: selectedUser.id });
      if (response?.data?.success || response?.status === 200) {
        toast.success('Usuário excluído com sucesso');
        setShowDeleteModal(false);
        setSelectedUser(null);
        await carregarUsuarios();
      } else {
        toast.error('Não foi possível excluir o usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleSave = () => {
    if (!editUser) return;
    if (!editUser.nome?.trim() || !editUser.email?.trim() || !editUser.perfilTipoId) return;
    const payload = {
      Nome: editUser.nome,
      Email: editUser.email,
      Telefone: editUser.celular || '',
      Senha: '',
      IdPontoAtendimento: user?.IdPontoAtendimento,
      IdUsuarioTipo: editUser.perfilTipoId
    };
    const doRequest = async () => {
      try {
        const response = editUser.id == null
          ? await Api.addUsuario(payload)
          : await Api.updateUsuario({ ...payload, IdPontoAtendimentoUsuario: editUser.id });
        if (response?.data?.success || response?.status === 200) {
          toast.success('Usuário salvo com sucesso');
          setIsModalOpen(false);
          setEditUser(null);
          await carregarUsuarios();
        } else {
          toast.error('Não foi possível salvar o usuário');
        }
      } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        toast.error('Erro ao salvar usuário');
      }
    };
    doRequest();
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content" style={{paddingBottom: '0px', marginBottom: '0px'}}>
        <Header />
        <center>
          <div className="retorno-servico-container">
            <div className="retorno-servico-header">
              <div className="retorno-servico-title">
                <FiUsers className="retorno-servico-icon" />
                <h1>Usuários</h1>
              </div>
              <div className="retorno-servico-filters">
                <div className="filter-group">
                  <label style={{textAlign: 'left'}}>Busca:</label>
                  <Input
                    type="text"
                    placeholder="Nome ou e-mail"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label style={{textAlign: 'left'}}>Perfil:</label>
                  <select 
                    value={filtroPerfil} 
                    onChange={(e) => setFiltroPerfil(e.target.value)}
                  >
                    <option value="">TODOS</option>
                    {tipos.map(t => (
                      <option key={t.IdUsuarioTipo} value={t.Descricao}>{t.Descricao}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  variant="primary"
                  size="small"
                  onClick={handleOpenCreate}
                >
                  <FiPlus />
                  Novo Usuário
                </Button>
              </div>
            </div>

            <div className="retorno-servico-mobile-cards">
              <div className="cards-header">
                <span className="info-label">Informações</span>
                <span className="actions-label">Ações</span>
              </div>
              {filteredUsers.map((u) => (
                <div key={u.id} className="retorno-servico-card">
                  <div className="card-content">
                    <div className="card-info">
                      <div className="card-status">
                        <span className="status-badge">{u.perfilDescricao}</span>
                        <span className="card-number">{u.email}</span>
                      </div>
                      <div className="card-details">
                        <div className="card-client">👤 {u.nome}</div>
                        <div className="card-service">Perfil: {u.perfilDescricao}</div>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    {u.id !== principalId && (
                      <Button 
                        variant="outline"
                        size="small"
                        onClick={() => handleOpenEdit(u)}
                        title="Editar"
                      >
                        <FiEdit />
                        <span>Editar</span>
                      </Button>
                    )}
                    {u.id !== principalId && (
                      <Button 
                        variant="danger"
                        size="small"
                        onClick={() => handleAskDelete(u)}
                        title="Excluir"
                      >
                        <FiTrash />
                        <span>Excluir</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="retorno-servico-table-container">
              <table className="retorno-servico-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th className="acoes-header">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="cliente">
                        <div className="cliente-info">
                          <div className="nome">{u.nome}</div>
                        </div>
                      </td>
                      <td className="servico">{u.email}</td>
                      <td>
                        <span className="status-badge">{u.perfilDescricao}</span>
                      </td>
                      <td className="acoes">
                        <div className="acoes-container">
                          {u.id !== principalId && (
                            <button 
                              className="btn-acao btn-edit"
                              onClick={() => handleOpenEdit(u)}
                              title="Editar"
                            >
                              <FiEdit />
                              <span>Editar</span>
                            </button>
                          )}
                          {u.id !== principalId && (
                            <button 
                              className="btn-acao btn-delete"
                              onClick={() => handleAskDelete(u)}
                              title="Excluir"
                            >
                              <FiTrash />
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </center>
      </div>
      <BottomNavigation />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editUser?.id ? 'Editar Usuário' : 'Novo Usuário'}>
        <div className="usuarios-modal">
          <div className="usuarios-modal-grid">
            <div className="usuarios-field">
              <label>Nome</label>
              <Input type="text" value={editUser?.nome || ''} onChange={(e) => setEditUser(prev => ({ ...prev, nome: e.target.value }))} className="form-input" />
            </div>
            <div className="usuarios-field">
              <label>E-mail</label>
              <Input type="email" value={editUser?.email || ''} onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))} className="form-input" />
            </div>
            <div className="usuarios-field">
              <label>Celular</label>
              <Input
                ref={celularMask}
                type="tel"
                value={editUser?.celular || ''}
                onChange={(e) => setEditUser(prev => ({ ...prev, celular: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="form-input"
              />
            </div>
            <div className="usuarios-field">
              <label>Perfil</label>
              <SearchableSelect
                options={perfisOptions}
                value={editUser?.perfilTipoId || null}
                onChange={(opt) => setEditUser(prev => ({ ...prev, perfilTipoId: opt ? opt.value : null }))}
                placeholder="Selecione o perfil"
              />
            </div>
          </div>
          <div className="usuarios-modal-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
      >
        <div className="delete-confirmation">
          <p style={{textAlign: 'left'}}>Tem certeza que deseja excluir este usuário?</p>
          {selectedUser && (
            <div className="retorno-info">
              <p><strong>Nome:</strong> {selectedUser.nome}</p>
              <p><strong>E-mail:</strong> {selectedUser.email}</p>
              <p><strong>Perfil:</strong> {selectedUser.perfilDescricao}</p>
            </div>
          )}
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Usuarios;