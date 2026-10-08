import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40';

    const variants = {
      primary: 'bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white shadow-md shadow-[#FE8E2A]/25',
      secondary: 'bg-[#2B1408] hover:bg-[#4A2B18] active:bg-[#1E0D05] text-white shadow-sm',
      outline: 'bg-white hover:bg-[#FDF6EE] text-[#2B1408] border border-[#EEDDCC] shadow-xs hover:border-[#FE8E2A]',
      destructive: 'bg-red-600 hover:bg-red-500 text-white shadow-sm',
      ghost: 'bg-transparent hover:bg-[#FDF6EE] text-[#2B1408]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-xs sm:text-sm',
      lg: 'px-7 py-3.5 text-sm sm:text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
