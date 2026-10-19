'use client';

import React, { useState, useEffect } from 'react';
import { TrayItemType, MenuItemType, CategoryType, OrderResponseType } from '../lib/types';
import { submitPreOrder } from '../lib/api';

function parseContact(input: string): { name: string; phone: string } {
  const trimmed = input.trim();
  if (!trimmed) return { name: '', phone: '' };

  const phoneRegex = /(\+?251[\s-]?[79]\d[\s-]?\d{3}[\s-]?\d{4}|0[79]\d{8}|\b\d{9,12}\b)/;
  const match = trimmed.match(phoneRegex);

  if (match) {
    const rawPhone = match[0];
    const cleanedPhone = rawPhone.replace(/[\s-]/g, '');
    const remainingName = trimmed.replace(rawPhone, '').replace(/[,•-]/g, '').trim();
    return {
      name: remainingName || '',
      phone: cleanedPhone,
    };
  }

  return {
    name: trimmed,
    phone: '',
  };
}

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tray: TrayItemType[];
  initialContact?: string;
  menuItems?: MenuItemType[];
  categories?: CategoryType[];
  onAddToCart?: (item: MenuItemType) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onQuickAdd: (itemId: string) => void;
  onClearTray?: () => void;
}

export default function PreOrderModal({
  isOpen,
  onClose,
  tray,
  initialContact = '',
  menuItems = [],
  categories = [],
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onQuickAdd,
  onClearTray,
}: PreOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [pickupTime, setPickupTime] = useState('In 10 Minutes');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResponseType | null>(null);
  const [activeCrossSellCategory, setActiveCrossSellCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen && initialContact) {
      const parsed = parseContact(initialContact);
      if (parsed.name) setCustomerName(parsed.name);
      if (parsed.phone) setPhone(parsed.phone);
    }
  }, [isOpen, initialContact]);

  if (!isOpen) return null;

  const totalAmount = tray.reduce(
    (sum, item) => sum + Number(item.price_etb) * item.qty,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tray.length === 0) {
      alert('Your order is empty. Please choose at least one item from the menu.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      const fullNotes = [
        phone.trim() ? `Phone: ${phone.trim()}` : null,
        orderType === 'DELIVERY' ? 'Order Type: Delivery' : 'Order Type: Pickup at Cafe',
        notes.trim() ? `Instructions: ${notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' • ');

      const response = await submitPreOrder({
        customer_name: customerName.trim() + (phone.trim() ? ` (${phone.trim()})` : ''),
        pickup_time: pickupTime,
        order_notes: fullNotes,
        total_etb: totalAmount,
        channel: 'WEB',
        items_json: tray.map((item) => ({
          item_id: item.item_id,
          name: item.name,
          qty: item.qty,
          price_etb: item.price_etb,
        })),
      });

      setOrderResult(response);
    } catch (err) {
      console.error(err);
      alert('Order could not be sent. Please check your connection or contact our cafe directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setOrderResult(null);
    setCustomerName('');
    setPhone('');
    setNotes('');
    if (onClearTray) onClearTray();
    onClose();
  };

  // Filter cross-sell items based on selected category tab
  const crossSellItems = activeCrossSellCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_slug === activeCrossSellCategory);

  // Order Confirmed Screen (Finishes directly on website)
  if (orderResult) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-carbon/60 backdrop-blur-sm">
        <div className="bg-pure-white w-full max-w-lg rounded-cards border border-fog overflow-hidden flex flex-col font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Success Header */}
          <div className="p-6 sm:p-8 text-center border-b border-fog bg-fog/30">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm">
              ✓
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed &amp; Received
            </span>
            <h3 className="text-[22px] sm:text-[26px] font-normal tracking-tight text-graphite mt-3">
              Thank You, {customerName.trim() || 'Valued Guest'}!
            </h3>
            <p className="text-[13px] text-iron mt-1 max-w-sm mx-auto">
              Your order is sent directly to the baristas at Chillax Coffee, Bisrate Gabriel.
            </p>
          </div>

          {/* Ticket Details */}
          <div className="p-6 sm:p-8 flex flex-col gap-4">
            <div className="bg-fog rounded-[15px] p-4.5 border border-dove/30 space-y-2.5">
              <div className="flex justify-between items-center text-[13px] pb-2 border-b border-dove/40">
                <span className="text-iron">Order Number:</span>
                <span className="font-mono font-bold text-graphite">#{orderResult.order_number}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] pb-2 border-b border-dove/40">
                <span className="text-iron">Service Type:</span>
                <span className="font-medium text-graphite">
                  {orderType === 'DELIVERY' ? 'Home / Office Delivery' : 'Pickup at Bisrate Gabriel'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px] pb-2 border-b border-dove/40">
                <span className="text-iron">Time:</span>
                <span className="font-medium text-graphite">{pickupTime}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] pt-1">
                <span className="text-graphite font-medium">Total Price:</span>
                <span className="text-[18px] font-bold text-graphite">{totalAmount} ETB</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-[12px] p-3 text-[12px] text-emerald-900 leading-relaxed text-center">
              💵 <b>Payment Method:</b> Pay upon arrival or delivery with <b>Telebirr</b>, <b>CBE Birr</b>, or <b>Cash</b>.
            </div>

            {/* Live Telegram Bot Notification & Tracking */}
            <div className="bg-[#24A1DE]/10 border border-[#24A1DE]/30 rounded-[14px] p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shrink-0 text-xl font-bold">
                  ✈️
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans font-medium text-[14px] text-graphite">
                      Chillax Coffee Bot
                    </h4>
                    <span className="text-[10px] bg-[#24A1DE] text-white px-1.5 py-0.5 rounded font-mono font-medium">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[12px] text-iron mt-0.5 leading-snug">
                    Your order was sent directly to our baristas. Open <b>@ChillaxCoffee_order_bot</b> on Telegram to track when your order is Brewing &amp; Ready!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <a
                  href={`https://t.me/ChillaxCoffee_order_bot?start=order_${orderResult.order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-[#24A1DE] hover:bg-[#1f8fc6] text-white rounded-buttons text-[13px] font-medium text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Open in Telegram Bot</span>
                  <span>→</span>
                </a>
                {orderResult.whatsapp_url && (
                  <a
                    href={orderResult.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-buttons text-[13px] font-medium text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="btn-cobalt w-full py-3.5 rounded-buttons text-[14px] font-medium text-center shadow-sm hover:shadow cursor-pointer mt-1"
            >
              Done &amp; Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Order Basket & Form
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-carbon/60 backdrop-blur-sm">
      <div className="bg-pure-white w-full max-w-xl max-h-[92vh] rounded-cards border border-fog overflow-y-auto flex flex-col font-sans shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-fog bg-pure-white sticky top-0 z-20">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-normal tracking-tight text-graphite">
              Your Order Basket
            </h3>
            <p className="text-[12px] text-iron mt-0.5">
              Chillax Coffee • Bisrate Gabriel Cafe
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-fog hover:border-graphite flex items-center justify-center text-iron hover:text-graphite transition-colors text-sm cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 flex flex-col gap-6">
          {/* Selected Items Tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-graphite">
                Current Basket ({tray.reduce((s, i) => s + i.qty, 0)} items)
              </span>
              {tray.length > 0 && onClearTray && (
                <button
                  type="button"
                  onClick={onClearTray}
                  className="text-[11px] text-iron hover:text-black transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="bg-fog rounded-[15px] p-4 max-h-44 overflow-y-auto divide-y divide-dove/40 border border-dove/30">
              {tray.length === 0 ? (
                <div className="text-center py-5 px-3">
                  <p className="text-[14px] font-medium text-graphite mb-1">
                    {customerName ? `Welcome, ${customerName}!` : 'Ready to order?'}
                  </p>
                  <p className="text-[12px] text-iron">
                    Your tray is currently empty. Tap <b>+ Add</b> on any coffee, pastry, or food item below to build your order!
                  </p>
                </div>
              ) : (
                tray.map((item) => (
                  <div
                    key={item.item_id}
                    className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-normal text-[14px] text-graphite">{item.name}</p>
                      <p className="font-mono text-[11px] text-iron">
                        {item.qty} × {item.price_etb} ETB = {item.qty * Number(item.price_etb)} ETB
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.item_id, -1)}
                        className="w-7 h-7 rounded-buttons border border-dove hover:border-graphite flex items-center justify-center text-[12px] transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-[12px] w-5 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.item_id, 1)}
                        className="w-7 h-7 rounded-buttons border border-dove hover:border-graphite flex items-center justify-center text-[12px] transition-colors cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.item_id)}
                        className="text-iron hover:text-black p-1 ml-1 text-xs cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* Cross-Sell Menu Section (Lists All Menu Items) */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="pt-2 border-t border-fog">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h4 className="text-[14px] font-medium text-graphite">
                  Add to Your Order (Cross-Sell)
                </h4>
                <p className="text-[11px] text-iron">
                  Pair your drink with coffee, traditional brew, fresh juice, or baked treats
                </p>
              </div>
              <span className="text-[11px] font-mono text-iron bg-fog px-2 py-0.5 rounded-full border border-dove/30">
                {menuItems.length} items
              </span>
            </div>

            {/* Category filter pills for quick discovery */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
              <button
                type="button"
                onClick={() => setActiveCrossSellCategory('all')}
                className={`px-3 py-1 rounded-pills text-[11px] transition-all whitespace-nowrap cursor-pointer ${
                  activeCrossSellCategory === 'all'
                    ? 'bg-graphite text-pure-white font-medium'
                    : 'bg-fog text-iron hover:bg-mist/40'
                }`}
              >
                All Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCrossSellCategory(cat.slug)}
                  className={`px-3 py-1 rounded-pills text-[11px] transition-all whitespace-nowrap cursor-pointer ${
                    activeCrossSellCategory === cat.slug
                      ? 'bg-graphite text-pure-white font-medium'
                      : 'bg-fog text-iron hover:bg-mist/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Cross-Sell Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {crossSellItems.map((item) => {
                const itemInTray = tray.find((i) => i.item_id === item.item_id);

                return (
                  <div
                    key={item.item_id}
                    className={`flex items-center justify-between p-2.5 rounded-[12px] border transition-all ${
                      itemInTray
                        ? 'border-emerald-500/40 bg-emerald-50/20 shadow-xs'
                        : 'border-fog bg-pure-white hover:border-dove'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={item.image_url || '/Assets/chillax-inside.webp'}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-mist/20"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-graphite truncate leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-mono font-semibold text-graphite mt-0.5">
                          {item.price_etb} ETB
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {itemInTray ? (
                        <div className="flex items-center gap-1 bg-pure-white border border-emerald-400 rounded-buttons p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.item_id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-[11px] text-graphite hover:bg-fog rounded cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-[11px] font-bold text-emerald-700 w-4 text-center">
                            {itemInTray.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.item_id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-[11px] text-graphite hover:bg-fog rounded cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart(item);
                            } else {
                              onQuickAdd(item.item_id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-buttons text-[11px] font-medium bg-fog hover:bg-mist/50 border border-dove/40 text-graphite transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>+ Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="flex flex-col gap-3.5 pt-2 border-t border-fog">
            {/* Service Type Selection */}
            <div>
              <label className="text-[12px] font-medium text-graphite block mb-1.5">
                Service Option
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`py-2 px-3 rounded-buttons border text-[13px] font-medium transition-all cursor-pointer ${
                    orderType === 'PICKUP'
                      ? 'border-graphite bg-graphite text-pure-white'
                      : 'border-fog bg-fog text-iron hover:bg-mist/40'
                  }`}
                >
                  ☕ Pickup at Cafe
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`py-2 px-3 rounded-buttons border text-[13px] font-medium transition-all cursor-pointer ${
                    orderType === 'DELIVERY'
                      ? 'border-graphite bg-graphite text-pure-white'
                      : 'border-fog bg-fog text-iron hover:bg-mist/40'
                  }`}
                >
                  🛵 Delivery
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-graphite block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz or Robel"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-editorial w-full"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-graphite block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0911 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-editorial w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-graphite block mb-1">
                  When do you need it?
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="input-editorial w-full"
                >
                  <option value="In 10 Minutes">In 10 Minutes</option>
                  <option value="In 20 Minutes">In 20 Minutes</option>
                  <option value="In 30 Minutes">In 30 Minutes</option>
                  <option value="In 45 Minutes">In 45 Minutes</option>
                  <option value="Drink inside the cafe">Drink inside the cafe</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-graphite block mb-1">
                  Special Notes or Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra hot, low sugar, or delivery spot"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-editorial w-full"
                />
              </div>
            </div>

            {/* Total Estimated Box */}
            <div className="flex justify-between items-center p-4 bg-fog rounded-[15px] border border-dove/30 font-sans mt-1">
              <span className="text-[13px] text-graphite">Total Price:</span>
              <span className="text-[20px] font-bold text-graphite">
                {totalAmount} ETB
              </span>
            </div>

            {/* Telegram Notification Badge */}
            <div className="flex items-center gap-2.5 p-3 bg-[#24A1DE]/10 rounded-[12px] border border-[#24A1DE]/25 text-[12px] text-graphite">
              <span className="text-[#24A1DE] text-base">✈️</span>
              <span className="leading-tight">
                Directly connected to <b>@ChillaxCoffee_order_bot</b>. Baristas at our Bisrate Gabriel cafe get instant audio alerts upon order placement.
              </span>
            </div>

            {/* Direct Order Confirmation Button (Finishes right on website) */}
            <button
              type="submit"
              disabled={loading || tray.length === 0}
              className="btn-cobalt w-full py-3.5 rounded-buttons text-[14px] font-medium disabled:opacity-50 cursor-pointer shadow-sm hover:shadow text-center flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loader-sm" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                `Confirm & Place Order (${totalAmount} ETB)`
              )}
            </button>

            <p className="text-[11px] text-center text-iron">
              Sent directly to the baristas at Bisrate Gabriel. Pay with Telebirr, CBE, or Cash upon arrival or delivery.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
