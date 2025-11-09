import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from './index';
import { Button } from '../index';
import { MainContext } from '../../helpers/MainContext';
import Api from '../../Api';

const hasAnyOpeningHours = (u) => {
  if (!u) return false;
  const fields = [
    u.SegSexInicio, u.SegSexFim,
    u.SabadoInicio, u.SabadoFim,
    u.DomingoInicio, u.DomingoFim,
    u.FeriadoInicio, u.FeriadoFim,
  ];
  return fields.some(v => v !== null && v !== undefined && String(v).trim() !== '');
};

const OpeningHoursRequiredModal = () => {
  const { authenticated, user, setUser } = useContext(MainContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);

  useEffect(() => {
    const fetchAndEvaluate = async () => {
      const onDadosCadastrais = location.pathname.includes('/dados-cadastrais');
      if (!authenticated || onDadosCadastrais) {
        setIsOpen(false);
        return;
      }
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsOpen(false);
        return;
      }
      try {
        const resp = await Api.get(token);
        if (resp && resp.status === 200) {
          const fetched = resp.data?.data;
          setRemoteUser(fetched);
          if (setUser) setUser(fetched);
          setIsOpen(!hasAnyOpeningHours(fetched));
        } else {
          // fallback para estado atual caso API falhe
          setIsOpen(!hasAnyOpeningHours(user));
        }
      } catch (err) {
        setIsOpen(!hasAnyOpeningHours(user));
      }
    };

    fetchAndEvaluate();
  }, [authenticated, location.pathname]);

  if (!authenticated) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { /* Modal obrigatório: não fechar */ }}
      title="Configurar horários de atendimento"
      showCloseButton={false}
      preventClose={true}
      size="medium"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: 8 }}>
        <img
          src="/time.png"
          alt="Horários de atendimento"
          style={{ width: 80, height: 80, objectFit: 'contain' }}
        />
        <div style={{ maxWidth: 520 }}>
          <h4 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Defina seus horários de atendimento</h4>
          <p style={{ marginTop: 8, fontSize: 14, color: '#4b5563' }}>
            Para receber agendamentos, é necessário configurar ao menos um período de <strong>abertura</strong> e <strong>fechamento</strong> do estabelecimento.
          </p>
          <div style={{ marginTop: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, color: '#374151' }}>
            <div style={{ fontSize: 13 }}>
              Você pode definir:
              <br />
              • Segunda a Sexta • Sábado • Domingo • Feriados
            </div>
          </div>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Button
            variant="primary"
            size="medium"
            onClick={() => {
              navigate('/dados-cadastrais');
            }}
          >
            Ajustar agora
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OpeningHoursRequiredModal;