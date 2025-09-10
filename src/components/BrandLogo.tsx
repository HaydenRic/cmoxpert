import React from 'react';
import { BarChart3 } from 'lucide-react';

interface BrandLogoProps {
  variant?: 'default' | 'icon-only' | 'text-only';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'default', 
  size = 'md',
  theme = 'light'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Abstract geometric logo symbol
  const LogoSymbol = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background complex data lines */}
        <g opacity="0.3">
          <path d="M5 15 L12 8 L18 12 L25 5" stroke="#2D3748" strokeWidth="1" fill="none"/>
          <path d="M8 25 L15 18 L22 22 L30 15" stroke="#2D3748" strokeWidth="1" fill="none"/>
          <path d="M3 30 L10 23 L17 27 L24 20" stroke="#2D3748" strokeWidth="1" fill="none"/>
          <circle cx="12" cy="8" r="1.5" fill="#2D3748"/>
          <circle cx="25" cy="5" r="1.5" fill="#2D3748"/>
          <circle cx="30" cy="15" r="1.5" fill="#2D3748"/>
        </g>
        
        {/* Main strategic advantage shape - upward trending arrow/lens */}
        <g>
          {/* Main geometric form */}
          <path 
            d="M10 28 L20 12 L30 16 L25 32 Z" 
            fill="#4A90E2" 
            stroke="#4A90E2" 
            strokeWidth="1"
          />
          {/* Strategic focus element */}
          <path 
            d="M15 20 L25 16 L22 24 Z" 
            fill="#2D3748" 
            opacity="0.8"
          />
          {/* Key insight points */}
          <circle cx="20" cy="18" r="2" fill="#F7FAFC"/>
          <circle cx="23" cy="22" r="1.5" fill="#F7FAFC"/>
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <LogoSymbol />;
  }

  if (variant === 'text-only') {
    return (
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]} text-gray-900`}>
          cmo<span className="text-blue-600">x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} text-gray-600 font-medium`}>
          AI Marketing Co-Pilot
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <LogoSymbol />
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]} text-gray-900`}>
          cmo<span className="text-blue-600">x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} text-gray-600 font-medium`}>
          AI Marketing Co-Pilot
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;