import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = "swiss-button border-4 border-swiss-black font-black uppercase tracking-tighter transition-all active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]";

  const variants = {
    primary: "bg-swiss-red text-swiss-white hover:bg-swiss-black hover:text-swiss-white",
    secondary: "bg-swiss-blue text-swiss-white hover:bg-swiss-black hover:text-swiss-white",
    danger: "bg-red-500 text-white hover:bg-black",
    ghost: "bg-transparent text-swiss-black hover:bg-swiss-black hover:text-swiss-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-8 py-4 text-sm",
    lg: "px-12 py-6 text-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
