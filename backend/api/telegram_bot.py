import base64
import json
import logging
import os
import re
import subprocess
import threading
import urllib.parse
import urllib.request
from decimal import Decimal
from pathlib import Path
from django.conf import settings
from django.utils import timezone
from .models import Category, MenuItem, PreOrder

logger = logging.getLogger(__name__)

TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/{method}"


def get_bot_token():
    return getattr(settings, 'TELEGRAM_BOT_TOKEN', '') or os.environ.get('TELEGRAM_BOT_TOKEN', '') or '8694804931:AAE3lyyVfPGZ0rxsHKFtBMqgo0I2IxFZ_n4'


def get_staff_chat_id():
    return getattr(settings, 'TELEGRAM_STAFF_CHAT_ID', '') or os.environ.get('TELEGRAM_STAFF_CHAT_ID', '') or '6353858898'


def make_telegram_request(method, payload=None):
    """Executes a JSON API call to Telegram Bot API"""
    token = get_bot_token()
    if not token:
        logger.warning(f"Telegram Bot Token not configured. Cannot call {method}.")
        return None

    url = TELEGRAM_API_URL.format(token=token, method=method)
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload or {}).encode('utf-8') if payload else None

    try:
        req = urllib.request.Request(url, data=data, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = response.read().decode('utf-8')
            return json.loads(res_data)
    except Exception as e:
        logger.error(f"Error calling Telegram API {method}: {e}")
        return None


def send_message(chat_id, text, reply_markup=None, parse_mode="HTML"):
    """Sends a text message to a chat with optional inline keyboard"""
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return make_telegram_request("sendMessage", payload)


def edit_message_text(chat_id, message_id, text, reply_markup=None, parse_mode="HTML"):
    """Edits an existing Telegram message in place"""
    payload = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return make_telegram_request("editMessageText", payload)


def answer_callback_query(callback_query_id, text=None, show_alert=False):
    """Acknowledges an inline button tap in Telegram"""
    payload = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
        payload["show_alert"] = show_alert
    return make_telegram_request("answerCallbackQuery", payload)


def save_uploaded_image_bytes(photo_bytes, save_name_hint="item", ext=".jpg"):
    """
    Saves image bytes to:
    1. /tmp/uploads (always writable on Vercel/Linux)
    2. frontend/public/uploads (local dev workspace)
    3. Directly commits photo to GitHub repository at frontend/public/uploads/{filename} via GitHub REST API
    Returns the relative web path: f"/uploads/{filename}"
    """
    clean_hint = re.sub(r'[^a-z0-9_-]+', '-', save_name_hint.lower()).strip('-')[:30] or "item"
    unique_suffix = timezone.now().strftime("%Y%m%d_%H%M%S")
    clean_ext = ext if ext.startswith('.') else f".{ext}"
    if clean_ext.lower() not in ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'):
        clean_ext = '.jpg'
    filename = f"{clean_hint}_{unique_suffix}{clean_ext.lower()}"

    # 1. Save to /tmp/uploads (always writable on Vercel and Linux)
    try:
        tmp_dir = Path("/tmp") / "uploads"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        with open(tmp_dir / filename, "wb") as f:
            f.write(photo_bytes)
    except Exception as te:
        logger.warning(f"Could not save to /tmp/uploads: {te}")

    # 2. Save to workspace if writable (local dev environment)
    try:
        upload_dir = settings.BASE_DIR.parent / "frontend" / "public" / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        with open(upload_dir / filename, "wb") as f:
            f.write(photo_bytes)
    except Exception:
        pass

    # 3. DIRECTLY COMMIT PHOTO TO GITHUB REPOSITORY via REST API
    github_token = get_github_token()
    github_repo = get_github_repo()
    if github_token and github_repo:
        try:
            p_b64 = base64.b64encode(photo_bytes).decode('utf-8')
            p_path = f"frontend/public/uploads/{filename}"
            p_url = f"https://api.github.com/repos/{github_repo}/contents/{p_path}"
            headers = {
                'Authorization': f'Bearer {github_token}',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Chillax-Bot'
            }
            p_sha = None
            try:
                p_req = urllib.request.Request(p_url, headers=headers)
                with urllib.request.urlopen(p_req, timeout=10) as presp:
                    p_info = json.loads(presp.read().decode('utf-8'))
                    p_sha = p_info.get('sha')
            except Exception:
                p_sha = None

            p_payload = {
                'message': f'upload photo {filename}',
                'content': p_b64,
                'branch': 'main'
            }
            if p_sha:
                p_payload['sha'] = p_sha

            put_req = urllib.request.Request(
                p_url,
                data=json.dumps(p_payload).encode('utf-8'),
                headers=headers,
                method='PUT'
            )
            with urllib.request.urlopen(put_req, timeout=30) as pput:
                logger.info(f"Photo directly committed to GitHub: {p_path}")
        except Exception as ge:
            logger.error(f"Error uploading photo directly to GitHub: {ge}")

    logger.info(f"Successfully processed photo: /uploads/{filename}")
    return f"/uploads/{filename}"


def handle_admin_uploaded_file(uploaded_file, save_name_hint="item"):
    """Handles an uploaded file from Django forms.FileField or request.FILES"""
    if not uploaded_file:
        return None
    ext = os.path.splitext(uploaded_file.name)[1] or ".jpg"
    photo_bytes = uploaded_file.read()
    return save_uploaded_image_bytes(photo_bytes, save_name_hint=save_name_hint, ext=ext)


def download_telegram_photo(file_id, save_name_hint="item"):
    """Downloads a photo sent to Telegram Bot, writes to /tmp, and commits directly to GitHub via REST API"""
    token = get_bot_token()
    if not token:
        logger.warning("No Telegram Bot token configured; cannot download photo.")
        return None

    try:
        file_info = make_telegram_request("getFile", {"file_id": file_id})
        if not file_info or not file_info.get("ok"):
            logger.error(f"Failed to getFile info from Telegram: {file_info}")
            return None

        file_path = file_info["result"].get("file_path")
        if not file_path:
            return None

        ext = os.path.splitext(file_path)[1] or ".jpg"
        download_url = f"https://api.telegram.org/file/bot{token}/{file_path}"
        req = urllib.request.Request(download_url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            photo_bytes = resp.read()

        return save_uploaded_image_bytes(photo_bytes, save_name_hint=save_name_hint, ext=ext)
    except Exception as e:
        logger.error(f"Error downloading photo from Telegram: {e}")
        return None


def format_order_text(order, updated_by=None):
    """Formats an order into clean, easy-to-read HTML for staff on Telegram"""
    status_icons = {
        'PENDING': '⏳ PENDING',
        'BREWING': '☕ PREPARING',
        'READY': '✅ READY FOR PICKUP',
        'DELIVERY': '🛵 OUT FOR DELIVERY',
        'COMPLETED': '🏁 COMPLETED',
        'CANCELLED': '❌ CANCELLED',
    }
    status_label = status_icons.get(order.status, order.status)

    items_lines = []
    if isinstance(order.items_json, list):
        for item in order.items_json:
            qty = item.get('qty', 1)
            name = item.get('name', 'Item')
            price = item.get('price_etb', 0)
            items_lines.append(f"• <b>{qty}× {name}</b> ({float(price) * int(qty):.0f} ETB)")
    items_block = "\n".join(items_lines) if items_lines else "• Standard Order"

    notes_text = f"\n📝 <i>Special instructions:</i> {order.order_notes}" if order.order_notes else ""
    updated_text = f"\n👤 <i>Handled by:</i> @{updated_by}" if updated_by else ""

    text = (
        f"☕ <b>CHILLAX COFFEE - ORDER #{order.order_number}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>Customer:</b> {order.customer_name}\n"
        f"⏰ <b>Time:</b> {order.pickup_time}\n"
        f"📍 <b>Location:</b> Bisrate Gabriel Cafe\n"
        f"{notes_text}\n"
        f"📋 <b>ITEMS:</b>\n"
        f"{items_block}\n\n"
        f"💰 <b>Total Amount:</b> {float(order.total_etb):.0f} ETB\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"Status: <b>{status_label}</b>"
        f"{updated_text}"
    )
    return text


def get_order_inline_keyboard(order_number, current_status):
    """Builds interactive inline buttons to transition order state"""
    buttons = []
    if current_status == 'PENDING':
        buttons.append([
            {"text": "☕ Accept & Prepare", "callback_data": f"order:{order_number}:BREWING"},
            {"text": "❌ Cancel", "callback_data": f"order:{order_number}:CANCELLED"},
        ])
    elif current_status == 'BREWING':
        buttons.append([
            {"text": "✅ Ready for Pickup", "callback_data": f"order:{order_number}:READY"},
            {"text": "🛵 Send for Delivery", "callback_data": f"order:{order_number}:DELIVERY"},
        ])
    elif current_status in ('READY', 'DELIVERY'):
        buttons.append([
            {"text": "🏁 Mark Completed", "callback_data": f"order:{order_number}:COMPLETED"},
        ])

    return {"inline_keyboard": buttons} if buttons else None


def notify_new_order(order):
    """Sends immediate alert to the staff Telegram chat when a customer orders"""
    chat_id = get_staff_chat_id()
    if not chat_id:
        logger.info(f"New order #{order.order_number} created, but TELEGRAM_STAFF_CHAT_ID is not configured.")
        return None

    text = format_order_text(order)
    keyboard = get_order_inline_keyboard(order.order_number, order.status)
    return send_message(chat_id, text, reply_markup=keyboard)


def handle_callback_query(callback_query):
    """Handles staff tapping status buttons on Telegram"""
    callback_id = callback_query.get("id")
    data = callback_query.get("data", "")
    message = callback_query.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    message_id = message.get("message_id")
    from_user = callback_query.get("from", {}).get("username") or callback_query.get("from", {}).get("first_name", "Staff")

    # Format: order:<order_number>:<new_status>
    if data.startswith("order:"):
        parts = data.split(":")
        if len(parts) == 3:
            _, order_number, new_status = parts
            order = None
            try:
                order = PreOrder.objects.get(order_number=order_number)
                order.status = new_status
                order.save(update_fields=['status'])
            except Exception:
                order = None

            answer_callback_query(callback_id, text=f"Order #{order_number} updated to {new_status}!", show_alert=False)

            if order:
                updated_text = format_order_text(order, updated_by=from_user)
            else:
                existing_text = message.get("text", "")
                status_icons = {
                    'PENDING': '⏳ PENDING',
                    'BREWING': '☕ PREPARING',
                    'READY': '✅ READY FOR PICKUP',
                    'DELIVERY': '🛵 OUT FOR DELIVERY',
                    'COMPLETED': '🏁 COMPLETED',
                    'CANCELLED': '❌ CANCELLED',
                }
                status_label = status_icons.get(new_status, new_status)
                lines = [l for l in existing_text.split('\n') if not l.startswith('Status:') and not l.startswith('👤 Handled by:')]
                lines.append(f"Status: <b>{status_label}</b>")
                lines.append(f"👤 <i>Handled by:</i> @{from_user}")
                updated_text = "\n".join(lines)

            updated_keyboard = get_order_inline_keyboard(order_number, new_status)
            edit_message_text(chat_id, message_id, updated_text, reply_markup=updated_keyboard)
            return

    # Toggle menu item: toggle:<item_id>
    if data.startswith("toggle:"):
        item_id = data.split(":", 1)[1]
        try:
            item = MenuItem.objects.get(item_id=item_id)
            item.is_available = not item.is_available
            item.save(update_fields=['is_available'])
            state_text = "In Stock 🟢" if item.is_available else "Sold Out ⏸"
            answer_callback_query(callback_id, text=f"{item.name} is now {state_text}")
            edit_message_text(chat_id, message_id, f"✅ <b>{item.name}</b> is now <b>{state_text}</b> on the website.\n🚀 <i>Deploying live to chillaxcoffee.vercel.app (~45s)...</i>")
            trigger_git_sync(f"toggle {item.name} availability", chat_id=chat_id)
            return
        except MenuItem.DoesNotExist:
            answer_callback_query(callback_id, text="Item not found.")
            return

    # Delete menu item: delete:<item_id>
    if data.startswith("delete:"):
        item_id = data.split(":", 1)[1]
        try:
            item = MenuItem.objects.get(item_id=item_id)
            deleted_name = item.name
            item.delete()
            answer_callback_query(callback_id, text=f"Deleted {deleted_name} from website!")
            edit_message_text(chat_id, message_id, f"🗑 <b>{deleted_name}</b> was successfully removed from the website catalog.\n🚀 <i>Deploying live to chillaxcoffee.vercel.app (~45s)...</i>")
            trigger_git_sync(f"delete {deleted_name}", chat_id=chat_id)
            return
        except MenuItem.DoesNotExist:
            answer_callback_query(callback_id, text="Item not found or already deleted.")
            return

    answer_callback_query(callback_id)


def get_github_token():
    return getattr(settings, 'GITHUB_TOKEN', '') or os.environ.get('GITHUB_TOKEN', '')


def get_github_repo():
    return getattr(settings, 'GITHUB_REPO', '') or os.environ.get('GITHUB_REPO', '') or 'Yisakwondwosen/chillaxcoffee'


def _run_github_api_sync(action_description, chat_id=None, uploaded_photo_url=None):
    """Commits menu_data.json and any uploaded photos to GitHub repository using REST API"""
    token = get_github_token()
    repo = get_github_repo()
    if not token or not repo:
        logger.warning("GitHub token or repo not configured. Falling back to local git.")
        _run_git_sync(action_description, chat_id)
        return

    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Chillax-Bot'
    }

    try:
        # 1. If photo was uploaded, commit it to GitHub repository
        if uploaded_photo_url and uploaded_photo_url.startswith('/uploads/'):
            filename = uploaded_photo_url.replace('/uploads/', '').strip('/')
            photo_dest = settings.BASE_DIR.parent / "frontend" / "public" / "uploads" / filename
            if not photo_dest.exists():
                photo_dest = settings.BASE_DIR / "uploads" / filename
            if not photo_dest.exists():
                photo_dest = Path("/tmp") / "uploads" / filename
            if photo_dest.exists():
                try:
                    with open(photo_dest, 'rb') as pf:
                        p_b64 = base64.b64encode(pf.read()).decode('utf-8')
                    p_path = f"frontend/public/uploads/{filename}"
                    p_url = f"https://api.github.com/repos/{repo}/contents/{p_path}"

                    p_sha = None
                    try:
                        p_req = urllib.request.Request(p_url, headers=headers)
                        with urllib.request.urlopen(p_req, timeout=15) as presp:
                            p_info = json.loads(presp.read().decode('utf-8'))
                            p_sha = p_info.get('sha')
                    except Exception:
                        p_sha = None

                    p_payload = {
                        'message': f'bot: upload photo for {action_description}',
                        'content': p_b64,
                        'branch': 'main'
                    }
                    if p_sha:
                        p_payload['sha'] = p_sha

                    p_put_req = urllib.request.Request(
                        p_url,
                        data=json.dumps(p_payload).encode('utf-8'),
                        headers=headers,
                        method='PUT'
                    )
                    urllib.request.urlopen(p_put_req, timeout=30)
                    logger.info(f"Photo uploaded to GitHub: {p_path}")
                except Exception as pe:
                    logger.error(f"Error uploading photo via GitHub API: {pe}")

        # 2. Serialize full database to menu_data.json
        from .serializers import MenuItemSerializer, CategorySerializer
        categories = Category.objects.all().order_by('order', 'name')
        items = MenuItem.objects.all().select_related('category').order_by('category__order', 'name')
        menu_json = {
            'categories': CategorySerializer(categories, many=True).data,
            'menu': MenuItemSerializer(items, many=True).data
        }
        json_str = json.dumps(menu_json, indent=2, ensure_ascii=False)

        # Save locally as well if writable
        try:
            local_json_path = settings.BASE_DIR / 'api' / 'menu_data.json'
            with open(local_json_path, 'w', encoding='utf-8') as f:
                f.write(json_str)
        except Exception:
            pass

        content_b64 = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')

        # 3. Fetch current file SHA on GitHub
        file_path = "backend/api/menu_data.json"
        api_url = f"https://api.github.com/repos/{repo}/contents/{file_path}"
        current_sha = None

        try:
            get_req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(get_req, timeout=15) as gresp:
                gdata = json.loads(gresp.read().decode('utf-8'))
                current_sha = gdata.get('sha')
        except Exception:
            current_sha = None

        # 4. Commit updated menu_data.json to GitHub main branch
        commit_payload = {
            'message': f'bot: {action_description}',
            'content': content_b64,
            'branch': 'main'
        }
        if current_sha:
            commit_payload['sha'] = current_sha

        put_req = urllib.request.Request(
            api_url,
            data=json.dumps(commit_payload).encode('utf-8'),
            headers=headers,
            method='PUT'
        )

        with urllib.request.urlopen(put_req, timeout=30) as presp:
            cdata = json.loads(presp.read().decode('utf-8'))
            logger.info(f"GitHub API sync success for {action_description}: {cdata.get('commit', {}).get('sha')}")

            if chat_id:
                msg = (
                    f"🚀 <b>Live Website Deployed!</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━━\n"
                    f"✅ <b>Change:</b> {action_description}\n"
                    f"🌐 Pushed to GitHub. Vercel deployment is now live:\n"
                    f"👉 <a href=\"https://chillaxcoffee.vercel.app\">chillaxcoffee.vercel.app</a>\n"
                    f"⏱ <i>Updates in ~45 seconds!</i>"
                )
                send_message(chat_id, msg)
    except urllib.error.HTTPError as he:
        err_msg = str(he)
        try:
            err_body = he.read().decode('utf-8')
            err_json = json.loads(err_body)
            err_msg = err_json.get('message', err_body)
        except Exception:
            pass
        logger.error(f"GitHub API Error: {he.code} {err_msg}")
        if chat_id:
            if he.code == 403:
                send_message(
                    chat_id,
                    f"⚠️ <b>GitHub Token Permission Notice:</b>\n"
                    f"Your GitHub token needs <b>Contents: Read and write</b> permission to commit changes.\n"
                    f"Please edit your token at: https://github.com/settings/tokens and check 'Contents -> Read & Write'."
                )
            else:
                send_message(chat_id, f"⚠️ GitHub sync failed: {err_msg}")
    except Exception as e:
        logger.error(f"Error in _run_github_api_sync: {e}")


def _run_git_sync(action_description, chat_id=None):
    """Fallback local git commit and push if running on developer workstation"""
    try:
        repo_dir = settings.BASE_DIR.parent
        subprocess.run(
            ["git", "add", "backend/db.sqlite3", "backend/api/menu_data.json", "frontend/public/uploads/"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=30,
        )

        status_res = subprocess.run(
            ["git", "status", "--porcelain", "backend/db.sqlite3", "backend/api/menu_data.json", "frontend/public/uploads/"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=10,
        )

        if not status_res.stdout.strip():
            logger.info("Git sync: No changes to commit.")
            return

        commit_res = subprocess.run(
            ["git", "commit", "-m", f"bot: {action_description}"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=30,
        )

        push_res = subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=60,
        )

        if push_res.returncode == 0:
            logger.info(f"Git sync successful for {action_description}")
            if chat_id:
                msg = (
                    f"🚀 <b>Live Website Deployed!</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━━\n"
                    f"✅ <b>Change:</b> {action_description}\n"
                    f"🌐 Pushed to GitHub. Vercel deployment is now live:\n"
                    f"👉 <a href=\"https://chillaxcoffee.vercel.app\">chillaxcoffee.vercel.app</a>"
                )
                send_message(chat_id, msg)
        else:
            logger.error(f"Git push failed: {push_res.stderr}")
            if chat_id:
                send_message(chat_id, f"⚠️ Local update saved, but GitHub push failed:\n<code>{push_res.stderr[:200]}</code>")
    except Exception as e:
        logger.error(f"Error in _run_git_sync: {e}")


def trigger_git_sync(action_description, chat_id=None, uploaded_photo_url=None):
    """Triggers background GitHub API sync so Vercel auto-deploys within ~45s"""
    t = threading.Thread(target=_run_github_api_sync, args=(action_description, chat_id, uploaded_photo_url), daemon=True)
    t.start()


def save_staff_chat_id(chat_id):
    """Automatically persists staff chat ID so incoming website orders route to this chat"""
    chat_str = str(chat_id)
    os.environ['TELEGRAM_STAFF_CHAT_ID'] = chat_str
    if hasattr(settings, 'TELEGRAM_STAFF_CHAT_ID'):
        settings.TELEGRAM_STAFF_CHAT_ID = chat_str
    env_path = os.path.join(settings.BASE_DIR, '.env')
    try:
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'TELEGRAM_STAFF_CHAT_ID=' in content:
                content = re.sub(r'TELEGRAM_STAFF_CHAT_ID=.*', f'TELEGRAM_STAFF_CHAT_ID={chat_str}', content)
            else:
                content += f"\nTELEGRAM_STAFF_CHAT_ID={chat_str}\n"
            with open(env_path, 'w', encoding='utf-8') as f:
                f.write(content)
    except Exception as e:
        logger.error(f"Error saving chat ID to .env: {e}")


def handle_message(message):
    """Processes staff commands (/add, /delete, /toggle, /menu, /orders, /today, etc.)"""
    chat_id = message.get("chat", {}).get("id")
    text = (message.get("text") or message.get("caption") or "").strip()
    user = message.get("from", {}).get("first_name", "Staff")
    photos = message.get("photo") or []

    if not text and not photos:
        return

    # Auto-register this chat if no staff chat ID is saved yet
    if not get_staff_chat_id():
        save_staff_chat_id(chat_id)

    # Photo sent with no command caption
    if photos and not text:
        prompt = (
            "📸 <b>Photo received!</b>\n\n"
            "To add this photo with a new menu item, please send or forward the photo with this caption:\n"
            "<code>/add Name | Price | Category | Description</code>\n\n"
            "<b>Example:</b>\n"
            "<code>/add Strawberry Cheesecake | 180 | baked | Rich New York style cheesecake with fresh strawberries</code>"
        )
        send_message(chat_id, prompt)
        return

    # Command: /start or /help
    if text.startswith(("/start", "/help")):
        welcome = (
            f"👋 <b>Welcome to Chillax Coffee Staff Bot!</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"Use this bot to manage live website orders and menu items directly on the website.\n\n"
            f"<b>Available Commands:</b>\n"
            f"• <code>/menu</code>: View all menu items on the website\n"
            f"• <code>/add Name | Price | Category | Description</code>: Add a new item\n"
            f"• <code>/delete &lt;Item Name&gt;</code>: Delete an item from the website\n"
            f"• <code>/delete</code>: Show clickable buttons to delete any item\n"
            f"• <code>/toggle &lt;Item Name&gt;</code>: Mark item In-Stock 🟢 or Sold-Out ⏸\n"
            f"• <code>/orders</code>: View current active orders\n"
            f"• <code>/today</code>: View today's total sales and revenue\n"
            f"• <code>/chatid</code>: Show chat ID and check alert status\n\n"
            f"<b>How to add with a Photo:</b>\n"
            f"1. Attach or take a photo in Telegram\n"
            f"2. Add caption: <code>/add Name | Price | Category | Description</code>\n"
            f"3. Send! The photo is saved and published live on the website.\n\n"
            f"<b>Example deleting an item:</b>\n"
            f"<code>/delete machiato</code>"
        )
        send_message(chat_id, welcome)
        return

    # Command: /chatid
    if text.startswith("/chatid"):
        save_staff_chat_id(chat_id)
        send_message(chat_id, f"📍 <b>Connected!</b> Your Chat ID is: <code>{chat_id}</code>\n✅ This chat is registered to receive live website orders!")
        return

    # Command: /orders
    if text.startswith("/orders"):
        all_orders = PreOrder.objects.all().order_by('-created_at')[:20]
        if not all_orders.exists():
            send_message(chat_id, "ℹ️ No orders placed yet on the website.")
            return

        active_orders = [o for o in all_orders if o.status in ('PENDING', 'BREWING', 'READY', 'DELIVERY')]
        completed_orders = [o for o in all_orders if o.status in ('COMPLETED', 'CANCELLED')]

        summary = (
            f"📋 <b>ALL ORDERS FROM WEBSITE ({len(all_orders)} recent)</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"⏳ Active Orders: <b>{len(active_orders)}</b>\n"
            f"🏁 Completed / Closed: <b>{len(completed_orders)}</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━"
        )
        send_message(chat_id, summary)

        # Send all active orders first with action buttons
        for order in active_orders:
            text_out = format_order_text(order)
            keyboard = get_order_inline_keyboard(order.order_number, order.status)
            send_message(chat_id, text_out, reply_markup=keyboard)

        # If there are also completed orders, list them
        if completed_orders:
            if not active_orders:
                send_message(chat_id, "✅ All orders are completed! Showing recent history:")
            for order in completed_orders[:5]:
                text_out = format_order_text(order)
                send_message(chat_id, text_out)
        return

    # Command: /today
    if text.startswith("/today") or text.startswith("/stats"):
        today = timezone.now().date()
        todays_orders = PreOrder.objects.filter(created_at__date=today)
        total_count = todays_orders.count()
        completed_count = todays_orders.filter(status='COMPLETED').count()
        total_rev = sum(float(o.total_etb) for o in todays_orders.exclude(status='CANCELLED'))

        stats = (
            f"📊 <b>TODAY'S SUMMARY - CHILLAX COFFEE</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"📅 Date: {today.strftime('%B %d, %Y')}\n"
            f"📦 Total Orders Placed: <b>{total_count}</b>\n"
            f"🏁 Completed Orders: <b>{completed_count}</b>\n"
            f"💰 Total Revenue: <b>{total_rev:,.0f} ETB</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━"
        )
        send_message(chat_id, stats)
        return

    # Command: /menu
    if text.startswith("/menu"):
        items = MenuItem.objects.all().select_related('category').order_by('category__order', 'name')
        if not items.exists():
            send_message(chat_id, "No menu items found in the database. Use <code>/add</code> to create one!")
            return

        lines = ["📜 <b>CURRENT WEBSITE MENU ITEMS:</b>\n"]
        for itm in items:
            status_icon = "🟢" if itm.is_available else "⏸ (Sold out)"
            lines.append(f"• <b>{itm.name}</b>: {float(itm.price_etb):.0f} ETB [{itm.category.name}] {status_icon}")

        lines.append("\n<i>To add a new item, use:</i>\n<code>/add Name | Price | Category | Description</code>")
        send_message(chat_id, "\n".join(lines))
        return

    # Command: /add or /additem
    # Syntax: /add Name | Price | Category | Description | Optional_Image_URL
    # Or attach a photo in Telegram with caption: /add Name | Price | Category | Description
    if text.startswith(("/add", "/additem")):
        raw = text.split(" ", 1)
        if len(raw) < 2 or not raw[1].strip():
            usage = (
                "ℹ️ <b>How to Add a Menu Item with a Photo:</b>\n\n"
                "<b>Method 1 (Attach Photo directly):</b>\n"
                "Attach or take a photo in Telegram, and write this caption:\n"
                "<code>/add Name | Price | Category | Description</code>\n\n"
                "<b>Method 2 (Using an Image Web Link):</b>\n"
                "<code>/add Name | Price | Category | Description | Image_URL</code>\n\n"
                "<b>Categories:</b> <code>espresso</code>, <code>jebena</code>, <code>juices</code>, <code>baked</code>\n\n"
                "<b>Example:</b>\n"
                "<code>/add Caramel Macchiato | 150 | espresso | Rich double espresso with vanilla syrup and caramel drizzle</code>"
            )
            send_message(chat_id, usage)
            return

        content = raw[1].strip()
        parts = [p.strip() for p in content.split("|")]
        if len(parts) < 3:
            send_message(chat_id, "❌ Please provide at least: <code>Name | Price | Category</code>")
            return

        name = parts[0]
        price_str = re.sub(r'[^0-9.]', '', parts[1])
        cat_slug = parts[2].lower()
        # Check if photo was attached in the message
        img_url = None
        if photos:
            highest_res_photo = photos[-1]
            img_url = download_telegram_photo(highest_res_photo.get("file_id"), save_name_hint=name)

        # Check if an image URL was passed in text parts
        if not img_url:
            for p in parts[3:]:
                if p.startswith(('http://', 'https://', '/Assets/', '/uploads/')):
                    img_url = p
                    break

        desc_parts = [p for p in parts[3:] if p != img_url]
        desc = desc_parts[0] if desc_parts else f"Freshly prepared {name} at Chillax Coffee."

        if not img_url:
            img_url = "/Assets/chillax-inside.webp"

        try:
            price = Decimal(price_str)
        except Exception:
            send_message(chat_id, "❌ Invalid price. Please enter a number like <code>140</code>.")
            return

        # Find or create category
        category = Category.objects.filter(slug=cat_slug).first()
        if not category:
            # Fallback matching by name
            category = Category.objects.filter(name__icontains=cat_slug).first()
        if not category:
            # Default to first available or create
            category = Category.objects.first() or Category.objects.create(slug='espresso', name='Coffee & Espresso', order=1)

        # Generate unique item_id slug
        base_slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        item_id = base_slug
        count = 1
        while MenuItem.objects.filter(item_id=item_id).exists():
            item_id = f"{base_slug}-{count}"
            count += 1

        new_item = MenuItem.objects.create(
            item_id=item_id,
            category=category,
            name=name,
            price_etb=price,
            description=desc,
            image_url=img_url,
            badge="New on Menu",
            is_available=True,
        )

        photo_status = "Custom photo uploaded live 📸" if (photos or (len(parts) > 4 and parts[4].strip())) else "Standard coffee artwork ☕"
        response_text = (
            f"🎉 <b>ITEM ADDED TO WEBSITE MENU!</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"☕ <b>Name:</b> {new_item.name}\n"
            f"💰 <b>Price:</b> {new_item.price_etb:.0f} ETB\n"
            f"📂 <b>Category:</b> {new_item.category.name}\n"
            f"📸 <b>Photo:</b> {photo_status}\n"
            f"📝 <b>Description:</b> {new_item.description}\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"🚀 <i>Deploying live to chillaxcoffee.vercel.app (~45s)... You will receive a confirmation when deployed!</i>"
        )
        send_message(chat_id, response_text)
        trigger_git_sync(f"add item '{new_item.name}'", chat_id=chat_id, uploaded_photo_url=img_url)
        return

    # Command: /delete or /remove
    if text.startswith(("/delete", "/remove")):
        raw = text.split(" ", 1)
        if len(raw) < 2 or not raw[1].strip():
            items = MenuItem.objects.all().order_by('category__order', 'name')
            if not items.exists():
                send_message(chat_id, "No menu items found on the website.")
                return
            buttons = []
            for itm in items:
                buttons.append([{"text": f"🗑 Delete {itm.name} ({float(itm.price_etb):.0f} ETB)", "callback_data": f"delete:{itm.item_id}"}])
            send_message(chat_id, "<b>Select an item to delete from the website:</b>", reply_markup={"inline_keyboard": buttons})
            return

        query = raw[1].strip()
        item = MenuItem.objects.filter(name__iexact=query).first() or \
               MenuItem.objects.filter(item_id__iexact=query).first() or \
               MenuItem.objects.filter(name__icontains=query).first()
        if not item:
            send_message(chat_id, f"❌ Could not find an item matching <b>{query}</b>.\nSend <code>/delete</code> to see clickable buttons for all items.")
            return

        deleted_name = item.name
        item.delete()
        send_message(chat_id, f"🗑 <b>{deleted_name}</b> was removed from the website catalog!\n🚀 <i>Deploying live to chillaxcoffee.vercel.app (~45s)...</i>")
        trigger_git_sync(f"delete item '{deleted_name}'", chat_id=chat_id)
        return

    # Command: /toggle
    if text.startswith("/toggle"):
        raw = text.split(" ", 1)
        if len(raw) < 2 or not raw[1].strip():
            items = MenuItem.objects.all().order_by('category__order', 'name')
            if not items.exists():
                send_message(chat_id, "No menu items found on the website.")
                return
            buttons = []
            for itm in items:
                status_icon = "🟢" if itm.is_available else "⏸"
                buttons.append([{"text": f"{status_icon} {itm.name}", "callback_data": f"toggle:{itm.item_id}"}])
            send_message(chat_id, "<b>Select an item to toggle In-Stock 🟢 / Sold-Out ⏸:</b>", reply_markup={"inline_keyboard": buttons})
            return

        query = raw[1].strip()
        item = MenuItem.objects.filter(name__iexact=query).first() or \
               MenuItem.objects.filter(item_id__iexact=query).first() or \
               MenuItem.objects.filter(name__icontains=query).first()
        if not item:
            send_message(chat_id, f"❌ Could not find an item matching <b>{query}</b>.")
            return

        item.is_available = not item.is_available
        item.save(update_fields=['is_available'])
        state_icon = "In Stock 🟢" if item.is_available else "Sold Out ⏸"
        send_message(chat_id, f"✅ <b>{item.name}</b> is now <b>{state_icon}</b> on the website.\n🚀 <i>Deploying live to chillaxcoffee.vercel.app (~45s)...</i>")
        trigger_git_sync(f"toggle {item.name} availability", chat_id=chat_id)
        return


def process_telegram_update(update):
    """Processes a single Telegram update dict (from webhook or long-polling)"""
    if "callback_query" in update:
        handle_callback_query(update["callback_query"])
    elif "message" in update:
        handle_message(update["message"])


def run_telegram_bot_polling():
    """Runs long-polling loop to listen for updates from Telegram"""
    token = get_bot_token()
    if not token:
        print("❌ TELEGRAM_BOT_TOKEN is not set in settings or environment. Please set it before running.")
        return

    print("🤖 Chillax Coffee Telegram Bot is running in long-polling mode...")
    print(f"👉 Connected to Telegram API with token: {token[:6]}...{token[-4:]}")
    offset = 0

    while True:
        try:
            url = TELEGRAM_API_URL.format(token=token, method="getUpdates")
            params = {"offset": offset, "timeout": 25}
            query = urllib.parse.urlencode(params)
            req = urllib.request.Request(f"{url}?{query}")

            with urllib.request.urlopen(req, timeout=35) as res:
                data = json.loads(res.read().decode('utf-8'))
                if data.get("ok"):
                    for update in data.get("result", []):
                        offset = update["update_id"] + 1
                        process_telegram_update(update)
        except KeyboardInterrupt:
            print("\n🛑 Telegram bot polling stopped.")
            break
        except Exception as e:
            logger.error(f"Polling error: {e}")
            import time
            time.sleep(3)
