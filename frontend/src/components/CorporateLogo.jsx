import React from 'react';

/**
 * Corporate Technologies Official Brand Logo
 * Matches the branding of corporatetechbd.com
 */
export default function CorporateLogo({ className = "h-10", showTagline = false }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Red Circular Monogram Emblem */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 100 100" 
          className="w-10 h-10 drop-shadow-sm transition-transform hover:scale-105 duration-200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle with signature cut/flow */}
          <circle cx="50" cy="50" r="44" stroke="#c92127" strokeWidth="7.5" strokeLinecap="round" />
          
          {/* Stylized technological 'C' & inner loop */}
          <path 
            d="M 52 26 C 36 26 25 36 25 50 C 25 64 36 74 52 74 C 62 74 69 69 72 62" 
            stroke="#c92127" 
            strokeWidth="7" 
            strokeLinecap="round"
          />
          
          {/* Horizontal connection core line */}
          <line 
            x1="26" 
            y1="50" 
            x2="68" 
            y2="50" 
            stroke="#c92127" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
          />
          
          {/* Accent dot */}
          <circle cx="72" cy="38" r="4.5" fill="#c92127" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-sans">
          CORPORATE
        </span>
        <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-slate-700 -mt-0.5 font-sans">
          TECHNOLOGIES
        </span>
        {showTagline && (
          <span className="text-[9px] text-brand-red font-medium tracking-wide mt-0.5">
            Quality Products at Better Price
          </span>
        )}
      </div>
    </div>
  );
}
