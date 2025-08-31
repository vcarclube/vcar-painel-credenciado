import React from 'react';
import './style.css';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`input-component ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
