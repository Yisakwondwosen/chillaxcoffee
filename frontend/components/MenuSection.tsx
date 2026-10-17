'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItemType, CategoryType } from '../lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface MenuSectionProps {
  categories: CategoryType[];
  items: MenuItemType[];
  onAddToCart: (item: MenuItemType) => void;
  onOpenCart: () => void;
  cartCount: number;
}

const SIZES = [
  { name: 'Short', oz: '8 oz' },
  { name: 'Tall', oz: '12 oz' },
  { name: 'Grande', oz: '16 oz' },
  { name: 'Venti', oz: '24 oz' },
];

export default function MenuSection({
  categories,
  items,
  onAddToCart,
  onOpenCart,
  cartCount,
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [featuredItem, setFeaturedItem] = useState<MenuItemType>(items[0] || {} as MenuItemType);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((item) => item.category_slug === activeCategory);

  const setItemSize = (itemId: string, sizeName: string) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: sizeName }));
  };

  return (
    <section id="menu" className="py-section-gap bg-pure-white">
      <div className="max-w-editorial mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-fog gap-6">
          <div>
            <h2 className="font-sans text-heading-lg font-normal leading-[1.0] text-graphite">
              Our Coffee &amp; Food Menu
            </h2>
            <p className="font-sans text-body text-iron leading-[1.3] mt-2 max-w-lg">
              Fresh espresso drinks, traditional Jebena coffee, healthy fruit juices, and freshly baked cakes and cookies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              className="btn-ghost-editorial text-[13px] flex items-center gap-2"
            >
              <span>My Order</span>
              <span className="px-2.5 py-0.5 rounded-pills bg-fog font-mono text-[11px] text-graphite font-medium">
                {cartCount} items
              </span>
            </button>
          </div>
        </div>

        {/* Filter Pills in Analogue aF-1 Minimal Style */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-pills px-4 py-2 text-[13px] font-sans transition-all whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-graphite text-pure-white'
                : 'bg-fog text-graphite hover:bg-mist/30'
            }`}
          >
            All Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`rounded-pills px-4 py-2 text-[13px] font-sans transition-all whitespace-nowrap ${
                activeCategory === cat.slug
                  ? 'bg-graphite text-pure-white'
                  : 'bg-fog text-graphite hover:bg-mist/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 2-Column Bauhaus Layout: Left Product Stack, Right Sticky Pre-Order Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Stack of Product Detail Cards (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredItems.map((item) => {
                const currentSize = selectedSizes[item.item_id] || 'Grande';

                return (
                  <Card
                    key={item.item_id}
                    className="relative w-full pt-0 flex flex-col justify-between rounded-cards overflow-hidden bg-pure-white border border-fog group"
                  >
                    {/* Image Box on Soft Gray #ededed */}
                    <div className="relative aspect-video w-full overflow-hidden bg-fog rounded-t-cards p-2.5">
                      <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-mist/20">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute top-4 right-4 z-20">
                        <span className="font-mono text-[11px] bg-pure-white/95 text-graphite px-2.5 py-1 rounded-pills border border-fog">
                          {item.price_etb} ETB
                        </span>
                      </div>
                    </div>

                    <CardHeader className="flex-grow p-5">
                      <CardAction className="mb-1">
                        <Badge variant="secondary">
                          {item.badge || 'Highland Spec'}
                        </Badge>
                      </CardAction>

                      <CardTitle className="text-[20px]">
                        {item.name}
                      </CardTitle>

                      <CardDescription className="line-clamp-2 mt-1">
                        {item.description}
                      </CardDescription>

                      {/* Size Selector for Espresso Items */}
                      {item.category_slug === 'espresso' && (
                        <div className="mt-3 pt-3 border-t border-fog">
                          <div className="grid grid-cols-4 gap-1">
                            {SIZES.map((s) => {
                              const isSelected = currentSize === s.name;
                              return (
                                <button
                                  key={s.name}
                                  type="button"
                                  onClick={() => setItemSize(item.item_id, s.name)}
                                  className={`py-1 rounded-buttons border text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-graphite bg-pure-white text-graphite font-normal'
                                      : 'border-fog bg-fog/50 text-iron hover:border-mist'
                                  }`}
                                >
                                  <span className="font-sans text-[11px] block">{s.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tasting Notes */}
                      {item.tasting_notes && (
                        <div className="mt-3 pt-3 border-t border-fog flex items-center justify-between text-[11px]">
                          <span className="font-sans text-iron">Flavor:</span>
                          <span className="font-sans text-graphite truncate max-w-[180px] text-right">
                            {item.tasting_notes}
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    <CardFooter className="p-5 pt-0">
                      <Button
                        onClick={() => {
                          onAddToCart(item);
                          setFeaturedItem(item);
                        }}
                        variant="cobalt"
                        className="w-full text-[13px]"
                      >
                        Add to Order
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Testimonial Mini Card */}
            <div className="card-analogue p-6 bg-fog/50 flex items-center gap-4 border border-fog">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-mist">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Patron portrait"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-editorial text-[17px] text-graphite italic leading-tight">
                  "The most serene morning macchiato in Addis. Light pours into the courtyard just as the olive charcoal begins to catch."
                </p>
                <span className="font-sans text-[12px] text-iron block mt-1">
                  Selamawit T., Bisrate Gabriel
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pre-Order Action Card (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="card-analogue p-6 bg-pure-white border border-fog flex flex-col gap-4">
              <div>
                <h3 className="font-sans text-heading font-normal text-graphite mb-1">
                  Order online
                </h3>
                <p className="font-sans text-[14px] text-iron leading-[1.3] mb-4">
                  Skip the line. Order your fresh drinks and pastries for easy pickup or delivery at our Bisrate Gabriel cafe.
                </p>

                {/* Featured Item / Price */}
                <div className="p-4 bg-fog rounded-inputs mb-4">
                  <span className="font-sans text-[15px] text-graphite font-normal block">
                    {featuredItem.name || 'Double Macchiato & English Cake'}
                  </span>
                  <span className="font-sans text-[20px] font-medium text-graphite block mt-1">
                    {featuredItem.price_etb || '120'} ETB
                  </span>
                </div>
              </div>

              {/* Action Buttons: Cobalt Primary + Ghost Dismiss */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onOpenCart}
                  variant="cobalt"
                  className="w-full text-center py-3 text-[14px]"
                >
                  Order Now ({cartCount} items)
                </Button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn-ghost-editorial w-full text-center py-2.5 text-[13px]"
                >
                  Return to Top
                </button>
              </div>

              {/* Payment & Delivery info */}
              <div className="pt-3 border-t border-fog flex flex-col gap-1.5 font-sans text-[12px] text-iron">
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="text-graphite">Telebirr • CBE • Cash</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery time:</span>
                  <span className="text-graphite">~10 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-graphite">Bisrate Gabriel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
