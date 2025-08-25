import React from 'react';
import './style.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) {
  const buttonClass = `
    button-component 
    button-${variant} 
    button-${size} 
    ${loading ? 'button-loading' : ''} 
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="button-spinner"></span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
