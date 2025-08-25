import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import './style.css';

const SearchableSelect = ({ 
  options = [], 
  value = null, 
  onChange, 
  placeholder = "Selecione uma opção...",
  searchPlaceholder = "Pesquisar...",
  disabled = false,
  className = "",
  noOptionsText = "Nenhuma opção encontrada",
  onDropdownToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filtrar opções baseado no termo de pesquisa
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        if (onDropdownToggle) {
          onDropdownToggle(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onDropdownToggle]);

  // Focar no input de pesquisa quando abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Notificar mudança de estado do dropdown
  useEffect(() => {
    if (onDropdownToggle) {
      onDropdownToggle(isOpen);
    }
  }, [isOpen, onDropdownToggle]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
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

  const selectedOption = options.find(option => option.value === value);

  return (
    <div 
      ref={selectRef} 
      className={`searchable-select ${className} ${disabled ? 'disabled' : ''}`}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={`select-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <div className="select-value">
          {selectedOption ? (
            <span className="selected-text">{selectedOption.label}</span>
          ) : (
            <span className="placeholder-text">{placeholder}</span>
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
          <div className={`chevron ${isOpen ? 'rotated' : ''}`}>
            <FiChevronDown />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="select-dropdown">
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