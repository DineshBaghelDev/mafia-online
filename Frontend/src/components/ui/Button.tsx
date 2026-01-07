import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function Button({ className, variant = 'primary', fullWidth, ...props }: ButtonProps) {
  const baseStyles = "h-12 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-primary text-white hover:shadow-[0_0_15px_rgba(230,57,70,0.4)] hover:bg-[#ff4d5a]",
    secondary: "bg-secondary text-white hover:bg-[#5a9bc4]",
    outline: "border-2 border-muted text-text hover:border-text hover:bg-white/5",
    ghost: "text-muted hover:text-text"
  };

  return (
    <button 
      className={twMerge(baseStyles, variants[variant], fullWidth && "w-full", className)} 
      {...props} 
    />
  );
}
