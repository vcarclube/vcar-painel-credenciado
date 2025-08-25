import React from 'react';
import './style.css';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`input-component ${className}`}
      {...props}
    />
  );
}
