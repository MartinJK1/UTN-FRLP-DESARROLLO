import React from 'react';
import '../assets/styles/customButton.css';

const CustomButton = ({ 
  children, 
  type = 'button', 
  disabled = false, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  onClick,
  ...props 
}) => {
  const baseClass = 'custom-btn';
  const variantClass = `custom-btn--${variant}`;
  const sizeClass = `custom-btn--${size}`;
  
  const buttonClass = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled}
      className={buttonClass}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default CustomButton;
