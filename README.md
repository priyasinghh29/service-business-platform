# Full-Stack Monorepo Boilerplate

A production-style starter template with **Laravel 11** (REST API + Blade admin panel) and **Next.js 16** (React 19 frontend), orchestrated with Docker Compose and nginx.

Use this as a foundation for SaaS apps, dashboards, or any project that needs user auth, an admin panel, and a modern frontend without building everything from scratch.

---

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 11, Sanctum, Breeze |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Database | MySQL 8 |
| Cache / Queue | Redis 7 |
| Reverse proxy | nginx |
| Payments (scaffold) | Stripe, PayPal, Razorpay |

---

## Features

### Backend (`LaraBackend/`)

- **REST API** with Laravel Sanctum bearer-token authentication
- **User registration & login** — `/api/register`, `/api/login`, `/api/logout`
- **Profile management** — `/api/user`, `/api/profile`
- **Password reset** — forgot/reset password API endpoints
- **In-app notifications** — list, mark read, mark all read
- **Web auth (Breeze)** — session-based login/register for Blade pages
- **Admin panel** — separate `admin` guard, dashboard with user stats
- **Payment gateway scaffolding** — Stripe service + PayPal/Razorpay microservice client
- **Database migrations** — users, admins, tokens, notifications, sessions, jobs, cache

### Frontend (`NextUI/`)

- **Pages** — landing, login, register, forgot password, dashboard
- **Auth context** — token + user persisted in `localStorage`
- **Axios API client** — auto Bearer token injection, 401 session expiry handling
- **Dark / light mode** — theme toggle with system preference fallback
- **Responsive navbar** — mobile menu, user avatar, logout
- **API proxy** — Next.js rewrites `/api/*` to Laravel in local dev

### DevOps

- **Docker Compose** — nginx, Next.js, Laravel, MySQL, Redis
- **Production compose file** — HTTPS, split domains, Let's Encrypt paths
- **nginx configs** — single-host dev and multi-domain production

---

## Project Structure

```
boilerplate/
├── LaraBackend/          # Laravel 11 API + Blade admin
│   ├── app/
│   │   ├── Http/Controllers/Api/     # REST API controllers
│   │   ├── Http/Controllers/Admin/   # Admin panel controllers
│   │   ├── Models/                     # User, Admin, Notification
│   │   └── Services/PaymentGateways/   # Stripe, payment client
│   ├── routes/api.php                  # API routes
│   ├── routes/admin-auth.php           # Admin routes
│   └── database/migrations/
├── NextUI/               # Next.js 16 frontend
│   ├── app/                            # Pages (App Router)
│   ├── components/                     # UI components
│   ├── context/                        # Auth + Theme providers
│   └── lib/                            # API client utilities
├── docker/nginx/         # nginx configs (dev, local, prod)
├── docker-compose.yml
├── docker-compose.local.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 20+
- MySQL 8 (or use Docker)

### 1. Clone and configure

```bash
git clone <your-repo-url> my-app
cd my-app

cp .env.example .env
cp LaraBackend/.env.example LaraBackend/.env
cp NextUI/.env.example NextUI/.env.local
```

Generate the Laravel application key:

```bash
cd LaraBackend
php artisan key:generate
cd ..
```

### 2. Database setup

Create a MySQL database (example):

```sql
CREATE DATABASE app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `LaraBackend/.env` with your credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=app_db
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations:

```bash
cd LaraBackend
php artisan migrate
```

### 3. Install dependencies

**Backend:**

```bash
cd LaraBackend
composer install
npm install
```

> **Note:** If Composer blocks Laravel 11 due to security advisories, run:
> `composer install --no-security-blocking`

**Frontend:**

```bash
cd NextUI
npm install
```

### 4. Run locally (without Docker)

Open two terminals:

**Terminal 1 — Laravel API:**

```bash
cd LaraBackend
php artisan serve          # http://127.0.0.1:8000
npm run dev                # Vite assets (optional, for Blade pages)
```

**Terminal 2 — Next.js frontend:**

```bash
cd NextUI
npm run dev                # http://localhost:3000
```

