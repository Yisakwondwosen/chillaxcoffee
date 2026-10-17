import json
import logging
import os
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Category, MenuItem, BeanOrigin, PreOrder
from .serializers import (
    CategorySerializer,
    MenuItemSerializer,
    BeanOriginSerializer,
    PreOrderSerializer,
)
from .telegram_bot import notify_new_order, process_telegram_update

logger = logging.getLogger(__name__)

# Seed dataset for instant startup
INITIAL_CATEGORIES = [
    {'slug': 'espresso', 'name': 'Coffee & Espresso', 'icon': 'coffee', 'order': 1},
    {'slug': 'jebena', 'name': 'Traditional Ceremony', 'icon': 'jebena', 'order': 2},
    {'slug': 'juices', 'name': 'Fresh Juices', 'icon': 'citrus', 'order': 3},
    {'slug': 'baked', 'name': 'Bakery & Snacks', 'icon': 'croissant', 'order': 4},
]

INITIAL_MENU = [
    {
        'item_id': 'macchiato',
        'category_slug': 'espresso',
        'name': 'The Chillax Double Macchiato',
        'price_etb': '120.00',
        'badge': 'Bisrate Gabriel Favorite',
        'description': 'Velvety micro-foam stained with a bold double shot of our house highland dark roast.',
        'tasting_notes': 'Dark Chocolate • Honey Crema • Hazelnut',
        'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
        'is_featured': True,
    },
    {
        'item_id': 'jebena-brew',
        'category_slug': 'espresso',
        'name': 'Spiced Jebena Brew',
        'price_etb': '95.00',
        'badge': 'Heritage',
        'description': 'Traditional clay-pot slow-brewed coffee infused with a fresh twig of rue (Tena Adam) or cracked green cardamom.',
        'tasting_notes': 'Wild Rue • Bergamot • Frankincense Smoke',
        'image_url': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=80',
        'is_featured': True,
    },
    {
        'item_id': 'honey-latte',
        'category_slug': 'espresso',
        'name': 'Honey-Cinnamon Iced Latte',
        'price_etb': '160.00',
        'badge': 'Iced',
        'description': 'Chilled double espresso swirled with organic Tigray white honey, steamed farm milk, and dusted Ceylon cinnamon.',
        'tasting_notes': 'Tigray White Honey • Ceylon Cinnamon • Velvety Milk',
        'image_url': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80',
        'is_featured': False,
    },
    {
        'item_id': 'guji-pourover',
        'category_slug': 'espresso',
        'name': 'Single-Origin Guji Pour-Over',
        'price_etb': '140.00',
        'badge': 'Single Origin',
        'description': 'Artisanal V60 extraction from sun-dried Guji Grade 1 heirloom beans with floral sweetness.',
        'tasting_notes': 'Ripe Peach • Blueberry • Jasmine Blossom',
        'image_url': 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=700&q=80',
        'is_featured': False,
    },
    {
        'item_id': 'spris',
        'category_slug': 'juices',
        'name': 'Chillax Sunrise Spris',
        'price_etb': '180.00',
        'badge': '100% Fresh',
        'description': 'The iconic Addis tri-color layer: buttery ripe avocado, luscious golden mango, and zesty papaya drizzled with fresh lime & vimto.',
        'tasting_notes': 'Rich Avocado • Sun-Ripened Mango • Zesty Lime',
        'image_url': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&q=80',
        'is_featured': True,
    },
    {
        'item_id': 'karkade',
        'category_slug': 'juices',
        'name': 'Hibiscus & Ginger Cooler (Karkade)',
        'price_etb': '130.00',
        'badge': 'Refreshing',
        'description': 'Cold-steeped ruby red hibiscus flowers infused with spicy crushed Ethiopian ginger root, mint, and clover honey over ice.',
        'tasting_notes': 'Tart Hibiscus • Fiery Ginger • Wild Mint',
        'image_url': 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=700&q=80',
        'is_featured': False,
    },
    {
        'item_id': 'fetira',
        'category_slug': 'bites',
        'name': 'Special Honey Fetira',
        'price_etb': '220.00',
        'badge': 'Made to Order',
        'description': 'Pan-crisped, ultra-flaky layered artisan dough drizzled with warm amber honey and speckled with fragrant black cumin seeds.',
        'tasting_notes': 'Crisp Warm Layers • Wild Amber Honey • Nigella Seeds',
        'image_url': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
        'is_featured': True,
    },
    {
        'item_id': 'croissant',
        'category_slug': 'bites',
        'name': 'Cardamom Croissant',
        'price_etb': '140.00',
        'badge': 'Bakery',
        'description': 'French-laminated pastry baked golden with cultured butter, generously dusted with freshly ground Ethiopian green cardamom sugar.',
        'tasting_notes': 'Cultured Butter • Fresh Green Cardamom • Golden Crunch',
        'image_url': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
        'is_featured': False,
    },
]


