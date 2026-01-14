
import React from 'react';
import { UI_TRANSITIONS } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = `px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider ${UI_TRANSITIONS} disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-sm hover:shadow-md`;
  
  const variants = {
    primary: 'bg-[#EA580C] text-white hover:bg-[#F97316]',
    secondary: 'bg-[#0F766E] text-white hover:bg-[#14B8A6]',
    outline: 'border-2 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white',
    ghost: 'text-[#1F2937] hover:bg-gray-100',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