### 5. Run with Docker

```bash
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API | http://localhost/api |
| Admin panel | http://localhost/admin/login |
| Health check | http://localhost/api/health |

---

## Authentication

This boilerplate ships with **three parallel auth systems**:

| System | Used by | Method | Routes |
|--------|---------|--------|--------|
| **API** | Next.js frontend | Sanctum Bearer token | `/api/login`, `/api/register` |
| **Web** | Blade pages | Breeze session (cookies) | `/login`, `/register` |
| **Admin** | Admin panel | Separate session guard | `/admin/login` |

### API auth flow (Next.js)

1. User submits login/register form
2. Frontend calls `POST /api/login` or `POST /api/register`
3. Laravel returns `{ user, token }`
4. Token stored in `localStorage`, sent as `Authorization: Bearer <token>`
5. Protected routes use `auth:sanctum` middleware

---

## Environment Variables

### Root `.env`

Shared Docker / deployment variables. See `.env.example`.

### `LaraBackend/.env`

| Variable | Purpose |
|----------|---------|
| `APP_KEY` | Laravel encryption key (required) |
| `DB_*` | MySQL connection |
| `FRONTEND_URL` | CORS origin for frontend |
| `SANCTUM_STATEFUL_DOMAINS` | SPA cookie auth domains |
| `STRIPE_*`, `PAYPAL_*`, `RAZORPAY_*` | Payment gateway keys (optional) |

### `NextUI/.env.local`

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL (`/api` for proxy, or full URL) |
| `NEXT_PUBLIC_SITE_URL` | Frontend origin |
| `LARAVEL_INTERNAL_URL` | Laravel URL for SSR/proxy (`http://127.0.0.1:8000`) |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | Public | Create account |
| POST | `/api/login` | Public | Get token |
| POST | `/api/logout` | Sanctum | Revoke token |
| GET | `/api/user` | Sanctum | Current user |
| PUT | `/api/profile` | Sanctum | Update profile |
| POST | `/api/forgot-password` | Public | Send reset link |
| POST | `/api/reset-password` | Public | Reset password |
| GET | `/api/notifications` | Sanctum | List notifications |
| POST | `/api/notifications/{id}/read` | Sanctum | Mark one read |
| POST | `/api/notifications/read-all` | Sanctum | Mark all read |
| GET | `/api/health` | Public | Health check |

---

## Payment Gateways (optional)

Scaffolding is included under `LaraBackend/app/Services/PaymentGateways/`:

- **Stripe** — local checkout service (`StripeService.php`)
- **PayPal / Razorpay** — HTTP client for an external payment microservice

Add keys to `LaraBackend/.env`:

```env
STRIPE_PK=
STRIPE_SK=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
RAZORPAY_KEY=
RAZORPAY_SECRET=
PAYMENT_GATEWAY_ENABLED=false
PAYMENT_GATEWAY_URL=
```

Payment routes and frontend UI are not wired yet — add them as needed.

---

## Troubleshooting

### `composer install` fails with security advisories

```bash
composer install --no-security-blocking
```

### Registration returns 500 / database error

- Ensure MySQL is running
- Create the `app_db` database
- Check `DB_*` credentials in `LaraBackend/.env`
- Run `php artisan migrate`

### Next.js: `getApiBaseUrl` defined multiple times

Ensure `NextUI/lib/api-base.ts` does **not** import from itself. It should only export functions, not self-import.

### Next.js: port 3000 already in use

```bash
lsof -i :3000
kill <PID>
rm -f NextUI/.next/dev/lock
npm run dev
```

### Next.js lock file conflict

Only one `next dev` instance should run at a time. Kill the old process before starting a new one.

---

## What's included vs scaffold-only

| Ready to use | Scaffold (extend as needed) |
|--------------|----------------------------|
| User register / login | Payment checkout UI |
| Sanctum API auth | PayPal / Razorpay routes |
| Admin panel login + dashboard | Notifications frontend UI |
| Dark mode, navbar, dashboard | Database seeders |
| Docker dev stack | OTP email flow |
| Password reset API | Production SSL setup |

---

## License

MIT
# service-business-platform
