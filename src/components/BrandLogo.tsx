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

  // Colors from site palette
  const colors = {
    light: {
      primary: '#22333B', // slate_blue (dark blue-gray)
      accent: '#5E503F',  // olive (sophisticated brown)
      text: '#0A0908',    // charcoal (deep black)
      textMuted: '#6B7280' // gray for tagline
    },
    dark: {
      primary: '#EAE0D5', // cream
      accent: '#C6AC8F',  // tan
      text: '#F8F8F8',    // light
      textMuted: '#D1D5DB'
    }
  };

  const currentColors = colors[theme];

  // Sophisticated abstract mark: interconnected nodes converging to a strategic point
  const LogoSymbol = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract geometric mark representing data convergence to insight */}
        <g>
          {/* Outer data nodes - scattered points */}
          <circle cx="8" cy="12" r="2.5" fill={currentColors.primary} opacity="0.6" />
          <circle cx="32" cy="16" r="2.5" fill={currentColors.primary} opacity="0.6" />
          <circle cx="6" cy="28" r="2.5" fill={currentColors.primary} opacity="0.6" />
          <circle cx="34" cy="32" r="2.5" fill={currentColors.primary} opacity="0.6" />
          
          {/* Connecting pathways - subtle curves leading to center */}
          <path 
            d="M8 12 Q16 16 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.4"
            strokeLinecap="round"
          />
          <path 
            d="M32 16 Q26 18 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.4"
            strokeLinecap="round"
          />
          <path 
            d="M6 28 Q12 24 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.4"
            strokeLinecap="round"
          />
          <path 
            d="M34 32 Q28 26 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.4"
            strokeLinecap="round"
          />
          
          {/* Central strategic point - the insight/clarity */}
          <circle cx="20" cy="20" r="4" fill={currentColors.primary} />
          
          {/* Strategic direction indicator - subtle geometric form */}
          <path 
            d="M20 16 L24 20 L20 24 L20 20 Z" 
            fill={currentColors.accent}
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
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: currentColors.text }}>
          cmo<span style={{ color: currentColors.accent }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: currentColors.textMuted }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <LogoSymbol />
      <div className="flex flex-col">
        <div className={`font-bold ${textSizeClasses[size]}`} style={{ color: currentColors.text }}>
          cmo<span style={{ color: currentColors.accent }}>x</span>pert
        </div>
        <div className={`${taglineSizeClasses[size]} font-medium`} style={{ color: currentColors.textMuted }}>
          AI Marketing Co-Pilot
        </div>
      </div>
    </div>
  );
};

export default BrandLogo;