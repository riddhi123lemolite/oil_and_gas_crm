# OilGas CRM — Supabase Setup Guide

Your CRM used to keep everything in one browser (localStorage) with a pretend
login. It now uses **Supabase** — a free, hosted database + login system — so your
whole team can sign in securely and share the **same live data**. When one person
adds a lead, everyone else sees it update in real time. Nothing for you to run on a
server.

You do **not** need to be a developer. Follow the steps in order. Anything in
`this font` is something you type or copy. Total time: about **20–30 minutes**.

---

## The steps at a glance

1. Create a free Supabase account and project
2. Copy your 2 project keys into a settings file
3. Create the database (paste one SQL file, click Run)
4. Turn off email confirmation (makes signup instant)
5. Run the app and create your account (you become the admin)
6. Invite your team
7. (Optional) Put it online with Vercel

> **Sample data:** The first time someone signs in, the app automatically fills the
> database with realistic demo leads, customers, invoices, etc. — so it's never
> empty. You can wipe it anytime from **Settings → System → Reset Demo Data**.

---

## Step 1 — Create your Supabase account and project

1. Go to **https://supabase.com** and click **Start your project** (sign in with
   GitHub or email).
2. Click **New project**.
3. Fill in:
   - **Name:** `oilgas-crm` (anything you like)
   - **Database Password:** click **Generate a password**, then **copy and save it**
     somewhere safe.
   - **Region:** pick the one closest to you/your team.
4. Click **Create new project** and wait ~2 minutes while it sets up. ☕

---

## Step 2 — Copy your 2 keys into a settings file

1. In your Supabase project, click the **gear icon (Project Settings)** →
   **API**.
2. Note these two values:
   - **Project URL** — like `https://abcdefgh.supabase.co`
   - **Project API keys → `anon` `public`** — a long string starting with `eyJ...`
3. On your computer, open the project's main folder (the one that contains
   `index.html` and the `src` folder).
4. Make a copy of the file **`.env.example`** and rename the copy to **`.env`**
   (just `.env`, starting with a dot).
5. Open `.env` in Notepad and paste **your** values:

   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-long-key...
   ```

6. Save the file.

> 🔒 The `anon public` key is **safe** in the browser — your data is protected by
> security rules in the database, not by hiding this key. Never paste the
> **`service_role`** key anywhere in the app.

---

## Step 3 — Create the database

1. In Supabase, click the **SQL Editor** icon (`</>`) in the left sidebar.
2. Click **+ New query**.
3. On your computer, open **`database/supabase-schema.sql`** in Notepad, select all
   (Ctrl+A), copy (Ctrl+C).
4. Paste it into the Supabase editor and click **Run** (or Ctrl+Enter).
5. You should see **“Success. No rows returned.”** ✅

This created a table for every kind of record (leads, customers, items, proposals,
orders, invoices, payments, dispatch, vehicles, drivers, tasks, messages, and more),
the security rules, and turned on live updates.

---

## Step 4 — Turn off email confirmation (recommended)

1. Supabase → **Authentication** → **Sign In / Providers** → **Email**.
2. Switch **Confirm email** **OFF**. Click **Save**.

Now new sign-ups are logged in immediately. (If you keep it on, new users just get an
email to click first — the app will tell them to check their inbox.)

---

## Step 5 — Run the app and create your account

You'll need **Node.js 20+** (from **https://nodejs.org**, the “LTS” download) if you
don't already have it.

1. Open a terminal (Windows: Start → type `PowerShell` → open it).
2. Go into the project folder (adjust the path if yours differs):

   ```
   cd "C:\Users\DELL\Downloads\oil_and_gas_crm"
   ```

3. Install the app's building blocks (one time):

   ```
   npm install
   ```

4. Start the app:

   ```
   npm run dev
   ```

5. Open the address it prints (usually **http://localhost:5173**).
6. On the login screen, click **Create an account**, enter your name, email, and a
   password (6+ characters), and submit.

**The first person to sign up automatically becomes the Admin.** The app then loads
the sample data (this first load can take a few seconds).

> Keep the terminal open while using the app. Stop it with **Ctrl+C**; restart later
> with `npm run dev`.

---

## Step 6 — Invite your team

Your teammates open the app and click **Create an account** — same as you did. They
immediately share the same live data. When someone changes something, it appears for
everyone within a second or two.

**Change someone's role** (controls which menus they see):
Supabase → **Table Editor** → **users** table → find their row → click the `data`
cell → change `"role"` to one of `ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`,
`ACCOUNTS`. Save.

**Remove access:** Supabase → **Authentication → Users** → click the person →
**Delete user**.

> Note: The four demo staff shown in sample data (e.g. `admin@oilgas.in`) are just
> example records for realism — they are **not** login accounts. Everyone logs in
> with the account they create in Step 5/6.

---

## Step 7 (Optional) — Put it online with Vercel

Running `npm run dev` only works on your computer. To give your team a web address,
deploy the app to **Vercel** (free):

1. Push this project to your GitHub repo (it already lives there). The migration is
   on a branch called **`supabase-migration`** — merge it into `main` when you're
   happy with it.
2. Go to **https://vercel.com**, sign in with GitHub, **Add New… → Project**, and
   import your repo.
3. Vercel auto-detects **Vite**. Under **Environment Variables**, add the same two
   values from your `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. You'll get a public link like `https://oilgas-crm.vercel.app`.
5. Supabase → **Authentication → URL Configuration** → set **Site URL** to your Vercel
   link (so password-reset emails point to the right place).

---

## What changed under the hood (plain English)

- **Login** is now real email + password, handled by Supabase — no more pretend
  accounts.
- **All your data** (every screen: leads, customers, proposals, invoices, dispatch,
  tasks, chat, etc.) now lives in Supabase instead of a single browser, so it's
  shared and safe.
- **Live updates:** changes made by one person show up for others automatically.
- **The screens and features are unchanged** — same app, real backend.
- Personal preferences (dark mode, sidebar collapsed) still live in your own browser,
  which is correct — those aren't shared.

---

## Troubleshooting

**“Supabase is not configured” on screen.** Your `.env` is missing or has a typo.
Recheck Step 2, then stop the app (Ctrl+C) and run `npm run dev` again — the app only
reads `.env` on startup.

**Login says invalid credentials.** No account matches. Use **Create an account**, or
if you kept email confirmation on, click the email link first.

**Screens are empty.** The sample data loads on the first sign-in. Sign out and back
in, or go to **Settings → System → Reset Demo Data**.

**Changed `.env` but nothing happened.** Always stop and restart `npm run dev` after
editing it.

---

## Where things are

- **`database/supabase-schema.sql`** — the database setup you paste in Step 3.
- **`.env`** — your keys (never shared; already git-ignored).
- **`src/lib/supabase.ts`, `src/lib/db.ts`** — how the app talks to Supabase.
