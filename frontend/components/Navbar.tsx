'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LoungeStatusType } from '../lib/types';

interface NavbarProps {
  status: LoungeStatusType;
  onOpenOrderModal: () => void;
  cartCount: number;
}

export default function Navbar({ status, onOpenOrderModal, cartCount }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-pure-white/90 backdrop-blur-md border-b border-fog py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 sm:h-16 md:h-18">
          
          {/* Left Side: Brand Logo followed by Horizontal Nav Links */}
          <div className="flex items-center gap-5 sm:gap-7 lg:gap-9 min-w-0">
            {/* Brand Logo & Name */}
            <a
              href="#hero"
              className="flex items-center gap-1.5 sm:gap-2.5 group flex-shrink-0"
              aria-label="Chillax Coffee Home"
            >
              <div className="relative h-8 xs:h-9 sm:h-11 md:h-12 w-20 xs:w-24 sm:w-28 md:w-32 flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/Assets/Chilax Botanical Sofa Logo.png"
                  alt="Chillax Botanical Sofa Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-retro text-[17px] xs:text-[19px] sm:text-[22px] md:text-[24px] font-normal tracking-[-0.03em] text-graphite lowercase select-none whitespace-nowrap">
                chillax coffee
              </span>
            </a>

            {/* Horizontal Nav Links (Never wrapping) */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-7">
              <a
                href="#menu"
                className="font-sans text-[14px] font-medium text-iron hover:text-graphite transition-colors whitespace-nowrap"
              >
                Menu
              </a>
              <a
                href="#ceremony"
                className="font-sans text-[14px] font-medium text-iron hover:text-graphite transition-colors whitespace-nowrap"
              >
                Coffee Ceremony
              </a>
              <a
                href="#sanctuary"
                className="font-sans text-[14px] font-medium text-iron hover:text-graphite transition-colors whitespace-nowrap"
              >
                About Us
              </a>
              <a
                href="#location"
                className="font-sans text-[14px] font-medium text-iron hover:text-graphite transition-colors whitespace-nowrap"
              >
                Location &amp; Hours
              </a>
            </nav>
          </div>

          {/* Right Side: Order Action Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onOpenOrderModal}
              className="btn-cobalt text-[12px] sm:text-[13px] md:text-[14px] py-2 sm:py-2.5 px-3.5 sm:px-4 md:px-5 rounded-buttons flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow"
            >
              <span className="hidden sm:inline">Order Online</span>
              <span className="sm:hidden">Order</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-graphite text-pure-white text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
