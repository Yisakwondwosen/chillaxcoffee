'use client';

import React from 'react';
import Image from 'next/image';

export default function BentoGrid() {
  return (
    <section id="sanctuary" className="py-section-gap bg-pure-white border-t border-fog">
      <div className="max-w-editorial mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-10 pb-6 border-b border-fog">
          <h2 className="font-sans text-heading-lg font-normal leading-[1.0] text-graphite">
            Our Space in Bisrate Gabriel
          </h2>
          <p className="font-sans text-body text-iron leading-[1.3] mt-2 max-w-xl">
            A quiet and comfortable cafe with natural light, comfortable seating, and warm Ethiopian hospitality.
          </p>
        </div>

        {/* 4-Module Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Module 1: Real Photo Card (7 cols) */}
          <div className="md:col-span-7 relative min-h-[380px] rounded-cards overflow-hidden p-8 flex flex-col justify-end text-pure-white group border border-fog bg-carbon">
            <div className="absolute inset-0 z-0">
              <Image
                src="/Assets/chillax-inside.webp"
                alt="Inside Chillax Coffee House in Bisrate Gabriel, Addis Ababa"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon/95 via-carbon/40 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-serif text-[28px] sm:text-[34px] font-normal leading-tight text-pure-white">
                Comfortable Living Room &amp; Sofas
              </h3>
              <p className="font-sans text-[15px] text-fog leading-[1.3] max-w-md">
                Soft morning sunlight, comfortable botanical sofa seating, hot macchiatos, and fresh pastries every day.
              </p>
            </div>
          </div>

          {/* Module 2: Fog BG Card (5 cols) */}
          <div className="md:col-span-5 bg-fog rounded-cards p-8 flex flex-col justify-between border border-fog">
            <div>
              <h3 className="font-sans text-[24px] sm:text-[26px] font-normal leading-[1.1] text-graphite mb-3">
                Great for Work &amp; Study
              </h3>
              <p className="font-sans text-[15px] text-iron leading-[1.4]">
                Power outlets at every table, fast reliable Wi-Fi, and a calm atmosphere so you can focus or chat quietly.
              </p>
            </div>
          </div>

          {/* Module 3: White BG Card with Fog Border (5 cols) */}
          <div className="md:col-span-5 bg-pure-white border border-fog rounded-cards p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-sans text-[24px] sm:text-[26px] font-normal leading-[1.1] text-graphite mb-3">
                Sweet Incense &amp; Clay Pots
              </h3>
              <p className="font-sans text-[15px] text-iron leading-[1.4]">
                Freshly roasted green coffee beans, fragrant traditional incense, and hot coffee served in clay Jebena pots.
              </p>
            </div>
          </div>

          {/* Module 4: Fog BG Card (7 cols) */}
          <div className="md:col-span-7 bg-fog rounded-cards p-8 flex flex-col justify-between border border-fog">
            <div>
              <h3 className="font-serif text-[28px] sm:text-[34px] font-normal leading-tight text-graphite mb-2">
                Fresh Ethiopian Coffee Beans
              </h3>
              <p className="font-sans text-[15px] text-iron leading-[1.4] max-w-lg">
                100% Ethiopian coffee sourced directly from family farms in Yirgacheffe, Guji, and Sidama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
