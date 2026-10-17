'use client';

import React from 'react';

interface MobileStickyBarProps {
  onOpenOrderModal: () => void;
  cartCount: number;
}

export default function MobileStickyBar({ onOpenOrderModal, cartCount }: MobileStickyBarProps) {
  return (
    <aside className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-pure-white/95 backdrop-blur-md border-t border-fog p-3 flex gap-2.5 items-center">
      <a
        href="#menu"
        className="btn-ghost-editorial text-center text-[13px] py-2.5 px-5"
      >
        Menu
      </a>
      <button
        onClick={onOpenOrderModal}
        className="btn-cobalt flex-1 text-center text-[13px] py-2.5 flex items-center justify-center gap-1.5"
      >
        <span>Order Ahead{cartCount > 0 ? ` (${cartCount})` : ''}</span>
      </button>
    </aside>
  );
}
