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

  // Using site's actual color palette
  const colors = {
    light: {
      primary: '#22333B', // slate_blue
      accent: '#5E503F',  // olive
      text: '#0A0908',    // charcoal
      textMuted: '#6B7280'
    },
    dark: {
      primary: '#EAE0D5', // cream
      accent: '#C6AC8F',  // tan
      text: '#F8F8F8',
      textMuted: '#D1D5DB'
    }
  };

  const currentColors = colors[theme];

  // Sophisticated abstract mark: interconnected nodes converging to strategic clarity
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
          {/* Outer data nodes - positioned at strategic points */}
          <circle cx="8" cy="8" r="2" fill={currentColors.primary} opacity="0.7" />
          <circle cx="32" cy="8" r="2" fill={currentColors.primary} opacity="0.7" />
          <circle cx="8" cy="32" r="2" fill={currentColors.primary} opacity="0.7" />
          <circle cx="32" cy="32" r="2" fill={currentColors.primary} opacity="0.7" />
          
          {/* Subtle connecting pathways - flowing curves leading to center */}
          <path 
            d="M8 8 Q14 14 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.5"
            strokeLinecap="round"
          />
          <path 
            d="M32 8 Q26 14 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.5"
            strokeLinecap="round"
          />
          <path 
            d="M8 32 Q14 26 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.5"
            strokeLinecap="round"
          />
          <path 
            d="M32 32 Q26 26 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="1.5" 
            opacity="0.5"
            strokeLinecap="round"
          />
          
          {/* Central convergence point - the strategic insight */}
          <circle cx="20" cy="20" r="5" fill={currentColors.primary} />
          
          {/* Inner clarity indicator - subtle geometric accent */}
          <circle cx="20" cy="20" r="2" fill={currentColors.accent} />
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