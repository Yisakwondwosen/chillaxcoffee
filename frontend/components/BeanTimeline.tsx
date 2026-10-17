'use client';

import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Harvest by Hand',
    meta: 'Guji & Yirgacheffe Mountains',
    desc: 'Ripe red coffee cherries picked by hand from natural Ethiopian forests.',
  },
  {
    num: '02',
    title: 'Sun Drying',
    meta: '18 Days of Sunshine',
    desc: 'Beans are dried naturally under the sun to bring out sweet, fruity natural flavors.',
  },
  {
    num: '03',
    title: 'Weekly Fresh Roast',
    meta: 'Roasted in Addis Ababa',
    desc: 'Roasted every week in Addis Ababa for smooth taste and delicious aroma.',
  },
  {
    num: '04',
    title: 'Brewed for You',
    meta: 'Bisrate Gabriel Cafe',
    desc: 'Freshly made as hot espresso or poured warm from a traditional clay Jebena pot.',
  },
];

export default function BeanTimeline() {
  return (
    <section id="origin" className="py-section-gap bg-pure-white border-t border-fog">
      <div className="max-w-editorial mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-10 pb-6 border-b border-fog">
          <h2 className="font-sans text-heading-lg font-normal leading-[1.0] text-graphite">
            How We Make Your Coffee
          </h2>
          <p className="font-sans text-body text-iron leading-[1.3] mt-2 max-w-xl">
            Four simple steps from handpicked Ethiopian coffee cherries to your warm cup.
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-pure-white border border-fog rounded-cards p-6 flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 pb-2 border-b border-fog">
                  <span className="text-heading-sm font-normal text-graphite font-sans">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-sans text-[18px] font-normal leading-tight text-graphite mb-1.5">
                  {step.title}
                </h3>
                <span className="font-mono text-[12px] text-iron block mb-3">
                  {step.meta}
                </span>
                <p className="font-sans text-[14px] text-iron leading-[1.4]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
