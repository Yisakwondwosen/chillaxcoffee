# Chillax Coffee • Full-Stack Web Architecture
**Mekanisa, Addis Ababa, Ethiopia**  
*Specialty Coffee House & Neighborhood Lounge*

---

## 🏗️ Architecture Overview

This project is built as a production-ready, full-stack application optimized for performance, conversion, and seamless deployment on **Vercel**:

- **Frontend**: **Next.js 14+** (App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons)
  - Split-screen sensory hero with **animated SVG rising steam**
  - **Live Addis Ababa Time (UTC+3)** open/closed checking
  - **Asymmetrical Bento Grid** showcasing Mekanisa daily rhythms
  - **Interactive Category Filter** with spotlight cards & tasting notes
  - **Pre-Order Tray & Basket** with real-time ETB price calculations
  - **One-click Telegram & WhatsApp dispatch** to the Mekanisa barista desk
  - **Mobile Sticky Conversion Bar** (`max-width: 768px`)
- **Backend**: **Django 5.0 + Django REST Framework**
  - PostgreSQL / SQLite database with `dj-database-url`
  - CORS headers enabled for Next.js cross-origin requests
  - Auto-seeding of initial Mekanisa coffee items & cooperatives
  - Django Admin panel for menu, pricing, and pre-order tracking
- **Deployment**: **Vercel**
  - Configured with `vercel.json` supporting Next.js frontend + Serverless Python WSGI Django backend in a unified repository, or decoupled via `NEXT_PUBLIC_DJANGO_API_URL`.

---

## 🚀 Local Development Setup

### 1. Django Backend Setup

```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# (Optional) Create superuser for Django Admin
python manage.py createsuperuser

# Start Django development server
python manage.py runserver 8000
```

The Django REST API will be running at `http://127.0.0.1:8000/api/`:
- `GET /api/categories/` — Menu categories
- `GET /api/menu/` — Full menu with ETB prices & tasting notes
- `GET /api/status/` — Real-time Mekanisa lounge status in Addis Ababa time (UTC+3)
- `POST /api/orders/` — Pre-order creation & Telegram/WhatsApp dispatch generator
- `http://127.0.0.1:8000/admin/` — Django Administration dashboard

---

### 2. Next.js Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install dependencies (using bun or npm)
bun install # or npm install

# Start Next.js development server
bun dev # or npm run dev
```

Open `http://localhost:3000` to preview the site with live data.

---

## ☁️ Deploying to Vercel

### Option 1: Unified Monorepo (Next.js + Django Serverless on Vercel)

The repository includes a ready-to-use [`vercel.json`](file:///Users/mabook/heygen/chillax_website/vercel.json) and [`api/index.py`](file:///Users/mabook/heygen/chillax_website/api/index.py) serverless entry point.

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** → Import your repository.
   - Leave Framework Preset as **Next.js** (or Other).
   - Set the following **Environment Variables**:
     | Variable | Recommended Value | Note |
     |---|---|---|
     | `DJANGO_SETTINGS_MODULE` | `chillax_backend.settings` | Points to Django settings |
     | `DJANGO_SECRET_KEY` | *(Generate a secure random string)* | Production secret key |
     | `ALLOWED_HOSTS` | `*` | Or your custom domain |
     | `DATABASE_URL` | *(Postgres connection string)* | E.g. from Neon, Supabase, or Vercel Postgres |
3. Click **Deploy**. Vercel will build the Next.js frontend and route `/api/(.*)` to the Django WSGI function.

---

### Option 2: Decoupled Deployment (Next.js on Vercel + Django on Railway/Render)

If you prefer running Django as a long-running service on Railway, Render, or AWS:

1. Deploy the `backend/` folder to Railway/Render:
   - Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --no-input`
   - Start command: `gunicorn chillax_backend.wsgi:application --bind 0.0.0.0:$PORT`
2. Deploy the `frontend/` folder to Vercel:
   - Set Root Directory to `frontend`.
   - Set Environment Variable:
     ```env
     NEXT_PUBLIC_DJANGO_API_URL=https://your-django-backend.up.railway.app
     ```
3. Click **Deploy**.

---

## ☕ Coffee Menu & Data Management

You can manage all menu items, prices in Ethiopian Birr (ETB), availability, and roast notes either directly through the Django Admin at `/admin/` or via database fixtures. Pre-orders placed through Telegram or WhatsApp are logged and assigned unique tracking identifiers (e.g. `CHX-A1B2C3`).
