'use client';

import React from 'react';

const PUBLICATIONS = [
  'Addis Fortune',
  'The Reporter Ethiopia',
  'Highland Specialty Guild',
  'East Africa Coffee Journal',
  'Addis Zemen Review',
];

export default function Marquee() {
  return (
    <div className="w-full bg-pure-white border-y border-fog py-4">
      <div className="max-w-editorial mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-4">
        {PUBLICATIONS.map((pub, idx) => (
          <React.Fragment key={pub}>
            <span className="font-sans text-[12px] font-normal text-iron tracking-tight">
              {pub}
            </span>
            {idx < PUBLICATIONS.length - 1 && (
              <span className="hidden sm:inline-block h-4 w-[1px] bg-fog" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
