'use client';

import React from 'react';

export default function SteamAnimation() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[120px] h-[80px]">
      <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M40 70 Q42 50 38 35 Q34 20 40 10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.4"
          className="animate-steam-1"
        />
        <path
          d="M60 70 Q63 45 58 30 Q53 15 60 5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.3"
          className="animate-steam-2"
        />
        <path
          d="M80 70 Q78 48 82 32 Q86 18 80 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.2"
          className="animate-steam-3"
        />
      </svg>
    </div>
  );
}
