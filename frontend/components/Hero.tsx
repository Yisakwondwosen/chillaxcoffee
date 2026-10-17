'use client';

import React, { useState } from 'react';

interface HeroProps {
  onOpenOrderModal: (contact?: string) => void;
}

export default function Hero({ onOpenOrderModal }: HeroProps) {
  const [patronContact, setPatronContact] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenOrderModal(patronContact.trim());
  };

  return (
    <section id="hero" className="relative w-full min-h-[calc(100vh-4rem)] pt-20 pb-8 px-3 sm:px-6 lg:px-8 bg-pure-white flex flex-col justify-center">
      {/* Full-viewport fitting warm parchment canvas */}
      <div
        className="relative w-full flex-1 rounded-images overflow-hidden flex flex-col justify-between items-center p-6 sm:p-12 lg:p-20 border border-[#ded5c6] min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] text-center"
        style={{
          background: 'radial-gradient(ellipse at center, #f5efe5 0%, #ebe3d6 65%, #ded5c6 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center my-auto max-w-4xl mx-auto w-full">
          {/* Majestic Retro-Modern Wordmark */}
          <h1 className="font-retro text-[54px] xs:text-[72px] sm:text-[120px] md:text-[160px] lg:text-[190px] font-normal leading-[0.88] tracking-[-0.04em] text-graphite select-none break-words">
            chillax
          </h1>

          {/* Simple, Welcoming Story (No Em Dashes, Easy for Everyone) */}
          <p className="font-sans text-[16px] sm:text-[19px] text-graphite/85 max-w-[620px] leading-[1.45] tracking-[-0.2px] mt-6 mb-8 px-2">
            Welcome to Bisrate Gabriel's cozy coffee home. Enjoy freshly roasted Ethiopian highland coffee, comfortable sofa seating, and a peaceful place to relax or work.
          </p>

          {/* Centered Order Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2.5 mb-8"
          >
            <input
              type="text"
              placeholder="Enter your name or phone for fast pickup"
              value={patronContact}
              onChange={e => setPatronContact(e.target.value)}
              className="input-editorial w-full flex-1 text-[14px] sm:text-[15px] bg-pure-white border-[#d8cfc0] text-graphite placeholder:text-iron/70"
            />
            <button
              type="submit"
              className="btn-cobalt w-full sm:w-auto text-[14px] sm:text-[15px] py-3.5 px-6 rounded-inputs whitespace-nowrap"
            >
              Order Ahead
            </button>
          </form>

          {/* Social Proof Strip */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-[#d8cfc0]/70 max-w-md w-full justify-center">
            <div className="flex items-center -space-x-2">
              <span
                className="w-8 h-8 rounded-full border-2 border-pure-white bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url('/Assets/ethiopian-customer-1.jpg')`,
                }}
              />
              <span
                className="w-8 h-8 rounded-full border-2 border-pure-white bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url('/Assets/ethiopian-customer-2.jpg')`,
                }}
              />
              <span
                className="w-8 h-8 rounded-full border-2 border-pure-white bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url('/Assets/ethiopian-customer-3.jpg')`,
                }}
              />
            </div>
            <div className="text-left font-sans">
              <div className="text-graphite text-[13px] font-medium">
                ★★★★★ <span className="font-normal text-iron">Loved by 850+ guests every day</span>
              </div>
              <p className="text-[12px] text-iron">
                Bisrate Gabriel's favorite place for coffee, quiet work, and conversations
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div className="relative z-10 flex justify-center mt-6">
          <a
            href="#menu"
            className="scroll-pill bg-pure-white/90 border-[#d8cfc0] text-graphite hover:bg-pure-white transition-colors text-[13px]"
          >
            <span>See Our Coffee &amp; Food Menu ↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
