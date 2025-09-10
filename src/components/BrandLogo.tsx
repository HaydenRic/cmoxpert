import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'icon-only' | 'text-only';
  theme?: 'light' | 'dark';
}

export function BrandLogo({ 
  className = '', 
  size = 'md', 
  variant = 'default',
  theme = 'light'
}: BrandLogoProps) {
  const sizeClasses = {
    sm: variant === 'icon-only' ? 'w-6 h-6' : 'h-6',
    md: variant === 'icon-only' ? 'w-8 h-8' : 'h-8',
    lg: variant === 'icon-only' ? 'w-12 h-12' : 'h-12',
    xl: variant === 'icon-only' ? 'w-16 h-16' : 'h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const logoSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 }
  };

  // Color scheme based on theme
  const colors = theme === 'dark' 
    ? {
        primary: '#EAE0D5', // cornsilk
        accent: '#22333B', // dark_moss_green
        text: 'text-white',
        tagline: 'text-slate-300'
      }
    : {
        primary: '#22333B', // dark_moss_green (deep charcoal from site)
        accent: '#5E503F', // tiger_s_eye (strategic accent from site)
        text: 'text-slate-900',
        tagline: 'text-slate-500'
      };

  // Abstract geometric logo mark
  const LogoMark = ({ width, height }: { width: number; height: number }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Complex data lines (background) */}
      <g opacity="0.3">
        <path 
          d="M2 28 L8 24 L12 26 L18 20 L22 22 L30 16" 
          stroke={colors.primary} 
          strokeWidth="1" 
          fill="none"
        />
        <path 
          d="M2 24 L6 22 L10 25 L16 19 L20 21 L30 14" 
          stroke={colors.primary} 
          strokeWidth="0.8" 
          fill="none"
        />
        <path 
          d="M2 26 L7 23 L11 24 L17 18 L21 20 L30 12" 
          stroke={colors.primary} 
          strokeWidth="0.6" 
          fill="none"
        />
      </g>
      
      {/* Strategic advantage arrow/lens (foreground) */}
      <g>
        {/* Main geometric shape - represents focused insight */}
        <path 
          d="M8 20 L16 12 L24 16 L20 24 Z" 
          fill={colors.accent}
        />
        
        {/* Upward trending element */}
        <path 
          d="M16 12 L24 4 L28 8 L20 16 Z" 
          fill={colors.primary}
        />
        
        {/* Data point indicators */}
        <circle cx="12" cy="16" r="1.5" fill={colors.accent} />
        <circle cx="20" cy="20" r="1.5" fill={colors.primary} />
        <circle cx="24" cy="12" r="1" fill={colors.accent} />
      </g>
    </svg>
  );

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <div className={cn(sizeClasses[size], className)}>
        <LogoMark {...logoSizes[size]} />
      </div>
    );
  }

  // Text-only variant
  if (variant === 'text-only') {
    return (
      <div className={cn("flex items-center", className)}>
        <h1 className={cn(textSizes[size], "font-bold tracking-tight", colors.text)}>
          cmo<span style={{ color: colors.accent }}>x</span>pert
        </h1>
      </div>
    );
  }

  // Default full logo
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <LogoMark {...logoSizes[size]} />
      
      <div className="flex flex-col">
        <h1 className={cn(textSizes[size], "font-bold tracking-tight leading-none", colors.text)}>
          cmo<span style={{ color: colors.accent }}>x</span>pert
        </h1>
        <p className={cn(
          size === 'xl' ? 'text-sm' : size === 'lg' ? 'text-xs' : 'text-xs', 
          "leading-none mt-0.5", 
          colors.tagline
        )}>
          AI Marketing Co-Pilot
        </p>
      </div>
    </div>
  );
}