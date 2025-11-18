import React, { useState, useContext } from 'react';
import {
  FiCalendar,
  FiStar,
  FiMaximize,
  FiMenu,
  FiDollarSign
} from 'react-icons/fi';
import DrawerMenu from '../DrawerMenu';
import './style.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainContext } from '../../helpers/MainContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useContext(MainContext);
  const isAdministrativo = user?.Administrativo === 'S';

  const navigationItems = [
    {
      id: 'agenda',
      label: 'Agenda',
      icon: FiCalendar,
      path: '/'
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      icon: FiStar,
      path: '/avaliacoes'
    },
    {
      id: 'scan',
      label: 'Consultar',
      icon: FiMaximize,
      path: '/scan'
    },
    {
      id: 'espelho',
      label: 'Financeiro',
      icon: FiDollarSign,
      path: '/espelho'
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: FiMenu,
      action: () => setIsDrawerOpen(true)
    }
  ];

  const items = isAdministrativo ? navigationItems : navigationItems.filter(i => ['agenda','avaliacoes','scan','menu'].includes(i.id));

  const getActiveTab = () => {
    const currentPath = location.pathname;
    
    // Verificar se está na página de execução de OS (que faz parte da agenda)
    if (currentPath.includes('/execucao-os/')) {
      return 'agenda';
    }
    
    // Verificar outras rotas
    const activeItem = items.find(item => {
      if (item.path === '/') {
        return currentPath === '/';
      }
      return currentPath === item.path;
    });
    
    return activeItem ? activeItem.id : null;
  };

  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <nav className="bottom-navigation">
        <div className="bottom-nav-container">
          {items.map((item) => {
            const IconComponent = item.icon;
            const isActive = getActiveTab() === item.id;
            
            return (
              <button
                key={item.id}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item)}
                type="button"
              >
                <div className="bottom-nav-icon">
                  <IconComponent />
                </div>
                <span className="bottom-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
};

export default BottomNavigation;