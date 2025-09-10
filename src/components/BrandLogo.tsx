import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, Brain } from 'lucide-react';

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
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      // Import configuration status
      const { isSupabaseConfigured } = await import('../lib/supabase');
      
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const { supabase } = await import('../lib/supabase');
      
      if (!supabase) {
        setLoading(false);
        return;
      }

      // List files in branding bucket to find logo
      const { data: files, error } = await supabase.storage
        .from('branding')
        .list();

      if (error) {
        console.log('Could not load logo from Supabase - using fallback');
        setLoading(false);
        return;
      }
      
      if (!files) {
        setLoading(false);
        return;
      }

      // Find logo file
      const logoFile = files.find(file => 
        file.name.startsWith('logo.') && 
        ['png', 'jpg', 'jpeg', 'svg'].includes(file.name.split('.').pop()?.toLowerCase() || '')
      );

      if (logoFile) {
        const { data } = supabase.storage
          .from('branding')
          .getPublicUrl(logoFile.name);
        setLogoUrl(data.publicUrl);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: variant === 'icon-only' ? 'w-8 h-8' : 'h-8',
    md: variant === 'icon-only' ? 'w-10 h-10' : 'h-10',
    lg: variant === 'icon-only' ? 'w-16 h-16' : 'h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-slate-200 rounded-xl animate-pulse ${className}`} />
    );
  }

  if (logoUrl && variant !== 'icon-only') {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className={`${sizeClasses[size]} object-contain ${className}`}
        data-logo
        onError={(e) => {
          // Fallback to default logo if image fails to load
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
    );
  }

  // Modern data-driven logo design
  const logoColors = theme === 'dark' 
    ? {
        primary: 'from-cornsilk-200 to-cream-100',
        secondary: 'from-slate_blue-400 to-charcoal-300',
        accent: 'from-tan-400 to-olive-400',
        text: 'text-white',
        iconPrimary: 'text-cornsilk-100',
        iconSecondary: 'text-slate_blue-300'
      }
    : {
        primary: 'from-charcoal-700 to-slate_blue-800',
        secondary: 'from-slate_blue-600 to-charcoal-700',
        accent: 'from-tan-600 to-olive-600',
        text: 'text-charcoal-900',
        iconPrimary: 'text-white',
        iconSecondary: 'text-slate_blue-100'
      };

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <div className={`${sizeClasses[size]} relative ${className}`}>
        {/* Main container with gradient background */}
        <div className={`w-full h-full bg-gradient-to-br ${logoColors.primary} rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-2 w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Central icon - data visualization symbol */}
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
      <div className={`${variant === 'default' ? sizeClasses[size] : 'w-10 h-10'} relative`}>
        <div className={`w-full h-full bg-gradient-to-br ${logoColors.primary} rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden`}>
          {/* Background pattern for data theme */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-2 w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          {/* Central icon - represents data intelligence */}
          <div className="relative z-10">
            <BarChart3 className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'} ${logoColors.iconPrimary}`} />
          </div>
          
          {/* Accent dot for AI/intelligence theme */}
          <div className={`absolute top-1 right-1 w-2 h-2 bg-gradient-to-br ${logoColors.accent} rounded-full`}></div>
        </div>
      </div>
      
      {/* Text logo */}
      <div className="flex flex-col">
        <h1 className={`${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'} font-bold ${logoColors.text} tracking-tight leading-none`}>
          cmo<span className="text-slate_blue-600">x</span>pert
        </h1>
        <p className={`${size === 'lg' ? 'text-sm' : 'text-xs'} text-slate-500 leading-none mt-0.5`}>
          AI Marketing Co-Pilot
        </p>
      </div>
    </div>
  );
}