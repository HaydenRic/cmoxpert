import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Compass } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-slate-200 rounded-lg animate-pulse ${className}`} />
    );
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className={`${sizeClasses[size]} object-contain rounded-lg ${className}`}
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

  // Default fallback logo
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-pakistan_green-900 to-dark_moss_green-600 rounded-lg flex items-center justify-center ${className}`}>
      <Compass className={`${iconSizes[size]} text-white`} />
    </div>
  );
}