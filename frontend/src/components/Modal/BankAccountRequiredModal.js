import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from './index';
import { Button } from '../index';
import { MainContext } from '../../helpers/MainContext';
import Api from '../../Api';

const BankAccountRequiredModal = () => {
  const { authenticated, user } = useContext(MainContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [openingHoursConfigured, setOpeningHoursConfigured] = useState(true);

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

  useEffect(() => {
    const checkBankAccounts = async () => {
      const onDadosBancarios = location.pathname.includes('/dados-bancarios');
      if (!authenticated || onDadosBancarios) {
        setIsOpen(false);
        return;
      }
      // 1) Verificar se horários já estão configurados (para não sobrepor modais)
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userResp = await Api.get(token);
          const fetchedUser = userResp?.data?.data;
          const hasHours = hasAnyOpeningHours(fetchedUser);
          setOpeningHoursConfigured(hasHours);
          if (!hasHours) {
            setIsOpen(false);
            return; // ainda falta configurar horários, este modal não abre
          }
        }
      } catch (err) {
        // Se não conseguir verificar, não abre para evitar sobreposição
        setIsOpen(false);
        return;
      }

      // 2) Só então verificar dados bancários
      const idPontoAtendimento = user?.IdPontoAtendimento;
      if (!idPontoAtendimento) {
        setIsOpen(false);
        return;
      }
      try {
        const resp = await Api.getDadosBancarioByPontoAtendimento({ idPontoAtendimento });
        const list = resp?.data?.dadosBancarios || [];
        setIsOpen(Array.isArray(list) && list.length === 0);
      } catch (err) {
        setIsOpen(false);
      }
    };

    checkBankAccounts();
  }, [authenticated, user?.IdPontoAtendimento, location.pathname]);

  if (!authenticated) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { /* obrigatório: não fechar */ }}
      title="Cadastrar dados bancários"
      showCloseButton={false}
      preventClose={true}
      size="medium"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: 8 }}>
        <img
          src="/money.png"
          alt="Dados bancários"
          style={{ width: 80, height: 80, objectFit: 'contain' }}
        />
        <div style={{ maxWidth: 540 }}>
          <h4 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Você ainda não possui nenhuma conta bancária cadastrada</h4>
          <p style={{ marginTop: 8, fontSize: 14, color: '#4b5563' }}>
            Para receber seus repasses, é necessário cadastrar ao menos um método de recebimento
            (PIX ou transferência). Sem isso, os pagamentos não poderão ser efetuados.
          </p>
          <div style={{ marginTop: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, color: '#374151' }}>
            <div style={{ fontSize: 13 }}>
              Você pode cadastrar:
              <br />
              • Chave PIX (CPF/CNPJ/Email/Telefone/Aleatória)
              <br />
              • Dados bancários (Banco, Agência, Conta)
            </div>
          </div>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Button
            variant="primary"
            size="medium"
            onClick={() => {
              navigate('/dados-bancarios');
            }}
          >
            Cadastrar agora
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BankAccountRequiredModal;