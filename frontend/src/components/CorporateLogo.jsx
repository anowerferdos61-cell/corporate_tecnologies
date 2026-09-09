import React from 'react';

/**
 * Corporate Technologies Official Brand Logo
 * Matches the branding of corporatetechbd.com
 */
export default function CorporateLogo({ className = "h-10", showTagline = false, inverted = false, invertedOnMobile = false }) {
  const strokeClass = invertedOnMobile 
    ? 'text-white lg:text-[#c92127]' 
    : (inverted ? 'text-white' : 'text-[#c92127]');

  const titleClass = invertedOnMobile 
    ? 'text-white lg:text-slate-900' 
    : (inverted ? 'text-white' : 'text-slate-900');

  const subClass = invertedOnMobile 
    ? 'text-red-100 lg:text-slate-700' 
    : (inverted ? 'text-red-100' : 'text-slate-700');

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Red/White Circular Monogram Emblem */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 100 100" 
          className={`w-10 h-10 drop-shadow-sm transition-transform hover:scale-105 duration-200 ${strokeClass}`} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle with signature cut/flow */}
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
          
          {/* Stylized technological 'C' & inner loop */}
          <path 
            d="M 52 26 C 36 26 25 36 25 50 C 25 64 36 74 52 74 C 62 74 69 69 72 62" 
            stroke="currentColor" 
            strokeWidth="7" 
            strokeLinecap="round" 
          />
          
          {/* Horizontal connection core line */}
          <line 
            x1="26" 
            y1="50" 
            x2="68" 
            y2="50" 
            stroke="currentColor" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
          />
          
          {/* Accent dot */}
          <circle cx="72" cy="38" r="4.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <span className={`text-lg sm:text-xl font-black tracking-tight font-sans ${titleClass}`}>
          CORPORATE
        </span>
        <span className={`text-[11px] sm:text-xs font-bold tracking-[0.22em] -mt-0.5 font-sans ${subClass}`}>
          TECHNOLOGIES
        </span>
        {showTagline && (
          <span className={`text-[9px] font-medium tracking-wide mt-0.5 ${invertedOnMobile ? 'text-white/80 lg:text-brand-red' : inverted ? 'text-white/80' : 'text-brand-red'}`}>
            Quality Products at Better Price
          </span>
        )}
      </div>
    </div>
  );
}
