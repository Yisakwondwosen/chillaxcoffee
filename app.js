/**
 * CHILLAX COFFEE • CORE APPLICATION LOGIC
 * Mekanisa, Addis Ababa, Ethiopia
 */

// --- 1. MENU DATABASE ---
const MENU_ITEMS = [
  // Signature Espresso & Buna
  {
    id: 'macchiato',
    name: 'The Chillax Double Macchiato',
    category: 'espresso',
    price: 120,
    badge: 'Mekanisa Favorite',
    desc: 'Velvety micro-foam stained with a bold double shot of our house highland dark roast. Served in our signature thick glass.',
    tastingNotes: 'Dark Chocolate • Honey Crema • Hazelnut',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'jebena-brew',
    name: 'Spiced Jebena Brew',
    category: 'espresso',
    price: 95,
    badge: 'Heritage',
    desc: 'Traditional clay-pot slow-brewed coffee infused with a fresh twig of rue (Tena Adam) or cracked green cardamom.',
    tastingNotes: 'Wild Rue • Bergamot • Frankincense Smoke',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'honey-latte',
    name: 'Honey-Cinnamon Iced Latte',
    category: 'espresso',
    price: 160,
    badge: 'Iced',
    desc: 'Chilled double espresso swirled with organic Tigray white honey, steamed farm milk, and dusted Ceylon cinnamon.',
    tastingNotes: 'Tigray White Honey • Ceylon Cinnamon • Velvety Milk',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'guji-pourover',
    name: 'Single-Origin Guji Pour-Over',
    category: 'espresso',
    price: 140,
    badge: 'Single Origin',
    desc: 'Artisanal V60 extraction from sun-dried Guji Grade 1 heirloom beans. Crisp acidity with remarkable floral sweetness.',
    tastingNotes: 'Ripe Peach • Blueberry • Jasmine Blossom',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=700&q=80'
  },

  // Fresh Juices & Smoothies
  {
    id: 'spris',
    name: 'Mekanisa Sunrise Spris',
    category: 'juices',
    price: 180,
    badge: '100% Fresh',
    desc: 'The iconic Addis tri-color layer: buttery ripe avocado, luscious golden mango, and zesty papaya drizzled with fresh lime & vimto.',
    tastingNotes: 'Rich Avocado • Sun-Ripened Mango • Zesty Lime',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'karkade',
    name: 'Hibiscus & Ginger Cooler (Karkade)',
    category: 'juices',
    price: 130,
    badge: 'Refreshing',
    desc: 'Cold-steeped ruby red hibiscus flowers infused with spicy crushed Ethiopian ginger root, mint, and clover honey over ice.',
    tastingNotes: 'Tart Hibiscus • Fiery Ginger • Wild Mint',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'papaya-elixir',
    name: 'Tropical Papaya-Passion Elixir',
    category: 'juices',
    price: 165,
    badge: 'Immunity',
    desc: 'Velvety puréed golden papaya blended with tangy passionfruit pulp and a hint of fresh baobab fruit extract.',
    tastingNotes: 'Sweet Papaya • Passionfruit Tang • Citrus Finish',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=700&q=80'
  },

  // Bites & Pastries
  {
    id: 'fetira',
    name: 'Special Honey Fetira',
    category: 'bites',
    price: 220,
    badge: 'Made to Order',
    desc: 'Pan-crisped, ultra-flaky layered artisan dough drizzled with warm amber honey and speckled with fragrant black cumin seeds.',
    tastingNotes: 'Crisp Warm Layers • Wild Amber Honey • Nigella Seeds',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'croissant',
    name: 'Cardamom Croissant',
    category: 'bites',
    price: 140,
    badge: 'Bakery',
    desc: 'French-laminated pastry baked golden with cultured butter, generously dusted with freshly ground Ethiopian green cardamom sugar.',
    tastingNotes: 'Cultured Butter • Fresh Green Cardamom • Golden Crunch',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'sambusa',
    name: 'Crispy Spiced Sambusa Duo',
    category: 'bites',
    price: 110,
    badge: 'Savory',
    desc: 'Two handmade flaky triangular pockets packed with spiced brown lentils, scallions, and green chili. Served with awaze dip.',
    tastingNotes: 'Savory Lentils • Roasted Cumin • Mild Chili Kick',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80'
  }
];

// --- 2. PRE-ORDER TRAY STATE ---
let tray = [];

