import { CategoryType, MenuItemType, LoungeStatusType, OrderResponseType, PreOrderPayload } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const FALLBACK_CATEGORIES: CategoryType[] = [
  { category_id: 'esp', name: 'Coffee & Espresso', slug: 'espresso', icon: '☕' },
  { category_id: 'jeb', name: 'Traditional Ceremony', slug: 'jebena', icon: '🫖' },
  { category_id: 'jui', name: 'Fresh Juices', slug: 'juices', icon: '🍊' },
  { category_id: 'bak', name: 'Bakery & Snacks', slug: 'baked', icon: '🍰' },
];

export const FALLBACK_MENU: MenuItemType[] = [
  {
    item_id: 'macchiato',
    name: 'Double Macchiato',
    description: 'Rich double espresso topped with warm steamed milk foam.',
    price_etb: 120,
    category_id: 'esp',
    category_slug: 'espresso',
    image_url: '/Assets/chillax-inside.webp',
    is_available: true,
    badge: 'Popular',
    tasting_notes: 'Cocoa • Citrus • Caramel',
  },
  {
    item_id: 'jebena-pot',
    name: 'Traditional Jebena Coffee',
    description: 'Authentic Ethiopian coffee brewed slowly in a clay Jebena pot. Served with fresh popcorn and fragrant incense.',
    price_etb: 180,
    category_id: 'jeb',
    category_slug: 'jebena',
    image_url: '/Assets/chillax-inside.webp',
    is_available: true,
    badge: 'Traditional',
    tasting_notes: 'Sweet • Floral • Honey',
  },
  {
    item_id: 'chillax-cookie',
    name: 'Chillax Chocolate Cookie',
    description: 'Baked fresh every day with chocolate chunks and natural honey.',
    price_etb: 150,
    category_id: 'bak',
    category_slug: 'baked',
    image_url: '/Assets/chillax-cookie.webp',
    is_available: true,
    badge: 'House Favorite',
  },
  {
    item_id: 'english-cake',
    name: 'English Butter Cake',
    description: 'Soft, buttery cake baked fresh every morning in our Bisrate Gabriel kitchen.',
    price_etb: 160,
    category_id: 'bak',
    category_slug: 'baked',
    image_url: '/Assets/english-cake.webp',
    is_available: true,
    badge: 'Fresh Daily',
  },
  {
    item_id: 'avocado-juice',
    name: 'Avocado Spris Juice',
    description: 'Layered fresh avocado, mango, and papaya juice. A classic Ethiopian favorite.',
    price_etb: 130,
    category_id: 'jui',
    category_slug: 'juices',
    image_url: '/Assets/chillax-inside.webp',
    is_available: true,
    badge: 'Fresh Fruit',
    tasting_notes: 'Avocado • Mango • Papaya',
  },
  {
    item_id: 'cortado',
    name: 'Cortado',
    description: 'Equal parts espresso and warm milk. Smooth, balanced, and easy to drink.',
    price_etb: 110,
    category_id: 'esp',
    category_slug: 'espresso',
    image_url: '/Assets/chillax-inside.webp',
    is_available: true,
    badge: 'Classic',
    tasting_notes: 'Smooth • Balanced',
  },
];

function getCandidateUrls(path: string): string[] {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    return [
      `/django-api${cleanPath}`,
      `http://localhost:8000/api${cleanPath}`,
      `http://127.0.0.1:8000/api${cleanPath}`,
    ];
  }
  const base = process.env.NEXT_PUBLIC_DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return [`${cleanBase}/api${cleanPath}`, `http://localhost:8000/api${cleanPath}`];
}

export async function fetchCategories(): Promise<CategoryType[] | null> {
  for (const url of getCandidateUrls('/categories/')) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // try next fallback
    }
  }
  return null;
}

export async function fetchMenuItems(): Promise<MenuItemType[] | null> {
  for (const url of getCandidateUrls('/menu/')) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            ...item,
            price_etb: typeof item.price_etb === 'string' ? parseFloat(item.price_etb) : Number(item.price_etb || 0),
            category_id: item.category_slug || item.category_id || 'espresso',
            category_slug: item.category_slug || 'espresso',
            is_available: item.is_available !== false,
          }));
        }
      }
    } catch {
      // try next fallback
    }
  }
  return null;
}

export async function fetchLoungeStatus(): Promise<LoungeStatusType | null> {
  for (const url of getCandidateUrls('/status/')) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {
      // try next fallback
    }
  }
  return null;
}

export async function submitPreOrder(payload: PreOrderPayload): Promise<OrderResponseType> {
  for (const url of getCandidateUrls('/orders/')) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // try next fallback
    }
  }

  const orderSummary = payload.items_json
    .map(i => `${i.qty}× ${i.name}`)
    .join(', ');
  return {
    success: true,
    order_number: `CHX-${Date.now().toString(36).toUpperCase()}`,
    total_etb: payload.total_etb,
    dispatch_text: orderSummary,
    telegram_share_url: `https://t.me/share/url?url=Chillax+Bisrate+Gabriel&text=Pre-order:+${encodeURIComponent(orderSummary)}`,
    whatsapp_url: `https://wa.me/251911234567?text=${encodeURIComponent(`Chillax Order: ${orderSummary}, Total: ${payload.total_etb} ETB, Time: ${payload.pickup_time}`)}`,
  };
}
