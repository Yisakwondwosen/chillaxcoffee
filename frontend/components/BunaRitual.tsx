'use client';

import React from 'react';
import Image from 'next/image';

interface BunaRitualProps {
  onOpenOrderModal: () => void;
}

export default function BunaRitual({ onOpenOrderModal }: BunaRitualProps) {
  const sprocketHoles = Array.from({ length: 14 });

  return (
    <section id="ceremony" className="relative w-full bg-ink py-0 overflow-hidden my-section-gap">
      <div className="relative w-full min-h-[580px] sm:min-h-[640px] flex items-center justify-center">
        {/* Left Film Strip Perforation */}
        <div className="film-strip-left" aria-hidden="true">
          {sprocketHoles.map((_, i) => (
            <div key={`left-sprocket-${i}`} className="sprocket-hole" />
          ))}
        </div>

        {/* Full-Bleed Moody Hearth Photography */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1600&q=85"
            alt="Ethiopian Buna Ceremony with clay Jebena and fragrant smoke in Bisrate Gabriel"
            fill
            className="object-cover opacity-75 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/80" />
        </div>

        {/* Right Film Strip Perforation */}
        <div className="film-strip-right" aria-hidden="true">
          {sprocketHoles.map((_, i) => (
            <div key={`right-sprocket-${i}`} className="sprocket-hole" />
          ))}
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center">
          <span className="font-serif text-[32px] sm:text-[40px] text-pure-white/90 mb-3 font-normal">
            የኢትዮጵያ ቡና
          </span>

          <h2 className="font-editorial text-[30px] sm:text-[40px] font-normal leading-[1.05] tracking-[-0.88px] text-pure-white mb-5">
            "Traditional Ethiopian coffee brewed fresh with care."
          </h2>

          <p className="font-sans text-[15px] sm:text-[16px] text-fog/90 max-w-xl leading-[1.4] tracking-[-0.26px] mb-8">
            At our Bisrate Gabriel cafe, we roast and brew coffee the traditional Ethiopian way in a clay Jebena. Enjoy Abol, Tona, and Bereka, the three rounds of warm hospitality poured fresh for your table.
          </p>

          <button
            onClick={onOpenOrderModal}
            className="btn-cobalt text-[14px] px-8 py-3.5 rounded-buttons"
          >
            Reserve a Coffee Table
          </button>
        </div>
      </div>
    </section>
  );
}
