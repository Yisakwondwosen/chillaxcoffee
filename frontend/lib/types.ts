export interface CategoryType {
  category_id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface MenuItemType {
  item_id: string;
  name: string;
  description: string;
  price_etb: number;
  category_id: string;
  category_slug: string;
  image_url: string;
  is_available: boolean;
  tags?: string[];
  badge?: string;
  tasting_notes?: string;
}

export interface TrayItemType extends MenuItemType {
  qty: number;
}

export interface LoungeStatusType {
  timezone: string;
  addis_time: string;
  is_open: boolean;
  status_badge: string;
  closes_at: string;
  today_roast: string;
  barista_note: string;
}

export interface OrderResponseType {
  success: boolean;
  order_number: string;
  total_etb: number;
  dispatch_text: string;
  telegram_share_url: string;
  whatsapp_url: string;
}

export interface PreOrderPayload {
  customer_name: string;
  pickup_time: string;
  order_notes: string;
  total_etb: number;
  channel?: 'WEB' | 'TELEGRAM' | 'WHATSAPP';
  items_json: { item_id: string; name: string; qty: number; price_etb: number }[];
}
