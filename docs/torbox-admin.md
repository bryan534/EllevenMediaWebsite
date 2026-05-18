# TorBox Admin Panel

A password-protected admin panel built into the Elleven Media website for manually provisioning and removing TorBox accounts for paying customers.

---

## What Was Built

### New Files

| File | Purpose |
|------|---------|
| `src/lib/torbox.ts` | TorBox Vendors API client (provision, remove, get account, get vendor stats) |
| `src/lib/session.ts` | HMAC-SHA256 cookie-based auth (stateless, no session store needed) |
| `src/routes/admin/+layout.server.ts` | Auth guard — redirects unauthenticated requests to `/admin/login` |
| `src/routes/admin/login/+page.server.ts` | Login form action — verifies password, sets session cookie |
| `src/routes/admin/login/+page.svelte` | Login UI |
| `src/routes/admin/+page.server.ts` | Admin page data loader + `provision` and `remove` form actions |
| `src/routes/admin/+page.svelte` | Admin UI — vendor stats, add user form, users table |
| `migrations/0001_torbox_users.sql` | D1 schema — stores provisioned users locally |

### Modified Files

| File | Change |
|------|--------|
| `wrangler.toml` | Added D1 database binding (`DB`, database `torbox-admin`, ID `9f1b2e27-db51-4dab-9177-c2fbea417893`) |
| `src/app.d.ts` | Added `Platform` interface so TypeScript knows about `platform.env.DB` |
| `.env` | Added `TORBOX_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |

---

## How It Works

### Authentication

- `/admin` and all sub-routes are protected by `+layout.server.ts`
- On every request it reads the `admin_session` cookie and verifies it against an HMAC-SHA256 signature derived from `ADMIN_SESSION_SECRET`
- If the cookie is missing or invalid, the user is redirected to `/admin/login`
- The session token is stateless — no database needed. The token stores an expiry timestamp plus an HMAC signature, and is saved in an `httpOnly` cookie
- Admin responses are sent with `Cache-Control: private, no-store` so private user/token data is not cached at the edge

### Data Storage

A Cloudflare D1 (SQLite) database stores a local record of every provisioned user:

```sql
CREATE TABLE torbox_users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  email     TEXT NOT NULL UNIQUE,
  auth_id   TEXT NOT NULL UNIQUE,  -- TorBox's identifier, used for remove
  api_token TEXT NOT NULL DEFAULT '',
  password  TEXT NOT NULL DEFAULT '',
  note      TEXT NOT NULL DEFAULT '',
  added_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

D1 is used because the TorBox API's `GET /getaccounts` endpoint does not return `api_token` per user — only `GET /getaccount` (single user) does. By storing the token at provision time, the admin panel can display it without hitting TorBox on every page load.

### Provisioning a User

1. You enter a customer's email (and optional note) in the Add User form
2. The server calls `POST /registeruser` on the TorBox Vendors API
3. TorBox creates the account and returns `auth_id` and a one-time `password`
4. The server immediately calls `GET /getaccount` to fetch the `api_token` (available instantly for vendor-created accounts — no email confirmation required)
5. The user row is saved to D1
6. A green credentials banner appears on screen showing the email and password — the password is also saved in the database and can be revealed from the user list

### Removing a User

1. You click Remove on any user row and confirm the dialog
2. The server calls `DELETE /removeuser` on the TorBox Vendors API
3. TorBox resets the user to the free plan and notifies them
4. The user row is deleted from D1
5. The page refreshes with the updated user list

### Vendor Stats Header

The admin page header shows live data from `GET /account` on the TorBox Vendors API:
- Current users vs. users allowed
- Vendor status (active / pending / suspended)
- Paid until date
- Warning badge if `can_register_new` is false

The users table uses the same vendor `paid_until` date for every user, because vendor-provisioned users inherit the vendor account's paid-through date.

The billing panel estimates invoice timing and cost:
- Invoice creation date is `paid_until - 7 days`
- Countdown is calculated client-side from the current time
- Estimated cost uses active users × plan MSRP × discount tier
- Discount is estimated from current active users because the API does not expose cumulative lifetime account count

---

## Environment Variables

Set these in the Cloudflare Pages dashboard under **Settings → Environment variables**, and locally in `.env`:

| Variable | Description |
|----------|-------------|
| `TORBOX_API_KEY` | Your personal TorBox API key (from torbox.app/settings). Used to authenticate all Vendors API calls. |
| `ADMIN_PASSWORD` | The password to log into `/admin/login`. Pick something strong. |
| `ADMIN_SESSION_SECRET` | A long random string used to sign the session cookie. Generate with `openssl rand -hex 32`. Keep this secret — rotating it logs out all active sessions. |

---

## Infrastructure

| Resource | Details |
|----------|---------|
| Cloudflare D1 | Database name: `torbox-admin` · ID: `9f1b2e27-db51-4dab-9177-c2fbea417893` |
| D1 Binding | `DB` — accessed via `platform.env.DB` in server routes |
| TorBox API base | `https://api.torbox.app/v1/api/vendors` |
| Admin URL | `/admin` (password protected) |

---

## Setup (One-Time)

```bash
# 1. Run the migrations locally (for wrangler pages dev)
npx wrangler d1 execute torbox-admin --local --file=migrations/0001_torbox_users.sql
npx wrangler d1 execute torbox-admin --local --file=migrations/0002_password_column.sql

# 2. Run the migrations on production
npx wrangler d1 execute torbox-admin --remote --file=migrations/0001_torbox_users.sql
npx wrangler d1 execute torbox-admin --remote --file=migrations/0002_password_column.sql
```

Set `TORBOX_API_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in the Cloudflare Pages dashboard.

---

## Local Development

Default local development uses a local D1 simulation. Run the migration locally first:

```bash
npx wrangler d1 execute torbox-admin --local --file=migrations/0001_torbox_users.sql
npm run dev
```

If you intentionally want local development to use the production D1 database, run:

```bash
npm run dev:prod-db
```

`dev:prod-db` uses `wrangler.remote.toml`, where the `DB` binding has `remote = true`. Any add/remove action in that mode writes to production.

---

## Key Gotchas

- **Vendor plan inheritance** — Users you provision inherit your vendor account's plan level. If your vendor account is on the free plan (`plan: 0`), provisioned users will also be free regardless of `premium_expires_at`. Contact TorBox support to upgrade your vendor account before going live with paying customers.
- **Password stored in database** — The initial password from `POST /registeruser` is saved to the database and can be revealed from the user list at any time. It's also shown in the credentials banner after provisioning.
- **Remove is non-destructive** — `DELETE /removeuser` does not delete the TorBox account. It only resets the user to the free plan and unlinks them from your vendor. Their download history and data are preserved.
- **Invoice timing** — TorBox invoices you 7 days before your vendor account expires. Remove non-paying users before the invoice is generated — you are billed for everyone on your account at that moment.
