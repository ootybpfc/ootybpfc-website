# Deployment & Domain Setup

## Deploying to Vercel

1. Push to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import `ootybpfc-website`.
3. Framework preset: **Vite** (not Next.js). `vercel.json` already pins the build:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Deploy.

No environment variables are required for the frontend. Configuration that matters lives
in `vercel.json`.

## Critical: the `/api` rewrite

`vercel.json` contains two rewrites, **and the order matters**:

```json
"rewrites": [
  { "source": "/api/:path*", "destination": "https://YOUR-BACKEND/api/:path*" },
  { "source": "/(.*)",       "destination": "/index.html" }
]
```

The `/api` rule must come **first**. If the SPA catch-all matches first, every API call
receives `index.html` with a 200 status and the portal login fails with a confusing
error. This was the cause of the original "Could not send a code" bug.

The frontend deliberately calls the API through the relative `/api` prefix because the
backend's session cookie is `httpOnly` with no `Domain` attribute and its CORS policy
omits `Access-Control-Allow-Credentials` — a cross-origin call could never hold a
session. See README.md for the full explanation.

### Changing the backend host

Update **both** of these together:

| File            | What to change                                    |
| --------------- | ------------------------------------------------- |
| `vercel.json`   | `rewrites[0].destination`                         |
| `vite.config.ts`| `API_TARGET` default (or set `VITE_API_TARGET`)   |

> `*.preview.emergentagent.com` URLs are ephemeral preview hosts and get reclaimed. Once
> that happens all `/api` routes return `404 page not found`. Move the backend to a
> durable host (Render, Railway, Fly.io, or a Vercel Python function) before launch.

## Backend configuration the portal depends on

These are set on the **backend**, not here:

| Setting               | Why it matters                                                              |
| --------------------- | --------------------------------------------------------------------------- |
| SMTP credentials      | Without them `request-otp` returns a `demo_code` in the body instead of emailing it. Use `smtp.office365.com` port `587` with STARTTLS. |
| Cloudinary keys       | Media upload falls back to a paste-a-URL field when unconfigured.           |
| Stripe keys           | Required only for paid enrolments and checkout.                             |
| Portal member records | OTP login only works for emails already on a club record.                   |

## Pointing ootybpfc.com to Vercel

### Add the domain in Vercel

Project Settings → Domains → add `ootybpfc.com` and `www.ootybpfc.com`.

### DNS records

| Purpose     | Type  | Name | Value                  |
| ----------- | ----- | ---- | ---------------------- |
| Root domain | A     | `@`  | `76.76.21.21`          |
| WWW         | CNAME | `www`| `cname.vercel-dns.com` |

Vercel auto-provisions SSL via Let's Encrypt once DNS resolves.

> `ootybpfc.com` currently serves a separate legacy site. Repointing DNS will replace it,
> so confirm that is intended before changing the records.

## Post-deployment checklist

- [ ] Site loads over HTTPS and `www` redirects to the root domain
- [ ] `curl https://YOUR-SITE/api/public/summary` returns **JSON**, not HTML
- [ ] Portal login sends or displays a 6-digit code, and verifying it reaches the portal
- [ ] Signed-in header shows the member name and role; sign-out returns to the homepage
- [ ] Homepage renders fixtures, classes, programs, table, news, gallery and partners
- [ ] Layout is clean at 375px wide and at desktop widths
- [ ] No console errors beyond the expected `401` from `/auth/me` while signed out