// Load persisted tray from session if available
try {
  const saved = localStorage.getItem('chillax_tray');
  if (saved) {
    tray = JSON.parse(saved);
  }
} catch (e) {
  console.warn('LocalStorage unavailable');
}

function saveTray() {
  try {
    localStorage.setItem('chillax_tray', JSON.stringify(tray));
  } catch (e) {}
  updateTrayUI();
}

function addToTray(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const existing = tray.find(i => i.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    tray.push({ ...item, qty: 1 });
  }

  saveTray();
  showToast(`Added "${item.name}" to your tray`);
}

function removeFromTray(itemId) {
  tray = tray.filter(i => i.id !== itemId);
  saveTray();
}

function updateTrayQty(itemId, delta) {
  const item = tray.find(i => i.id === itemId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromTray(itemId);
      return;
    }
  }
  saveTray();
}

function getTrayTotal() {
  return tray.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateTrayUI() {
  const totalCount = tray.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = getTrayTotal();

  // Desktop badge
  const deskBadge = document.getElementById('cart-count-badge');
  if (deskBadge) deskBadge.textContent = totalCount;

  // Mobile badges
  const mobBadge = document.getElementById('mobile-tray-count');
  if (mobBadge) mobBadge.textContent = totalCount;

  // Modal Total
  const modalTotal = document.getElementById('modal-total-amount');
  if (modalTotal) modalTotal.textContent = `${totalAmount} ETB`;

  // Render modal item list
  const listEl = document.getElementById('modal-items-list');
  if (!listEl) return;

  if (tray.length === 0) {
    listEl.innerHTML = `
      <div class="empty-tray-text font-mono">
        Your tray is empty. Tap any menu item or the quick-add buttons below!
      </div>
    `;
  } else {
    listEl.innerHTML = tray.map(item => `
      <div class="tray-item-row">
        <div>
          <div class="tray-item-title">${item.name}</div>
          <div class="tray-item-sub">${item.qty} × ${item.price} ETB = ${item.qty * item.price} ETB</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <button type="button" class="quick-pill" onclick="updateTrayQty('${item.id}', -1)">-</button>
          <span class="font-mono text-sm" style="min-width:18px; text-align:center;">${item.qty}</span>
          <button type="button" class="quick-pill" onclick="updateTrayQty('${item.id}', 1)">+</button>
          <button type="button" class="tray-remove-btn font-mono" onclick="removeFromTray('${item.id}')" title="Remove">✕</button>
        </div>
      </div>
    `).join('');
  }
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-notify');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// --- 3. DYNAMIC MENU RENDERING & TABS ---
function renderMenu(category = 'espresso') {
  const grid = document.getElementById('menu-items-grid');
  if (!grid) return;

  const filtered = category === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === category);

  grid.innerHTML = filtered.map(item => `
    <article class="menu-item-card tilt-card" data-item-id="${item.id}">
      <div class="item-img-box">
        <img 
          src="${item.image}" 
          alt="${item.name} at Chillax Coffee Mekanisa" 
          class="item-img"
          loading="lazy"
        />
        <span class="item-badge">${item.badge}</span>
      </div>
      <div class="item-details">
        <div class="item-header">
          <h3 class="item-name font-serif">${item.name}</h3>
          <span class="item-price font-mono">${item.price} ETB</span>
        </div>
        <p class="item-desc">${item.desc}</p>
        <div class="item-tasting-notes">
          <span class="notes-label font-mono">TASTING NOTES</span>
          <span class="notes-text font-mono">${item.tastingNotes}</span>
        </div>
        <div class="card-actions-row">
          <button class="btn-add-tray" onclick="addToTray('${item.id}')">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Add to Pre-Order Tray</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Animate newly rendered items with GSAP
  if (window.gsap) {
    gsap.fromTo('.menu-item-card', 
      { opacity: 0, y: 18 }, 
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
    );
  }
}

// Setup Quick Add Pills inside Modal
function setupQuickAddPills() {
  const container = document.getElementById('quick-add-pills');
  if (!container) return;

  const popular = [
    { id: 'macchiato', label: '+ Double Macchiato (120 ETB)' },
    { id: 'jebena-brew', label: '+ Jebena Brew (95 ETB)' },
    { id: 'spris', label: '+ Sunrise Spris (180 ETB)' },
    { id: 'fetira', label: '+ Honey Fetira (220 ETB)' }
  ];

  container.innerHTML = popular.map(p => `
    <button type="button" class="quick-pill" onclick="addToTray('${p.id}')">
      ${p.label}
    </button>
  `).join('');
}

// --- 4. REAL-TIME MEKANISA STORE STATUS (Addis Ababa UTC+3) ---
function updateLiveStatus() {
  const now = new Date();
  
  // Calculate Addis Ababa time (UTC + 3 hours)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const addisDate = new Date(utc + (3600000 * 3));

  const day = addisDate.getDay(); // 0 is Sunday, 6 is Saturday
  const hour = addisDate.getHours();
  const minute = addisDate.getMinutes();
  const timeInMinutes = (hour * 60) + minute;

  // Operating Hours:
  // Mon-Fri: 6:30 AM (390m) – 9:30 PM (1290m)
  // Sat: 7:00 AM (420m) – 10:00 PM (1320m)
  // Sun: 7:30 AM (450m) – 9:00 PM (1260m)
  let openTime = 390;
  let closeTime = 1290;
  let closeText = '9:30 PM';

  if (day === 6) { // Saturday
    openTime = 420;
    closeTime = 1320;
    closeText = '10:00 PM';
  } else if (day === 0) { // Sunday
    openTime = 450;
    closeTime = 1260;
    closeText = '9:00 PM';
  }

  const isOpen = (timeInMinutes >= openTime && timeInMinutes <= closeTime);
  const statusTextEl = document.getElementById('live-status-text');
  const locationTagEl = document.getElementById('location-live-tag');

  if (isOpen) {
    if (statusTextEl) statusTextEl.textContent = `Open Now in Mekanisa • Brewing till ${closeText}`;
    if (locationTagEl) {
      locationTagEl.textContent = `OPEN NOW • CLOSES ${closeText}`;
      locationTagEl.style.backgroundColor = '#2E7D32';
    }
  } else {
    if (statusTextEl) statusTextEl.textContent = `Closed Now • Opens Morning 6:30 AM`;
    if (locationTagEl) {
      locationTagEl.textContent = `CLOSED • OPENS 6:30 AM`;
      locationTagEl.style.backgroundColor = '#C86D51';
    }
  }
}

// --- 5. TELEGRAM & WHATSAPP ONE-CLICK DISPATCH ---
function generateOrderMessage() {
  const nameInput = document.getElementById('customer-name');
  const timeInput = document.getElementById('pickup-time');
  const notesInput = document.getElementById('order-notes');

  const customerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Guest Customer';
  const pickupTime = timeInput ? timeInput.value : 'In 15 Minutes';
  const notes = (notesInput && notesInput.value.trim()) ? notesInput.value.trim() : 'None';
  const total = getTrayTotal();

  if (tray.length === 0) {
    alert('Please add at least one coffee or pastry to your tray before submitting!');
    return null;
  }

  const itemsList = tray.map(item => `• ${item.qty}x ${item.name} (${item.qty * item.price} ETB)`).join('\n');

  const message = 
`☕ *CHILLAX COFFEE MEKANISA - PRE-ORDER*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${customerName}
⏰ *Pickup Time:* ${pickupTime}
📝 *Special Notes:* ${notes}

📋 *ITEMS ORDERED:*
${itemsList}

💰 *Estimated Total:* ${total} ETB
📍 *Pickup Location:* Chillax Lounge, Mekanisa, Addis Ababa
━━━━━━━━━━━━━━━━━━━━
_Payment via Telebirr, CBE Birr, or Cash on arrival._`;

  return message;
}

function sendViaTelegram() {
  const msg = generateOrderMessage();
  if (!msg) return;

  // Direct share link to Chillax Mekanisa Telegram channel/bot
  const encoded = encodeURIComponent(msg);
  // Defaulting to Telegram share protocol
  const tgUrl = `https://t.me/share/url?url=${encoded}&text=${encodeURIComponent('Chillax Coffee Mekanisa Pre-Order')}`;
  window.open(tgUrl, '_blank');
}

function sendViaWhatsApp() {
  const msg = generateOrderMessage();
  if (!msg) return;

  const phone = '251911234567'; // Chillax Barista Mekanisa hotline
  const encoded = encodeURIComponent(msg);
  const waUrl = `https://wa.me/${phone}?text=${encoded}`;
  window.open(waUrl, '_blank');
}

// --- 6. AMBIENT ETHIO-CAFE SOUNDSCAPE PLAYER ---
function setupAudioSoundscape() {
  const btn = document.getElementById('soundscape-btn');
  const audio = document.getElementById('cafe-ambiance-audio');
  if (!btn || !audio) return;

  const soundOffIcon = btn.querySelector('.sound-off');
  const soundOnIcon = btn.querySelector('.sound-on');

  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      soundOffIcon.classList.remove('hidden');
      soundOnIcon.classList.add('hidden');
      isPlaying = false;
      showToast('Cafe ambiance audio paused');
    } else {
      audio.volume = 0.45;
      audio.play().then(() => {
        soundOffIcon.classList.add('hidden');
        soundOnIcon.classList.remove('hidden');
        isPlaying = true;
        showToast('Now playing: Mekanisa Coffee House Ambiance');
      }).catch(err => {
        console.warn('Audio play restricted by browser autoplay policy', err);
        showToast('Tap to allow audio playback');
      });
    }
  });
}

