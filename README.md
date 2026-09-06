# Ooty Black Pearl FC — Club Website & Portal

The public club site and member portal for Ooty Black Pearl FC (Toronto & Chicago).
Guardians manage player profiles and class RSVPs, coaches mark attendance and review
media, and admins handle registrations, payouts and club content.

## Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Build      | Vite 6                                                        |
| UI         | React 18 + TypeScript                                         |
| Styling    | Tailwind CSS v4 (`@theme` tokens in `src/index.css`)          |
| Data       | TanStack Query v5                                             |
| Routing    | react-router-dom 7                                            |
| Charts     | Recharts                                                      |
| Icons      | lucide-react                                                  |
| Toasts     | sonner                                                        |
| Backend    | External FastAPI service (not in this repo)                   |
| Hosting    | Vercel                                                        |

This is a **frontend-only** repository. The API is a separate FastAPI service.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production bundle into dist/
npx tsc --noEmit  # type check (the build itself does not type check)
```

## How the frontend reaches the API — read this first

`src/lib/api.ts` calls the API through the **relative** `/api` prefix, never an absolute
URL. This is deliberate and load-bearing:

- The backend issues an `httpOnly`, `SameSite=Lax` session cookie with **no `Domain`
  attribute**.
- Its CORS policy is `Access-Control-Allow-Origin: *` **without**
  `Access-Control-Allow-Credentials`.

Together those mean a direct cross-origin `fetch(..., { credentials: 'include' })` from
the browser can never hold a session. So the API must be reached same-origin:

| Environment | Mechanism                                       |
| ----------- | ----------------------------------------------- |
| Local dev   | Vite proxy in `vite.config.ts`                  |
| Production  | `rewrites` entry in `vercel.json`               |

**If `/api` is not routed to the backend, every API call silently receives `index.html`
with a 200, and the SPA reports confusing failures** — this is exactly what caused the
original "Could not send a code" bug on the portal login. `src/lib/api.ts` now detects a
non-JSON response and raises an explicit routing error instead.

### Pointing at a different backend

The backend host appears in **two** places that must never drift apart:

1. `vercel.json` → `rewrites[0].destination` (production)
2. `vite.config.ts` → `API_TARGET` default (dev)

Use the helper rather than editing them by hand — updating only one makes the site work
in dev and fail in production, which presents as a login bug rather than a routing
mistake:

```bash
node scripts/set-backend.mjs https://api.example.com   # update both
node scripts/set-backend.mjs --show                    # print current, warn if they differ
```

For a one-off local override without editing files:

```bash
VITE_API_TARGET=http://localhost:8000 npm run dev
```

> **Note on Emergent preview URLs:** `*.preview.emergentagent.com` hosts are ephemeral
> and get reclaimed. When that happens every `/api` route returns `404 page not found`
> and the site shows its "Live club data is unavailable" notice. Move the backend to a
> durable host before launch.

## Authentication

Passwordless email OTP:

1. `POST /api/auth/request-otp` with `{ email }` — the email must already exist on a club
   record, otherwise the API returns `404 No portal account exists for that email`.
2. `POST /api/auth/verify-otp` with `{ email, code }` — sets the session cookie.
3. `GET /api/auth/me` — returns the signed-in member; `401` when signed out.
4. `POST /api/auth/logout` — clears the session.

**Demo mode:** when the backend has no SMTP sender configured, `request-otp` returns a
`demo_code` in the response body instead of sending an email. The login screen surfaces
that code in a labelled panel and pre-fills it. Configure SMTP on the backend
(`smtp.office365.com:587` for this club) to switch to real delivery — no frontend change
is needed; the panel disappears once `demo_code` stops being returned.

## Project layout

```
src/
  components/       AppShell (header/nav/footer), admin panels, ui/ primitives
  pages/            Home, Login, Portal, Events, Programs, Roster,
                    Payments, Attendance, Admin, Standings, CoachSignup…
  lib/
    api.ts          typed fetch layer over /api
    types.ts        response models mirroring the backend
    session.ts      session bootstrap + role labels
    utils.ts        cn() helper
  index.css         Tailwind v4 @theme design tokens
public/
  crest.png         club crest (transparent)
  favicon.ico       multi-size crest favicon
  apple-touch-icon.png
```

## Brand

Derived from the club crest — navy base, gold as the primary highlight, crest red for
calls to action. All tokens live in the `@theme` block of `src/index.css`; use the token
names (`bg-navy-card`, `text-gold`, `bg-crimson`, `border-border`) rather than raw hex.

| Role            | Token                        | Hex       |
| --------------- | ---------------------------- | --------- |
| Base            | `navy-deep`                  | `#070D1C` |
| Surface         | `navy-card`                  | `#101B31` |
| Primary accent  | `gold`                       | `#FFC72C` |
| Call to action  | `crimson`                    | `#D22630` |
| Secondary       | `royal`                      | `#1F4EA1` |
| Positive        | `pitch`                      | `#2FBF71` |

Typography: **Archivo** for headings, **Inter** for body, **JetBrains Mono** for figures
and tabular numbers.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).
