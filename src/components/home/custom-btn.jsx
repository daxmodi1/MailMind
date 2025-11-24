import React from 'react';
import './custombtn.css';

const CustomButton = ({ children, onClick, className, ...props }) => {
  return (
    <button 
      className={`button-name rounded-full ${className || ''}`} 
      type="button"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
export default CustomButton;
