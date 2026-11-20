# Hartbeat

How every team is really doing, and the one thing to do next.

A web app where managers and HR log in, see a weekly health read for each team, and get evidence-based surveys and wellbeing plans. Built with Next.js and Supabase, hosted on Vercel. Product context lives in `docs/`; rules for working on the code in `CLAUDE.md`.

## What is in version 1

| Screen | What it does |
|---|---|
| Sign in | Email link, no passwords |
| Set up | First sign-in creates your company; optional sample teams |
| Department health | Every team as a card: score, status, 12-week trend, likely factors, suggested survey, wellbeing plan |
| Team page | Score ring, trend chart with health zones, suggested survey with its questions and research |
| Wellbeing | Diagnosis, harm watch, eight-week plan, three service levels, library of ten initiatives |
| People | Import from a CSV export of any HR system; teams are created automatically |
| Pulse | Three anonymous questions by personal link; results only for teams of five or more |

## Run it on your computer

```bash
npm install
npm run dev        # http://localhost:3000
```

With no database keys it runs in **demo mode** with a sample company.

## Connect the database (Supabase)

1. In your Supabase project, open **SQL Editor**, paste all of `supabase/migrations/0001_init.sql`, and click **Run**. Then do the same with `supabase/seed.sql` (adds the optional sample data function).
2. Open **Authentication → URL Configuration**. Set **Site URL** to your Vercel address (for example `https://hartbeat.vercel.app`) and add `https://hartbeat.vercel.app/auth/callback` under **Redirect URLs**. For local testing also add `http://localhost:3000/auth/callback`.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key. Never use the `service_role` key in this app.

## Put it online (Vercel)

1. On vercel.com, **Add New → Project**, import `thorskrindo/hartbeat`.
2. Under **Environment Variables** add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the two values from Supabase, and `NEXT_PUBLIC_SITE_URL` with your Vercel address.
3. **Deploy.** Sign in with your email; the first sign-in sets up your company.

## Checks

```bash
npm run typecheck
npm run build
npm run test:sql   # proves each company only sees its own data, and the pulse stays anonymous
```
