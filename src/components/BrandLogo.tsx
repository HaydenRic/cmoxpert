import React from 'react';

interface BrandLogoProps {
  variant?: 'default' | 'icon-only' | 'text-only';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'text-only', 
  size = 'md',
  theme = 'light'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  const taglineSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Brand colors from your palette
  const colors = {
    light: {
      mark: '#22333B',       // slate_blue for the owl mark
      text: '#0A0908',       // charcoal for main text
      accent: '#22333B',     // slate_blue for the 'x'
      tagline: '#5E503F'     // olive for tagline
    },
    dark: {
      mark: '#EAE0D5',       // cream for dark backgrounds
      text: '#EAE0D5',       // cream for main text
      accent: '#C6AC8F',     // tan for the 'x'
      tagline: '#C6AC8F'     // tan for tagline
    }
  };

  const currentColors = colors[theme];

  // Minimalist Geometric Owl - inspired by sophisticated, clean design
  const GeometricOwl = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 32 32"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Minimalist Geometric Owl inspired by reference */}
        <g>
          {/* Main body - elegant rounded form */}
          <path 
            d="M16 4 C22 4 26 8 26 14 L26 22 C26 26 22 28 16 28 C10 28 6 26 6 22 L6 14 C6 8 10 4 16 4 Z"
            fill={currentColors.mark}
          />
          
          {/* Large circular eyes - key owl characteristic */}
          <circle 
            cx="12" 
            cy="14" 
            r="4" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
            stroke={theme === 'light' ? '#22333B' : '#EAE0D5'}
            strokeWidth="0.5"
          />
          <circle 
            cx="20" 
            cy="14" 
            r="4" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
            stroke={theme === 'light' ? '#22333B' : '#EAE0D5'}
            strokeWidth="0.5"
          />
          
          {/* Inner eye circles for depth */}
          <circle 
            cx="12" 
            cy="14" 
            r="2.5" 
            fill={currentColors.mark}
            opacity="0.3"
          />
          <circle 
            cx="20" 
            cy="14" 
            r="2.5" 
            fill={currentColors.mark}
            opacity="0.3"
          />
          
          {/* Eye pupils - focused intelligence */}
          <circle 
            cx="12" 
            cy="14" 
            r="1.2" 
            fill={currentColors.mark}
          />
          <circle 
            cx="20" 
            cy="14" 
            r="1.2" 
            fill={currentColors.mark}
          />
          
          {/* Minimalist beak - simple geometric triangle */}
          <path 
            d="M16 18 L14 21 L18 21 Z" 
            fill={theme === 'light' ? '#5E503F' : '#C6AC8F'}
          />
          
          {/* Subtle ear tufts - geometric triangular forms */}
          <path 
            d="M10 6 L12 2 L14 6 Z" 
            fill={currentColors.mark}
          />
          <path 
            d="M18 6 L20 2 L22 6 Z" 
            fill={currentColors.mark}
          />
          
          {/* Abstract data/insight element - subtle geometric pattern in chest */}
          <circle 
            cx="16" 
            cy="22" 
            r="1.5" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
            opacity="0.6"
          />
          <circle 
            cx="13" 
            cy="20" 
            r="0.8" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
            opacity="0.4"
          />
          <circle 
            cx="19" 
            cy="20" 
            r="0.8" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
            opacity="0.4"
          />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <GeometricOwl />;
  }

  if (variant === 'text-only') {
    return (
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: currentColors.text }}>
          cmo<span style={{ color: currentColors.accent }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: currentColors.tagline }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <GeometricOwl />
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: currentColors.text }}>
          cmo<span style={{ color: currentColors.accent }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: currentColors.tagline }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;