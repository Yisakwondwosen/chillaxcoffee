'use client';

import React from 'react';
import { LoungeStatusType } from '../lib/types';

interface LocationHoursProps {
  status: LoungeStatusType;
}

export default function LocationHours({ status }: LocationHoursProps) {
  return (
    <section id="location" className="py-section-gap bg-pure-white border-t border-fog">
      <div className="max-w-editorial mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-10 pb-6 border-b border-fog">
          <h2 className="font-sans text-heading-lg font-normal leading-[1.0] text-graphite">
            Visit Us in Bisrate Gabriel
          </h2>
          <p className="font-sans text-body text-iron leading-[1.3] mt-2 max-w-xl">
            Come visit our peaceful coffee shop in Bisrate Gabriel, Addis Ababa. Enjoy comfortable sofa seating, natural light, and delicious coffee.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Details Card (Left 6 cols) */}
          <div className="lg:col-span-6 bg-pure-white border border-fog rounded-cards p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <h3 className="font-sans text-[22px] sm:text-[26px] font-normal text-graphite mb-1">
                Bisrate Gabriel, Addis Ababa
              </h3>
              <p className="font-sans text-[14px] text-iron mb-6">
                Near Bisrate Gabriel Church and Laphto Mall, Addis Ababa.
              </p>

              {/* Hours Module */}
              <div className="bg-fog rounded-inputs p-5 sm:p-6 mb-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-dove/50 font-sans">
                  <span className="text-[13px] font-normal text-graphite">
                    Opening Hours
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-pills bg-pure-white text-graphite border border-fog font-mono font-medium">
                    {status?.is_open ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <ul className="flex flex-col gap-2.5 font-sans text-[13px] text-graphite">
                  <li className="flex justify-between">
                    <span>Monday to Friday</span>
                    <span className="text-iron font-mono text-[12px]">06:30 to 21:30</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-iron font-mono text-[12px]">07:00 to 22:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-iron font-mono text-[12px]">07:30 to 21:00</span>
                  </li>
                </ul>
              </div>

              {/* Amenities */}
              <div className="grid grid-cols-2 gap-2 text-[12px] font-sans text-graphite">
                <div className="p-3 bg-fog rounded-buttons border border-dove/30 text-center">
                  Outdoor Garden Seating
                </div>
                <div className="p-3 bg-fog rounded-buttons border border-dove/30 text-center">
                  Free High-Speed Wi-Fi
                </div>
                <div className="p-3 bg-fog rounded-buttons border border-dove/30 text-center">
                  Relaxing Background Music
                </div>
                <div className="p-3 bg-fog rounded-buttons border border-dove/30 text-center">
                  Free Parking Available
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-fog">
              <a
                href="https://maps.google.com/?q=Bisrate+Gabriel+Addis+Ababa"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cobalt flex-1 text-center py-3 text-[14px]"
              >
                Open in Google Maps
              </a>
              <a
                href="tel:+251911234567"
                className="btn-ghost-editorial flex-1 text-center py-3 text-[14px]"
              >
                Call Us (+251 911 234 567)
              </a>
            </div>
          </div>

          {/* Interactive Map Embed Card (Right 6 cols) */}
          <div className="lg:col-span-6 bg-pure-white border border-fog rounded-cards p-3 flex flex-col justify-between overflow-hidden">
            <div className="relative w-full h-[360px] lg:h-full min-h-[300px] overflow-hidden rounded-[15px]">
              <iframe
                title="Chillax Coffee Bisrate Gabriel Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15762.66440263666!2d38.7300!3d8.9950!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85ce84c160cf%3A0x6b63c9b740ec665a!2sBisrate%20Gabriel%2C%20Addis%20Ababa!5e0!3m2!1sen!2set!4v1710000000000!5m2!1sen!2set"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.7) contrast(1.1)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
