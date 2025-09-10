import React from 'react';

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

  // Simple, bold geometric X that forms an upward arrow
  const LogoSymbol = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bold geometric X that forms an upward-trending arrow */}
        <g>
          {/* Left stroke of X - angled upward */}
          <path 
            d="M8 32 L20 8 L24 12 L12 36 Z" 
            fill="#4A90E2"
          />
          {/* Right stroke of X - angled upward */}
          <path 
            d="M32 32 L20 8 L16 12 L28 36 Z" 
            fill="#4A90E2"
          />
          {/* Top point - creates arrow effect */}
          <path 
            d="M16 12 L20 8 L24 12 L20 16 Z" 
            fill="#2D3748"
          />
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
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: '#2D3748' }}>
          cmo<span style={{ color: '#4A90E2' }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: '#6B7280' }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;