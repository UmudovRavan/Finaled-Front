import React from 'react';

export const FlagAZ = ({ className = "w-4 h-3 rounded-[2px] overflow-hidden shadow-sm" }) => (
  <svg 
    viewBox="0 0 640 480" 
    className={`inline-block shrink-0 align-middle ${className}`} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fillRule="evenodd">
      <path fill="#0092bc" d="M0 0h640v160H0z"/>
      <path fill="#e00034" d="M0 160h640v160H0z"/>
      <path fill="#009856" d="M0 320h640v160H0z"/>
      {/* Crescent */}
      <circle cx="304" cy="240" r="48" fill="#ffffff"/>
      <circle cx="318" cy="240" r="38" fill="#e00034"/>
      {/* 8-Pointed Star */}
      <path
        fill="#ffffff"
        d="M 350,215 
           L 353,230 L 368,222 L 360,237 
           L 375,240 
           L 360,243 L 368,258 L 353,250 
           L 350,265 
           L 347,250 L 332,258 L 340,243 
           L 325,240 
           L 340,237 L 332,222 L 347,230 Z"
      />
    </g>
  </svg>
);

export const FlagGB = ({ className = "w-4 h-3 rounded-[2px] overflow-hidden shadow-sm" }) => (
  <svg 
    viewBox="0 0 60 30" 
    className={`inline-block shrink-0 align-middle ${className}`} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <clipPath id="gb-flag-clip">
      <rect width="60" height="30" rx="1"/>
    </clipPath>
    <g clipPath="url(#gb-flag-clip)">
      <rect width="60" height="30" fill="#012169"/>
      {/* White Diagonals */}
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" strokeWidth="6"/>
      {/* Red Diagonals */}
      <path d="M0 0 L30 15 M60 30 L30 15" stroke="#C8102E" strokeWidth="2"/>
      <path d="M60 0 L30 15 M0 30 L30 15" stroke="#C8102E" strokeWidth="2"/>
      {/* White Cross */}
      <path d="M30 0 v30 M0 15 h60" stroke="#ffffff" strokeWidth="10"/>
      {/* Red Cross */}
      <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export const FlagRU = ({ className = "w-4 h-3 rounded-[2px] overflow-hidden shadow-sm" }) => (
  <svg 
    viewBox="0 0 640 480" 
    className={`inline-block shrink-0 align-middle ${className}`} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fillRule="evenodd">
      <path fill="#ffffff" d="M0 0h640v160H0z"/>
      <path fill="#0039a6" d="M0 160h640v160H0z"/>
      <path fill="#d52b1e" d="M0 320h640v160H0z"/>
    </g>
  </svg>
);

const FlagIcon = ({ code, className = "w-4 h-3 rounded-[2px] shadow-sm border border-black/10 dark:border-white/10" }) => {
  const normalizedCode = (code || '').toLowerCase();

  switch (normalizedCode) {
    case 'az':
      return <FlagAZ className={className} />;
    case 'en':
    case 'gb':
    case 'uk':
      return <FlagGB className={className} />;
    case 'ru':
      return <FlagRU className={className} />;
    default:
      return null;
  }
};

export default FlagIcon;
