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
      accent: '#0A0908',  // charcoal
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

  // Abstract mark: sophisticated geometric form suggesting strategic guidance
  const LogoSymbol = () => (
    <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract geometric mark representing strategic guidance and synthesis */}
        <g>
          {/* Outer ring - representing comprehensive data collection */}
          <circle 
            cx="20" 
            cy="20" 
            r="16" 
            stroke={currentColors.primary} 
            strokeWidth="2" 
            fill="none"
            opacity="0.6"
          />
          
          {/* Inner convergence paths - three strategic vectors */}
          <path 
            d="M8 20 Q14 14 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="3" 
            strokeLinecap="round"
            fill="none"
          />
          <path 
            d="M32 20 Q26 14 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="3" 
            strokeLinecap="round"
            fill="none"
          />
          <path 
            d="M20 32 Q20 26 20 20" 
            stroke={currentColors.primary} 
            strokeWidth="3" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Central insight point - the strategic clarity */}
          <circle 
            cx="20" 
            cy="20" 
            r="4" 
            fill={currentColors.accent}
          />
          
          {/* Subtle directional indicator - upward strategic path */}
          <path 
            d="M20 20 L20 8" 
            stroke={currentColors.accent} 
            strokeWidth="2" 
            strokeLinecap="round"
            opacity="0.8"
          />
          <path 
            d="M17 11 L20 8 L23 11" 
            stroke={currentColors.accent} 
            strokeWidth="2" 
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
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
      <LogoSymbol />
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