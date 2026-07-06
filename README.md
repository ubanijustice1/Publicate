# Publicate

Social media management and creator growth platform for Nigerian creators, small business owners and social media managers.

## Tech stack

- **Frontend:** React + Vite (JavaScript)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **AI:** OpenAI API (via Netlify Functions, so the key is never exposed to the browser)
- **Payments:** Paystack (via Netlify Functions)
- **Deployment:** Netlify

## Features

1. Authentication (signup / login / logout) — Supabase Auth
2. Dashboard — content calendar preview, AI credits, recent posts, quick actions
3. Content Calendar — weekly & monthly views across Instagram, Facebook, TikTok, YouTube, X, WhatsApp Status
4. AI Caption Generator — caption, hashtags, hook, CTA
5. Post Score — 0-100 score before publishing
6. Trend Radar — trending topics in Nigeria by niche
7. Media Kit Generator — downloadable PDF
8. Monetization Navigator — X / Facebook / YouTube payout checklists
9. Subscription Plans — 5 NGN plans via Paystack (Free, Creator Starter ₦2,000, Creator Pro ₦5,000, Business ₦10,000, Agency ₦25,000)

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. In **SQL Editor**, run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates all tables (profiles, posts, ai_generations, media_kits, monetization_progress, subscriptions) with row-level security so users only ever see their own data.
3. Copy your **Project URL**, **anon public key** and **service_role key** from Project Settings → API.

### 3. Environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PAYSTACK_PUBLIC_KEY=...
OPENAI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PAYSTACK_SECRET_KEY=...
```

The `VITE_*` vars are safe to expose in the browser. `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` are server-only secrets used exclusively inside `netlify/functions/*` — never import them into `src/`.

### 4. Run locally

The app calls `/.netlify/functions/*` for anything that needs a secret key (OpenAI, Paystack). To run those locally you need the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npm install -g netlify-cli
netlify dev
```

This serves the Vite app and the functions together on one port. Running `npm run dev` alone will start the frontend but AI/payment features will fail since the functions won't be reachable.

## Deployment (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
4. Add all the env vars from `.env` under **Site settings → Environment variables**.
5. In Supabase → Authentication → URL Configuration, set the Site URL and Redirect URLs to your Netlify domain.
6. In Paystack → Settings → API Keys & Webhooks, add a webhook pointing to `https://<your-site>/.netlify/functions/paystack-webhook` (used as a reliability backstop alongside the client-side verify flow).
7. Switch Paystack keys from test to live when you're ready to accept real payments.

## Project structure

```
netlify/functions/   Serverless functions (OpenAI + Paystack calls, using service-role Supabase access)
src/components/      Layout, calendar and dashboard UI components
src/context/         Auth context (Supabase session + profile)
src/lib/             Supabase client, platform/plan config, API helpers, PDF generator
src/pages/           One file per route/feature
supabase/schema.sql  Full DB schema with RLS policies
```
