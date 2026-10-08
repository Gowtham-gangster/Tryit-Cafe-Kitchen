import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, type = 'text', id, showPasswordToggle = true, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const computedType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#2B1408]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#8A6E5C]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={computedType}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] placeholder:text-[#8A6E5C] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A] transition-all disabled:opacity-50',
                icon && 'pl-9',
                isPasswordType && showPasswordToggle && 'pr-10',
                error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
                className
              )
            )}
            {...props}
          />
          {isPasswordType && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 p-1 text-[#8A6E5C] hover:text-[#2B1408] rounded-md transition-colors cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-[#8A6E5C]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
