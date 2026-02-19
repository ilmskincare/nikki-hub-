# NeuroVerse — Setup Guide

## What you need (all free)
- Supabase account (supabase.com) — free tier
- Vercel account (vercel.com) — free tier
- Anthropic API key (console.anthropic.com)

---

## Step 1 — Create Supabase project

1. Go to supabase.com → New Project
2. Give it a name (e.g. `nikki-hub`), choose a region (Europe West)
3. Wait for it to spin up (~2 min)
4. Go to **SQL Editor** → paste the contents of `SUPABASE_SETUP.sql` → Run
5. Go to **Settings → API** → copy:
   - Project URL (looks like `https://abcdef.supabase.co`)
   - `anon` public key (long string starting with `eyJ...`)

---

## Step 2 — Fill in .env.local

Edit `.env.local` in this folder:
```
ANTHROPIC_API_KEY=sk-ant-...        ← from console.anthropic.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
APP_PASSWORD=something_only_you_know
```

---

## Step 3 — Install and run locally

Open a terminal in this folder:
```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the password gate.

---

## Step 4 — Seed your memory

1. Open the app, log in
2. Click **memory** (top right)
3. Paste your CLAUDE.md content in there
4. Save — Claude will now know everything about you in every chat

---

## Step 5 — Deploy to Vercel (access from anywhere)

Option A — GitHub (recommended):
1. Push this folder to a GitHub repo (`git init`, `git add .`, `git commit`, `git push`)
2. Go to vercel.com → New Project → Import from GitHub
3. Add all 4 env vars (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, APP_PASSWORD)
4. Deploy → get your URL (e.g. `nikki-hub.vercel.app`)

Option B — Vercel CLI:
```bash
npm install -g vercel
vercel
```
Add env vars when prompted.

---

## Cost estimate

| Service | Free tier | Your usage |
|---------|-----------|-----------|
| Vercel | 100GB bandwidth/month | ~0% |
| Supabase | 500MB DB, 50MB files | ~0% |
| Claude Haiku | $0.80 per million tokens | ~£0.50/month casual use |

**Total: ~£0.50/month**

---

## Features

- **Chat** — streaming Claude conversation, your CLAUDE.md injected as context, history saved
- **Tasks** — add, tick, delete; synced across all devices
- **Journal** — prompted journaling (15 rotating prompts), entries saved as notes
- **Notes** — free-form markdown notes
- **Memory** — edit what Claude knows about you from the browser

---

## Upgrading Claude model

Chat uses `claude-haiku-4-5-20251001` by default (cheapest, fast).
For harder questions, edit `src/app/api/chat/route.ts` and change the model to:
- `claude-sonnet-4-6` — smarter, ~15× more expensive but still cheap
- `claude-opus-4-6` — most capable, ~75× more expensive
