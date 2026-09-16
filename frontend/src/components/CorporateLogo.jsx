import React from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * Corporate Technologies Official Brand Logo
 * Matches the official branding and live admin customizer
 */
export default function CorporateLogo({ 
  className = "h-8 sm:h-9 md:h-10", 
  variant = null, // 'white' | 'red' | 'dark'
  inverted = false, 
  invertedOnMobile = false,
  showTagline = false 
}) {
  const { branding } = useSettings();

  // If inverted is true, use white logo for dark/red backgrounds
  const isWhite = variant === 'white' || inverted;
  
  // Select source image based on theme and admin settings
  let src = isWhite 
    ? (branding?.white_logo_url || '/corporate-logo-white.png') 
    : (variant === 'dark' ? (branding?.dark_logo_url || '/corporate-logo-dark.png') : (branding?.logo_url || '/corporate-logo-red.png'));

  const siteTitle = branding?.site_title || "Corporate Technologies BD";
  const tagline = branding?.tagline || "Quality Products at Better Price";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={src}
        alt={siteTitle}
        className="h-full w-auto max-h-12 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        loading="eager"
        fetchPriority="high"
        onError={(e) => {
          // Fallback to default red logo if custom image fails to load
          if (e.target.src !== '/corporate-logo-red.png') {
            e.target.src = '/corporate-logo-red.png';
          }
        }}
      />
      {showTagline && (
        <span 
          style={{ color: isWhite ? 'rgba(255,255,255,0.85)' : 'var(--brand-primary, #c92127)' }}
          className="text-[10px] font-medium tracking-wide hidden sm:inline"
        >
          {tagline}
        </span>
      )}
    </div>
  );
}
