'use client';

import React from 'react';

interface FloatingFrapButtonProps {
  onClick: () => void;
  cartCount: number;
}

export default function FloatingFrapButton({ onClick, cartCount }: FloatingFrapButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex fixed bottom-6 right-6 z-40 btn-cobalt rounded-pills py-3 px-6 shadow-none items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer select-none"
      aria-label="Order Online"
    >
      <span className="font-sans text-[13px] font-normal leading-none">Order Online</span>
      {cartCount > 0 && (
        <span className="px-2 py-0.5 bg-graphite text-pure-white font-mono text-[11px] font-bold rounded-full leading-none">
          {cartCount}
        </span>
      )}
    </button>
  );
}