// --- 7. MODAL CONTROLS ---
function setupModal() {
  const modal = document.getElementById('order-modal');
  const openBtns = [
    document.getElementById('open-order-modal'),
    document.getElementById('open-cart-btn'),
    document.getElementById('mobile-order-trigger'),
    document.getElementById('mobile-sticky-order')
  ];
  const closeBtn = document.getElementById('close-modal-btn');

  openBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        updateTrayUI();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  // Backdrop click dismiss
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  // ESC key dismiss
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  // Dispatch Buttons
  const tgBtn = document.getElementById('send-telegram-btn');
  const waBtn = document.getElementById('send-whatsapp-btn');
  if (tgBtn) tgBtn.addEventListener('click', sendViaTelegram);
  if (waBtn) waBtn.addEventListener('click', sendViaWhatsApp);

  // Call barista phone button
  const callBtn = document.getElementById('call-store-btn');
  if (callBtn) {
    callBtn.addEventListener('click', () => {
      window.location.href = 'tel:+251911234567';
    });
  }
}

// --- 8. MOBILE MENU TOGGLE ---
function setupMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  const openIcon = toggle.querySelector('.open-icon');
  const closeIcon = toggle.querySelector('.close-icon');

  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      openIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    } else {
      drawer.classList.add('open');
      openIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
    }
  });

  // Close when clicking nav links
  const links = drawer.querySelectorAll('.mobile-nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      openIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    });
  });
}

