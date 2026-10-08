import React from 'react';
import { Coffee } from 'lucide-react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-[#FE8E2A] border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Preparing TryIt Delights...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-[#FBEFE1] border border-[#FE8E2A]/30 flex items-center justify-center text-[#FE8E2A] shadow-sm">
          <Coffee size={32} className="animate-bounce" />
        </div>
      </div>
      <p className="text-xs sm:text-sm font-bold text-[#7A5C4A] font-serif animate-pulse">
        {text}
      </p>
    </div>
  );
};
