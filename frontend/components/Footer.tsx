'use client';

import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-pure-white text-graphite pt-16 pb-12 border-t border-fog">
      <div className="max-w-editorial mx-auto px-5 sm:px-8">
        
        {/* Massive Wordmark */}
        <div className="w-full text-center overflow-hidden select-none pointer-events-none mb-12 border-b border-fog pb-4">
          <span className="font-retro text-[16vw] font-normal tracking-[-0.035em] text-fog leading-none block">
            chillax
          </span>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex flex-col items-start gap-2">
              <div className="relative h-16 sm:h-20 w-44 sm:w-56">
                <Image
                  src="/Assets/Chilax Botanical Sofa Logo.png"
                  alt="Chillax Botanical Sofa Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <span className="font-retro text-[24px] sm:text-[28px] font-normal tracking-tight text-graphite lowercase">
                chillax coffee
              </span>
            </div>
            <p className="font-sans text-[14px] text-iron leading-[1.4] max-w-sm">
              Friendly coffee shop in Bisrate Gabriel, Addis Ababa. Serving 100% Ethiopian coffee, fresh espresso drinks, pure fruit juices, and fresh baked snacks.
            </p>
            <div className="p-3 bg-fog rounded-buttons w-fit">
              <span className="font-serif text-[16px] text-graphite block">"ኑ ቡና እንጠጣ"</span>
              <span className="font-sans text-[12px] text-iron">Come, let us drink coffee together</span>
            </div>
          </div>

          {/* Menu Col (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-2.5 font-sans text-[13px]">
            <a href="#menu" className="text-graphite hover:text-black transition-colors">
              Coffee &amp; Espresso
            </a>
            <a href="#ceremony" className="text-graphite hover:text-black transition-colors">
              Clay Jebena Coffee
            </a>
            <a href="#menu" className="text-graphite hover:text-black transition-colors">
              Fresh Fruit Juices
            </a>
            <a href="#menu" className="text-graphite hover:text-black transition-colors">
              English Butter Cake
            </a>
            <a href="#menu" className="text-graphite hover:text-black transition-colors">
              Chocolate Cookie
            </a>
          </div>

          {/* Location Col (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-2.5 font-sans text-[13px]">
            <p className="text-iron">
              <span className="text-graphite block font-medium">Bisrate Gabriel Cafe</span>
              Near Bisrate Gabriel Church, Addis Ababa
            </p>
            <p className="text-iron">
              <span className="text-graphite block font-medium">Opening Hours</span>
              Daily 06:30 to 21:30
            </p>
            <p className="text-iron">
              <span className="text-graphite block font-medium">Phone Number</span>
              +251 911 234 567
            </p>
          </div>

          {/* Channels Col (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-2.5 font-sans text-[13px]">
            <div className="flex flex-col gap-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 bg-fog hover:bg-mist/30 rounded-buttons text-[12px] text-graphite transition-colors flex items-center justify-between"
              >
                <span>Order on Telegram</span>
                <span className="text-iron">↗</span>
              </a>
              <a
                href="https://wa.me/251911234567"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 bg-fog hover:bg-mist/30 rounded-buttons text-[12px] text-graphite transition-colors flex items-center justify-between"
              >
                <span>Chat on WhatsApp</span>
                <span className="text-iron">↗</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-fog flex flex-col sm:flex-row justify-between items-center gap-4 font-sans text-[11px] text-iron">
          <span>© {new Date().getFullYear()} Chillax Coffee, Bisrate Gabriel, Addis Ababa</span>
          <div className="flex gap-6">
            <a href="#hero" className="hover:text-graphite transition-colors">Back to Top ↑</a>
            <span>•</span>
            <a href="#menu" className="hover:text-graphite transition-colors">View Menu</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
