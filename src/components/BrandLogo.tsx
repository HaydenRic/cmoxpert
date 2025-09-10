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

  // Brand colors from your palette
  const colors = {
    light: {
      primary: '#22333B',    // slate_blue
      accent: '#0A0908',     // charcoal
      text: '#0A0908',       // charcoal
      textMuted: '#5E503F'   // olive
    },
    dark: {
      primary: '#EAE0D5',    // cream
      accent: '#C6AC8F',     // tan
      text: '#EAE0D5',       // cream
      textMuted: '#C6AC8F'   // tan
    }
  };

  const currentColors = colors[theme];

  // Geometric Owl Mark - minimalist and abstract
  const OwlMark = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Geometric Owl constructed from simple shapes */}
        <g>
          {/* Head - main circle */}
          <circle 
            cx="20" 
            cy="18" 
            r="14" 
            fill={currentColors.primary}
          />
          
          {/* Eyes - two smaller circles positioned for owl-like appearance */}
          <circle 
            cx="16" 
            cy="15" 
            r="3" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
          />
          <circle 
            cx="24" 
            cy="15" 
            r="3" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
          />
          
          {/* Eye pupils - tiny circles for focus/intelligence */}
          <circle 
            cx="16" 
            cy="15" 
            r="1" 
            fill={currentColors.primary}
          />
          <circle 
            cx="24" 
            cy="15" 
            r="1" 
            fill={currentColors.primary}
          />
          
          {/* Beak - simple triangle pointing down */}
          <path 
            d="M20 18 L18 22 L22 22 Z" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
          />
          
          {/* Ear tufts - two triangular shapes for owl character */}
          <path 
            d="M12 8 L16 4 L20 8 Z" 
            fill={currentColors.primary}
          />
          <path 
            d="M20 8 L24 4 L28 8 Z" 
            fill={currentColors.primary}
          />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <OwlMark />;
  }

  if (variant === 'text-only') {
    return (
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: currentColors.text }}>
          cmo<span style={{ color: currentColors.primary }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: currentColors.textMuted }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <OwlMark />
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: currentColors.text }}>
          cmo<span style={{ color: currentColors.primary }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: currentColors.textMuted }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;