'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import BunaRitual from '../components/BunaRitual';
import MenuSection from '../components/MenuSection';
import BentoGrid from '../components/BentoGrid';
import BeanTimeline from '../components/BeanTimeline';
import LocationHours from '../components/LocationHours';
import Footer from '../components/Footer';
import PreOrderModal from '../components/PreOrderModal';
import FloatingFrapButton from '../components/FloatingFrapButton';
import MobileStickyBar from '../components/MobileStickyBar';

import {
  CategoryType,
  MenuItemType,
  TrayItemType,
  LoungeStatusType,
} from '../lib/types';
import {
  fetchCategories,
  fetchMenuItems,
  fetchLoungeStatus,
  FALLBACK_CATEGORIES,
  FALLBACK_MENU,
} from '../lib/api';

export default function Home() {
  const [categories, setCategories] = useState<CategoryType[]>(FALLBACK_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>(FALLBACK_MENU);
  const [status, setStatus] = useState<LoungeStatusType>({
    timezone: 'Africa/Addis_Ababa (UTC+3)',
    addis_time: '08:30 AM',
    is_open: true,
    status_badge: 'Open in Bisrate Gabriel • Closes 9:30 PM',
    closes_at: '9:30 PM',
    today_roast: 'Yirgacheffe Coffee (Sweet • Honey • Smooth)',
    barista_note: 'Fresh traditional coffee brewed every hour in clay Jebena pots.',
  });

  const [tray, setTray] = useState<TrayItemType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, items, liveStatus] = await Promise.all([
          fetchCategories(),
          fetchMenuItems(),
          fetchLoungeStatus(),
        ]);
        if (cats && cats.length > 0) setCategories(cats);
        if (items && items.length > 0) setMenuItems(items);
        if (liveStatus) setStatus(liveStatus);
      } catch (e) {
        console.warn('Using local cache for Chillax Coffee');
      }
    }
    loadData();

    const interval = setInterval(async () => {
      try {
        const liveStatus = await fetchLoungeStatus();
        if (liveStatus) setStatus(liveStatus);
      } catch (e) {
        console.warn('Status refresh error:', e);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (item: MenuItemType) => {
    setTray((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id);
      if (existing) {
        return prev.map((i) =>
          i.item_id === item.item_id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setTray((prev) => {
      return prev
        .map((i) => (i.item_id === itemId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setTray((prev) => prev.filter((i) => i.item_id !== itemId));
  };

  const handleQuickAdd = (itemId: string) => {
    const found = menuItems.find((i) => i.item_id === itemId);
    if (found) {
      handleAddToCart(found);
    }
  };

  const [initialContact, setInitialContact] = useState('');

  const handleOpenOrderModal = (contact?: string) => {
    if (contact !== undefined) {
      setInitialContact(contact);
    }
    setIsModalOpen(true);
  };

  const totalCartCount = tray.reduce((sum, item) => sum + item.qty, 0);

  return (
    <main className="min-h-screen bg-pure-white text-graphite selection:bg-cobalt-signal selection:text-white">
      <Navbar
        status={status}
        onOpenOrderModal={() => handleOpenOrderModal()}
        cartCount={totalCartCount}
      />
      <Hero onOpenOrderModal={handleOpenOrderModal} />
      <Marquee />
      <BunaRitual onOpenOrderModal={() => handleOpenOrderModal()} />
      <MenuSection
        categories={categories}
        items={menuItems}
        onAddToCart={handleAddToCart}
        onOpenCart={() => handleOpenOrderModal()}
        cartCount={totalCartCount}
      />
      <BentoGrid />
      <BeanTimeline />
      <LocationHours status={status} />
      <Footer />
      <FloatingFrapButton
        onClick={() => handleOpenOrderModal()}
        cartCount={totalCartCount}
      />
      <MobileStickyBar
        onOpenOrderModal={() => handleOpenOrderModal()}
        cartCount={totalCartCount}
      />
      <PreOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tray={tray}
        initialContact={initialContact}
        menuItems={menuItems}
        categories={categories}
        onAddToCart={handleAddToCart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onQuickAdd={handleQuickAdd}
        onClearTray={() => setTray([])}
      />
    </main>
  );
}