def sync_menu_from_json():
    """Syncs database categories and menu items with backend/api/menu_data.json"""
    json_path = settings.BASE_DIR / 'api' / 'menu_data.json'
    if not json_path.exists():
        auto_seed_if_empty()
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        cat_map = {}
        for cat in data.get('categories', []):
            obj, _ = Category.objects.get_or_create(
                slug=cat['slug'],
                defaults={'name': cat['name'], 'icon': cat.get('icon', 'coffee'), 'order': cat.get('order', 1)}
            )
            cat_map[cat['slug']] = obj

        valid_slugs = set()
        for item in data.get('menu', []):
            valid_slugs.add(item['item_id'])
            cat_slug = item.get('category_slug', 'espresso')
            cat_obj = cat_map.get(cat_slug) or Category.objects.first()
            MenuItem.objects.update_or_create(
                item_id=item['item_id'],
                defaults={
                    'category': cat_obj,
                    'name': item['name'],
                    'price_etb': Decimal(str(item['price_etb'])),
                    'badge': item.get('badge', ''),
                    'description': item.get('description', ''),
                    'tasting_notes': item.get('tasting_notes', ''),
                    'image_url': item.get('image_url', '/Assets/chillax-inside.webp'),
                    'is_available': item.get('is_available', True),
                    'is_featured': item.get('is_featured', False),
                }
            )

        # Remove deleted items from database
        MenuItem.objects.exclude(item_id__in=valid_slugs).delete()
    except Exception as e:
        logger.error(f"Error syncing menu from JSON: {e}")
        auto_seed_if_empty()


