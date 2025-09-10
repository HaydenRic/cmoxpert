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

  // Minimalist Geometric Owl - inspired by clean, simple design
  const GeometricOwl = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 32 32"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Minimalist Geometric Owl */}
        <g>
          {/* Main body - rounded square/circle hybrid */}
          <rect 
            x="6" 
            y="8" 
            width="20" 
            height="20" 
            rx="10"
            fill={currentColors.mark}
          />
          
          {/* Eyes - two perfect circles positioned for owl character */}
          <circle 
            cx="13" 
            cy="16" 
            r="2.5" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
          />
          <circle 
            cx="19" 
            cy="16" 
            r="2.5" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
          />
          
          {/* Eye pupils - tiny dots for focus */}
          <circle 
            cx="13" 
            cy="16" 
            r="0.8" 
            fill={currentColors.mark}
          />
          <circle 
            cx="19" 
            cy="16" 
            r="0.8" 
            fill={currentColors.mark}
          />
          
          {/* Beak - simple triangle */}
          <path 
            d="M16 19 L14.5 22 L17.5 22 Z" 
            fill={theme === 'light' ? '#EAE0D5' : '#22333B'}
          />
          
          {/* Ear tufts - two small triangles for owl character */}
          <path 
            d="M10 6 L12 2 L14 6 Z" 
            fill={currentColors.mark}
          />
          <path 
            d="M18 6 L20 2 L22 6 Z" 
            fill={currentColors.mark}
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