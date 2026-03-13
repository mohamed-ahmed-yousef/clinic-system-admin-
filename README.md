# Clinic System — Admin Panel

A Next.js admin panel for managing Clinic System users.

## Admin Credentials

| Field    | Value               |
|----------|---------------------|
| URL      | `/admin-123`        |
| Username | `admin`             |
| Password | `Cl1n1c@Adm!n#2026` |

> **Keep this file private.** Do not commit it to a public repository.

## Getting Started

### 1. Configure environment variables

Copy and fill in `.env.local`:

```bash
BACKEND_URL=http://localhost:8000
BACKEND_ADMIN_USERNAME=admin
BACKEND_ADMIN_PASSWORD=<backend admin password>
```

`BACKEND_ADMIN_USERNAME` / `BACKEND_ADMIN_PASSWORD` must match a valid **admin** user in the backend database. These credentials are used server-side to proxy user-management requests to the backend API — they are never exposed to the browser.

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.

## Features

- **Login** at `/admin-123` — hardcoded local authentication, no backend call
- **Users page** at `/dashboard/users`
  - View all users in a table
  - Create users with role: Doctor, Reception, Admin, Terminal
  - Delete users (admin users are protected by the backend)
- **Route protection** via Next.js middleware (unauthenticated access redirects to login)
- **Session** stored in an `httpOnly` cookie (8-hour expiry)

## Architecture

```
app/
├── admin-123/page.tsx         # Login page
├── dashboard/
│   ├── layout.tsx             # Sidebar + logout
│   ├── page.tsx               # Redirects to /dashboard/users
│   └── users/page.tsx         # User management
├── api/
│   ├── auth/login/route.ts    # Sets session cookie
│   ├── auth/logout/route.ts   # Clears session cookie
│   ├── users/route.ts         # GET list / POST create (proxy → backend)
│   └── users/[id]/route.ts    # DELETE (proxy → backend)
lib/
└── backend.ts                 # Backend API client with JWT caching
middleware.ts                  # Protects /dashboard/* routes
```
