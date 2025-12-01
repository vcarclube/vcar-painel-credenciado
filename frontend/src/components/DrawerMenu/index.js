import React, { useState, useEffect, useContext } from 'react';
import {
  FiX,
  FiChevronDown,
  FiTruck,
  FiClipboard,
  FiPackage,
  FiMapPin,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiInfo,
  FiBarChart,
  FiFileText,
  FiPhone,
  FiMail,
  FiHelpCircle,
  FiHeadphones,
  FiShield,
  FiBookOpen,
  FiUsers
} from 'react-icons/fi';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { MainContext } from '../../helpers/MainContext';

const DrawerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useContext(MainContext);
  const isAdministrativo = user?.Administrativo === 'S';
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Fechar drawer ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const menuItems = [
    {
      id: 'operacoes',
      label: 'Operações',
      icon: FiTruck,
      hasDropdown: true,
      subItems: [
        { id: 'retorno-servico', label: 'Retorno de Serviço', icon: FiClipboard, path: '/retorno-servico' },
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: FiDollarSign,
      hasDropdown: true,
      subItems: [
        { id: 'dados-bancarios', label: 'Dados Bancários', icon: FiFileText, path: '/dados-bancarios' },
        { id: 'espelho', label: 'Espelho', icon: FiFileText, path: '/espelho' },
      ]
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: FiUsers,
      hasDropdown: false,
      path: '/usuarios'
    },
    {
      id: 'informacoes',
      label: 'Informações',
      icon: FiInfo,
      hasDropdown: true,
      subItems: [
        { id: 'contratos', label: 'Contratos', icon: FiFileText, path: '/contratos' },
        { id: 'policy', label: 'Política de Privacidade', icon: FiShield, path: '/policy' },
        { id: 'terms', label: 'Termos de Uso', icon: FiBookOpen, path: '/terms' },
        { id: 'tabeladeservicos', label: 'Tabela de Serviços', icon: FiBookOpen, path: '/tabela-precos' }
      ]
    }
  ];

  const handleItemClick = (item) => {
    if (item.hasDropdown) {
      toggleDropdown(item.id);
    } else {
      //Aqui você pode adicionar navegação real
      navigate(item.path);
      onClose();
    }
  };

  const handleSubItemClick = (subItem) => {
    // Aqui você pode adicionar navegação real
     navigate(subItem.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer-menu ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">Menu Principal</h3>
          <button className="drawer-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="drawer-content">
          {(isAdministrativo ? menuItems : menuItems.filter(i => i.id === 'operacoes')).map((item) => {
            const IconComponent = item.icon;
            const isDropdownOpen = openDropdowns[item.id];
            
            return (
              <div key={item.id} className="drawer-section">
                <button
                  className={`drawer-item ${isDropdownOpen ? 'expanded' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="drawer-item-content">
                    <div className="drawer-item-left">
                      <div className="drawer-item-icon">
                        <IconComponent />
                      </div>
                      <span className="drawer-item-text">{item.label}</span>
                    </div>
                    {item.hasDropdown && (
                      <div className="drawer-item-arrow">
                        <FiChevronDown />
                      </div>
                    )}
                  </div>
                </button>
                
                {item.hasDropdown && (
                  <div className={`drawer-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                    {item.subItems.map((subItem) => {
                      const SubIconComponent = subItem.icon;
                      
                      return (
                        <button
                          key={subItem.id}
                          className="drawer-dropdown-item"
                          onClick={() => handleSubItemClick(subItem)}
                        >
                          <SubIconComponent style={{ marginRight: '8px', fontSize: '14px' }} />
                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DrawerMenu;