import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import './style.css';

const SearchableSelect = ({ 
  options = [], 
  value = null, 
  onChange, 
  placeholder = "Selecione uma opção...",
  searchPlaceholder = "  Pesquisar...",
  disabled = false,
  className = "",
  noOptionsText = "Nenhuma opção encontrada",
  onDropdownToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Encontrar a opção selecionada
  const selectedOption = options.find(option => option.value === value);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Focar no input de busca quando abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      //searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Calcular posição do dropdown
  const calculateDropdownPosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left + scrollLeft,
        width: rect.width
      });
    }
  };

  // Notificar mudança de estado do dropdown
  useEffect(() => {
    if (onDropdownToggle) {
      onDropdownToggle(isOpen);
    }
  }, [isOpen, onDropdownToggle]);

  // Atualizar posição quando abrir o dropdown
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
      
      const handleResize = () => calculateDropdownPosition();
      const handleScroll = () => calculateDropdownPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      setSearchTerm('');
      
      // Notificar o Modal sobre o estado do dropdown
      if (onDropdownToggle) {
        onDropdownToggle(newIsOpen);
      }
    }
  };

  const handleOptionSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div 
      ref={selectRef}
      className={`searchable-select ${className} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="select-trigger"
        onClick={handleToggle}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="select-content">
          {selectedOption ? (
            <div className="selected-option">
              <span className="selected-label">{selectedOption.label}</span>
              {selectedOption.description && (
                <span className="selected-description">{selectedOption.description}</span>
              )}
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        
        <div className="select-actions">
          {selectedOption && !disabled && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Limpar seleção"
            >
              <FiX />
            </button>
          )}
          <div className={`chevron ${isOpen ? 'open' : ''}`}>
            <FiChevronDown />
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="select-dropdown"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="options-container">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`select-option ${selectedOption?.value === option.value ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="option-label">{option.label}</span>
                  {option.description && (
                    <span className="option-description">{option.description}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="no-options">
                {noOptionsText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;