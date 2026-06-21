# Byte Brainiacs: ML Showdown

A production-grade hackathon website for **Byte Brainiacs: ML Showdown**, organized by the **Department of Information Technology, SVKM's Narsee Monjee College of Commerce & Economics**.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, and Supabase. Includes a public marketing site, a validated registration flow backed by Supabase, and a password-protected admin dashboard with CSV/XLSX export.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Quick start](#quick-start)
4. [Environment variables](#environment-variables)
5. [Supabase setup](#supabase-setup)
6. [Admin dashboard](#admin-dashboard)
7. [Project structure](#project-structure)
8. [Editing content](#editing-content)
9. [Deployment guide](#deployment-guide)
10. [Performance & SEO](#performance--seo)
11. [Troubleshooting](#troubleshooting)

---

## Features

- **Handcrafted dark UI** — animated neural-network canvas, cursor spotlight, mouse-following light, animated grid, scroll-progress bar, count-up stats, scroll-driven timeline, glass-morphism, and tasteful micro-interactions.
- **Fully responsive** — mobile, tablet, laptop, desktop, and ultra-wide, with a custom mobile menu and no horizontal scroll.
- **Registration system** — typed validation (Zod), inline error/loading/success states, duplicate prevention, and a mandatory (default-unticked) rules agreement.
- **Supabase integration** — server-side inserts via a service-role client, Row-Level-Security enabled, unique constraints on email + team name.
- **Admin portal** at `/admin` — env-based login, dashboard stats, searchable / filterable / sortable / paginated table, and one-click CSV + XLSX export that scales to thousands of rows.
- **SEO & accessibility** — full metadata, Open Graph + Twitter cards, JSON-LD `Event` structured data, `sitemap.xml`, `robots.txt`, semantic HTML, keyboard-navigable controls, and `prefers-reduced-motion` support.

---

## Tech stack

| Layer       | Choice                                  |
| ----------- | --------------------------------------- |
| Framework   | Next.js 15 (App Router, Server Actions) |
| Language    | TypeScript                              |
| Styling     | Tailwind CSS                            |
| Animation   | Framer Motion + custom canvas           |
| Database    | Supabase (PostgreSQL)                   |
| Icons       | lucide-react                            |
| Validation  | Zod                                     |
| Export      | SheetJS (xlsx) + native CSV             |

---

## Quick start

> Requires **Node.js 18.18+** (Node 20 LTS recommended).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#    then edit .env.local with your real values (see below)

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable                        | Where           | Description                                            |
| ------------------------------- | --------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public          | Your Supabase project URL.                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public          | Supabase anon/public key.                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Server only** | Service-role key. Used for inserts + admin reads.      |
| `ADMIN_USERNAME`                | Server only     | Admin login username.                                  |
| `ADMIN_PASSWORD`                | Server only     | Admin login password (use a strong one).               |
| `ADMIN_SESSION_SECRET`          | Server only     | 32+ char random string that signs the session cookie. |
| `NEXT_PUBLIC_SITE_URL`          | Public          | Canonical site URL for SEO/OG absolute links.          |

Generate a session secret:

```bash
openssl rand -base64 32
```

> The service-role key and admin credentials must **never** be exposed to the browser. Only `NEXT_PUBLIC_*` variables are sent to the client.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `registrations` table, unique indexes on `lower(email)` and `lower(team_name)`, and enables Row Level Security.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
4. Paste them into `.env.local`.

**How data flows**

- Registration submissions go through a **server action** (`src/app/actions/register.ts`) that uses the service-role client, so RLS does not block inserts and the key never reaches the browser.
- The table has RLS **on with no public policies**, meaning the anon key cannot read entrants' data — contact details stay private.
- Duplicate emails/team names are blocked both in the server action and by database unique constraints (defense in depth).

The `registrations` table columns: `id`, `created_at`, `team_name`, `participant_1`, `participant_2`, `participant_3`, `mobile_number`, `email`, `college`, `course`, `agreed_terms`.

---

## Admin dashboard

- Visit `/admin`. If not logged in you'll be redirected to `/admin/login`.
- Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. A signed, HTTP-only session cookie (valid 8 hours) is set.
- The dashboard shows total registrations, total teams, unique colleges, and last-7-days counts, plus a table with search, college filter, column sorting, and pagination.
- Use the **CSV** or **XLSX** buttons to export the currently filtered/sorted set in one click.
- Route protection is enforced by `src/middleware.ts` for both `/admin/*` pages and `/api/admin/*` routes.

---

## Project structure

```
byte-brainiacs/
├─ public/
│  └─ logo.jpeg
├─ supabase/
│  └─ schema.sql                 # run in Supabase SQL editor
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # fonts, metadata, JSON-LD
│  │  ├─ page.tsx                # landing page
│  │  ├─ globals.css
│  │  ├─ sitemap.ts / robots.ts
│  │  ├─ not-found.tsx
│  │  ├─ register/page.tsx       # registration page
│  │  ├─ admin/
│  │  │  ├─ page.tsx             # dashboard (server)
│  │  │  └─ login/page.tsx       # login (client)
│  │  ├─ actions/register.ts     # server action (insert + dedupe)
│  │  └─ api/admin/
│  │     ├─ login/route.ts
│  │     └─ logout/route.ts
│  ├─ components/
│  │  ├─ Navbar, Footer, Hero, NeuralBackground, MouseGlow,
│  │  │  ScrollProgress, CountUp, Reveal, SpotlightCard, SectionHeading
│  │  ├─ RegistrationForm.tsx
│  │  ├─ sections/               # About, Timeline, Tracks, Prizes,
│  │  │                          #   Organizers, FAQ, Contact
│  │  └─ admin/AdminDashboard.tsx
│  ├─ content/site.ts            # ALL editable copy
│  ├─ lib/
│  │  ├─ auth.ts                 # Edge-safe signed sessions
│  │  ├─ validation.ts           # Zod schema + types
│  │  ├─ export.ts               # CSV + XLSX
│  │  ├─ utils.ts
│  │  └─ supabase/{server,client}.ts
│  └─ middleware.ts              # admin route protection
├─ tailwind.config.ts
├─ next.config.mjs
└─ .env.example
```

---

## Editing content

Almost all copy — dates, prize amounts, FAQ, contact details, stats, tracks, timeline — lives in **`src/content/site.ts`**. Edit that one file; no component changes needed.

> The current dates, prize figures, contact email, and phone number are **placeholders**. Replace them in `src/content/site.ts` before going live. Look for the inline comments marking placeholder values.

---

## Deployment guide

### Vercel (recommended)

1. Push this project to a Git repository (GitHub/GitLab/Bitbucket).
2. In [vercel.com](https://vercel.com) → **New Project** → import the repo. Vercel auto-detects Next.js.
3. Under **Settings → Environment Variables**, add every variable from `.env.example` with your real values (set them for Production, Preview, and Development as needed).
4. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your final domain and redeploy so SEO/OG links are absolute.

### Other hosts (Netlify, Render, a VPS, etc.)

```bash
npm install
npm run build
npm run start   # serves on PORT (default 3000)
```

Ensure all environment variables are set in the host's dashboard. The admin middleware uses the Web Crypto API and runs on the Edge runtime, so it works on any standards-compliant host.

### After deploying

- Run `supabase/schema.sql` against your production Supabase project (if separate from dev).
- Verify `/` , `/register`, and `/admin` load and that a test registration appears in Supabase and in the admin table.

---

## Performance & SEO

- Fonts via `next/font` (self-hosted, no layout shift). Images via `next/image`.
- The neural-network canvas pauses when the tab is hidden, caps device pixel ratio, and renders a single static frame for reduced-motion users.
- SheetJS is dynamically imported so it stays out of the main bundle until an export is triggered.
- Metadata, Open Graph, Twitter cards, JSON-LD `Event` data, `sitemap.xml`, and `robots.txt` are all included. `/admin` is excluded from indexing.

To audit: `npm run build && npm run start`, then run Lighthouse against the production server (dev mode scores are not representative).

---

## Troubleshooting

- **"Registration is temporarily unavailable"** — Supabase env vars are missing/incorrect, or the SQL schema hasn't been run.
- **Admin login always fails** — check `ADMIN_USERNAME` / `ADMIN_PASSWORD`; ensure `ADMIN_SESSION_SECRET` is set and at least 16 characters.
- **Duplicate errors on valid entries** — a team with that email or (case-insensitive) team name already exists; this is expected.
- **A partial `node_modules` exists from a prior tool run** — delete the `node_modules` folder, then run `npm install` fresh.

---

Built for the Department of Information Technology, SVKM's Narsee Monjee College of Commerce & Economics.
