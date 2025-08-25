import React, { useEffect, useState } from 'react';
import './style.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  size = 'medium', // small, medium, large
  onDropdownToggle,
  preventClose = false // Impede fechamento do modal
}) => {
  const [hasVisibleDropdown, setHasVisibleDropdown] = useState(false);

  // Controlar overflow baseado no dropdown
  useEffect(() => {
    if (onDropdownToggle) {
      onDropdownToggle(setHasVisibleDropdown);
    }
  }, [onDropdownToggle]);
  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && !preventClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventClose]);

  // Fechar modal com botão voltar do navegador
  useEffect(() => {
    if (isOpen) {
      // Adicionar estado no histórico quando modal abre
      window.history.pushState({ modalOpen: true }, '');
      
      const handlePopState = (event) => {
        if (event.state?.modalOpen && !preventClose) {
          onClose();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container modal-${size} ${hasVisibleDropdown ? 'dropdown-visible' : ''}`}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {showCloseButton && (
              <button 
                className="modal-close-button" 
                onClick={onClose}
                aria-label="Fechar modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
export { default as VideoInicialModal } from './VideoInicialModal';
export { default as VideoFinalizacaoModal } from './VideoFinalizacaoModal';
export { default as EspelhoFinanceiroViewModal } from './EspelhoFinanceiroViewModal';