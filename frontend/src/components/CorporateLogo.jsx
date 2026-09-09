import React from 'react';

/**
 * Corporate Technologies Official Brand Logo
 * Matches the official branding of Corporate Technologies BD
 */
export default function CorporateLogo({ 
  className = "h-8 sm:h-9 md:h-10", 
  variant = null, // 'white' | 'red' | 'dark'
  inverted = false, 
  invertedOnMobile = false,
  showTagline = false 
}) {
  // If inverted is true, use white logo for dark/red backgrounds
  const isWhite = variant === 'white' || inverted;
  
  // Select source image based on theme
  const src = isWhite 
    ? '/corporate-logo-white.png' 
    : (variant === 'dark' ? '/corporate-logo-dark.png' : '/corporate-logo-red.png');

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={src}
        alt="Corporate Technologies BD"
        className="h-full w-auto max-h-12 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        loading="eager"
        fetchPriority="high"
      />
      {showTagline && (
        <span className={`text-[10px] font-medium tracking-wide hidden sm:inline ${isWhite ? 'text-white/80' : 'text-[#c92127]'}`}>
          Quality Products at Better Price
        </span>
      )}
    </div>
  );
}
