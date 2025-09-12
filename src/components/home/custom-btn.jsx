import React from 'react';
import './custombtn.css';

const CustomButton = ({ children }) => {
  return (
    <button className="button-name rounded-full" type="button">
      {children}
    </button>
  );
};
export default CustomButton;