// --- 9. MAGNETIC BUTTON MICRO-INTERACTIONS ---
function setupMagneticButtons() {
  const magnets = document.querySelectorAll('.magnetic-btn');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// --- 10. GSAP ANIMATIONS & LENIS SMOOTH SCROLL ---
function setupAnimations() {
  // Page Curtain Entrance
  const curtain = document.getElementById('page-curtain');
  if (curtain) {
    setTimeout(() => {
      curtain.classList.add('loaded');
    }, 700);
  }

  // Lenis Smooth Scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // GSAP ScrollTrigger Animations
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero elements reveal
    gsap.from('.fade-in-up', {
      y: 35,
      opacity: 0,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      delay: 0.8
    });

    gsap.from('.fade-in-scale', {
      scale: 0.94,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.9
    });

    // Bento grid cards reveal
    gsap.from('.bento-card', {
      scrollTrigger: {
        trigger: '.bento-grid',
        start: 'top 80%'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    });

    // Journey steps reveal
    gsap.from('.journey-step', {
      scrollTrigger: {
        trigger: '.journey-timeline',
        start: 'top 80%'
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out'
    });

    // Buna ritual box reveal
    gsap.from('.ritual-box', {
      scrollTrigger: {
        trigger: '.buna-ritual-section',
        start: 'top 75%'
      },
      y: 45,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });
  }
}

// --- 11. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Render Default Menu
  renderMenu('espresso');

  // 2. Setup Category Tabs
  const tabs = document.querySelectorAll('.menu-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const category = tab.getAttribute('data-category');
      renderMenu(category);
    });
  });

  // 3. Initialize Quick Add Pills & Tray UI
  setupQuickAddPills();
  updateTrayUI();

  // 4. Real-time Addis Ababa Lounge Status
  updateLiveStatus();
  setInterval(updateLiveStatus, 60000); // Check every minute

  // 5. Setup Modals, Mobile Menu, Audio & Magnets
  setupModal();
  setupMobileMenu();
  setupAudioSoundscape();
  setupMagneticButtons();

  // 6. Init Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 7. Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 8. Animations
  setupAnimations();
});
