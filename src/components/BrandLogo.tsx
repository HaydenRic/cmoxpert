import React from 'react';
import { BarChart3 } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
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
    sm: variant === 'icon-only' ? 'w-8 h-8' : 'h-8',
    md: variant === 'icon-only' ? 'w-10 h-10' : 'h-10',
    lg: variant === 'icon-only' ? 'w-16 h-16' : 'h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // Color scheme based on theme
  const logoColors = theme === 'dark' 
    ? {
        primary: 'from-cornsilk-200 to-cream-100',
        accent: 'from-tan-400 to-olive-400',
        text: 'text-white',
        iconPrimary: 'text-cornsilk-100',
        tagline: 'text-slate-300'
      }
    : {
        primary: 'from-charcoal-700 to-slate_blue-800',
        accent: 'from-tan-600 to-olive-600',
        text: 'text-charcoal-900',
        iconPrimary: 'text-white',
        tagline: 'text-slate-500'
      };

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <div className={`${sizeClasses[size]} relative ${className}`}>
        <div className={`w-full h-full bg-gradient-to-br ${logoColors.primary} rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-2 w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Central icon */}
          <div className="relative z-10">
            <BarChart3 className={`${iconSizes[size]} ${logoColors.iconPrimary}`} />
          </div>
          
          {/* Accent element */}
          <div className={`absolute top-1 right-1 w-2 h-2 bg-gradient-to-br ${logoColors.accent} rounded-full`}></div>
        </div>
      </div>
    );
  }

  // Text-only variant
  if (variant === 'text-only') {
    return (
      <div className={`flex items-center ${className}`}>
        <h1 className={`${textSizes[size]} font-bold ${logoColors.text} tracking-tight`}>
          cmo<span className="text-slate_blue-600">x</span>pert
        </h1>
      </div>
    );
  }

  // Default full logo
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon container */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className={`w-full h-full bg-gradient-to-br ${logoColors.primary} rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden`}>
          {/* Background pattern for data theme */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-2 w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Central icon - represents data intelligence */}
          <div className="relative z-10">
            <BarChart3 className={`${iconSizes[size]} ${logoColors.iconPrimary}`} />
          </div>
          
          {/* Accent dot for AI/intelligence theme */}
          <div className={`absolute top-1 right-1 w-2 h-2 bg-gradient-to-br ${logoColors.accent} rounded-full`}></div>
        </div>
      </div>
      
      {/* Text logo */}
      <div className="flex flex-col">
        <h1 className={`${textSizes[size]} font-bold ${logoColors.text} tracking-tight leading-none`}>
          cmo<span className="text-slate_blue-600">x</span>pert
        </h1>
        <p className={`${size === 'lg' ? 'text-sm' : 'text-xs'} ${logoColors.tagline} leading-none mt-0.5`}>
          AI Marketing Co-Pilot
        </p>
      </div>
    </div>
  );
}