def auto_seed_if_empty():
    """Ensure database has initial items even on fresh serverless cold starts"""
    if Category.objects.count() == 0:
        cat_map = {}
        for cat in INITIAL_CATEGORIES:
            obj, _ = Category.objects.get_or_create(
                slug=cat['slug'],
                defaults={'name': cat['name'], 'icon': cat['icon'], 'order': cat['order']}
            )
            cat_map[cat['slug']] = obj

        for item in INITIAL_MENU:
            cat_obj = cat_map.get(item['category_slug'])
            if cat_obj:
                MenuItem.objects.get_or_create(
                    item_id=item['item_id'],
                    defaults={
                        'category': cat_obj,
                        'name': item['name'],
                        'price_etb': item['price_etb'],
                        'badge': item['badge'],
                        'description': item['description'],
                        'tasting_notes': item['tasting_notes'],
                        'image_url': item['image_url'],
                        'is_featured': item['is_featured'],
                    }
                )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    sync_menu_from_json()
    categories = Category.objects.all().order_by('order', 'name')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_menu(request):
    sync_menu_from_json()
    category = request.GET.get('category')
    items = MenuItem.objects.filter(is_available=True).select_related('category').order_by('category__order', 'name')
    if category and category != 'all':
        items = items.filter(category__slug=category)
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_lounge_status(request):
    """
    Computes exact real-time open/closed status for Bisrate Gabriel Cafe in Addis Ababa time (UTC+3)
    """
    # UTC+3 offset for Addis Ababa
    eat_tz = timezone(timedelta(hours=3))
    now_addis = datetime.now(eat_tz)
    weekday = now_addis.weekday() # 0 = Monday, 5 = Saturday, 6 = Sunday
    hour = now_addis.hour
    minute = now_addis.minute
    total_minutes = (hour * 60) + minute

    # Hours:
    # Mon-Fri (0-4): 6:30 AM (390m) - 9:30 PM (1290m)
    # Sat (5): 7:00 AM (420m) - 10:00 PM (1320m)
    # Sun (6): 7:30 AM (450m) - 9:00 PM (1260m)
    if weekday == 5:
        open_m, close_m, close_label = 420, 1320, '10:00 PM'
    elif weekday == 6:
        open_m, close_m, close_label = 450, 1260, '9:00 PM'
    else:
        open_m, close_m, close_label = 390, 1290, '9:30 PM'

    is_open = open_m <= total_minutes <= close_m

    return Response({
        'timezone': 'Africa/Addis_Ababa (UTC+3)',
        'addis_time': now_addis.strftime('%I:%M %p'),
        'is_open': is_open,
        'status_badge': f"Open Now in Bisrate Gabriel • Brewing till {close_label}" if is_open else "Closed Now • Opens Morning 6:30 AM",
        'closes_at': close_label,
        'today_roast': 'Yirgacheffe Grade 1 Washed (Bergamot • Jasmine • Honey)',
        'barista_note': 'Traditional Charcoal Buna roasted every hour on the patio.',
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def create_preorder(request):
    """
    Creates a pre-order record and immediately alerts the staff Telegram bot
    """
    serializer = PreOrderSerializer(data=request.data)
    if serializer.is_valid():
        try:
            order = serializer.save()
        except Exception:
            order = PreOrder(**serializer.validated_data)
            if not getattr(order, 'order_number', None):
                order.order_number = f"CHX-{datetime.now().strftime('%y%m%d%H%M%S')}"

        # Trigger real-time Telegram Bot alert to the staff desk
        try:
            notify_new_order(order)
        except Exception:
            pass

        # Format pre-order text for customer mobile messengers
        items_text = "\n".join([
            f"• {item.get('qty', 1)}x {item.get('name', '')} ({float(item.get('price_etb', 0)) * int(item.get('qty', 1))} ETB)"
            for item in order.items_json
        ]) if isinstance(order.items_json, list) else ""

        order_text = (
            f"☕ *CHILLAX COFFEE - ORDER #{order.order_number}*\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"👤 *Customer:* {order.customer_name}\n"
            f"⏰ *Pickup / Delivery:* {order.pickup_time}\n"
            f"📝 *Notes:* {order.order_notes or 'None'}\n\n"
            f"📋 *ITEMS ORDERED:*\n{items_text}\n\n"
            f"💰 *Total:* {order.total_etb} ETB\n"
            f"📍 *Location:* Bisrate Gabriel, Addis Ababa\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"_Pay via Telebirr, CBE Birr, or Cash upon arrival or delivery._"
        )

        return Response({
            'success': True,
            'order_number': order.order_number,
            'total_etb': order.total_etb,
            'order_text': order_text,
            'telegram_share_url': f"https://t.me/share/url?url={order_text}",
            'whatsapp_url': f"https://wa.me/251911234567?text={order_text}",
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_webhook(request):
    """
    Receives incoming webhook updates from Telegram (messages and button taps)
    """
    try:
        process_telegram_update(request.data)
    except Exception as e:
        pass
    return Response({'ok': True})



@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Root index endpoint welcoming developers and visitors to the Chillax Coffee API
    """
    auto_seed_if_empty()
    return Response({
        'brand': 'Chillax Coffee',
        'location': 'Bisrate Gabriel, Addis Ababa, Ethiopia',
        'status': 'Online',
        'frontend_url': 'http://localhost:3000',
        'endpoints': {
            'menu': request.build_absolute_uri('/api/menu/'),
            'categories': request.build_absolute_uri('/api/categories/'),
            'lounge_status': request.build_absolute_uri('/api/status/'),
            'orders': request.build_absolute_uri('/api/orders/'),
            'admin': request.build_absolute_uri('/admin/'),
        },
        'message': 'Welcome! To view the full interactive Next.js user interface, run `cd frontend && bun dev` and visit http://localhost:3000'
    })


def root_landing_view(request):
    """
    Friendly HTML landing page when opening http://127.0.0.1:8000/ in a browser
    """
    from django.http import HttpResponse
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chillax Coffee API • Bisrate Gabriel, Addis Ababa</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f2f0eb;
      color: rgba(0,0,0,0.87);
      margin: 0;
      padding: 3rem 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }
    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 620px;
      width: 100%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.08);
    }
    .badge {
      display: inline-block;
      background: #e8f5e9;
      color: #006241;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    h1 {
      color: #006241;
      font-size: 1.85rem;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }
    p {
      color: rgba(0,0,0,0.65);
      line-height: 1.6;
      font-size: 15px;
      margin-bottom: 1.5rem;
    }
    .notice {
      background: #faf6ee;
      border-left: 4px solid #cba258;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 14px;
    }
    .btn {
      display: inline-block;
      background: #00754A;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      transition: background 0.2s;
    }
    .btn:hover { background: #00623e; }
    .btn-outline {
      background: transparent;
      color: #00754A;
      border: 1.5px solid #00754A;
    }
    .btn-outline:hover { background: rgba(0,117,74,0.06); }
    ul { list-style: none; padding: 0; margin: 0; }
    li { margin-bottom: 0.5rem; }
    li a { color: #00754A; text-decoration: none; font-family: monospace; font-size: 14px; }
    li a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Django REST API • Online</span>
    <h1>Chillax Coffee Backend</h1>
    <p>Bisrate Gabriel, Addis Ababa, Ethiopia • Specialty Coffee & Neighborhood Lounge</p>

    <div class="notice">
      <strong>Looking for the frontend website?</strong><br>
      The Next.js user interface runs on <a href="http://localhost:3000" style="color:#00754A; font-weight:bold;">http://localhost:3000</a>.
      Start it in your terminal with: <code style="background:#fff; padding:2px 6px; border-radius:4px;">cd frontend && bun run dev</code>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <a href="http://localhost:3000" class="btn">Open Frontend (Port 3000)</a>
      <a href="/api/menu/" class="btn btn-outline">Explore Menu JSON</a>
      <a href="/admin/" class="btn btn-outline">Django Admin</a>
    </div>

    <h3 style="font-size: 14px; text-transform: uppercase; color: #006241; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Available API Endpoints:</h3>
    <ul>
      <li>✦ <a href="/api/menu/">/api/menu/</a>: Coffee & Pastry Menu with ETB prices</li>
      <li>✦ <a href="/api/status/">/api/status/</a>: Live Bisrate Gabriel open/closed status (UTC+3)</li>
      <li>✦ <a href="/api/categories/">/api/categories/</a>: Menu categories list</li>
      <li>✦ <a href="/api/orders/">/api/orders/</a>: Pre-order creation & Telegram notification</li>
      <li>✦ <a href="/admin/">/admin/</a>: Django Administration panel</li>
    </ul>
  </div>
</body>
</html>"""
    return HttpResponse(html_content)
