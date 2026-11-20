# Hartbeat

Hartbeat is Thor Skrindo's HR startup. This repository is the real product: a web app where a company's managers and HR log in and see how their teams are doing, week by week, and get evidence-based next steps.

Read these before changing anything:

- `docs/PRODUCT.md`: what Hartbeat is, who it is for, the promises it makes, and the decisions already taken.
- `docs/DESIGN.md`: the look and the writing rules. The app must feel like the website.
- `docs/EVIDENCE.md`: the research behind the scores, surveys and wellbeing initiatives.
- `docs/ROADMAP.md`: what is built, what is next, and what is deliberately parked.

## Stack

- Next.js (App Router, TypeScript), plain CSS in `app/globals.css` (no CSS framework).
- Supabase for login (email magic links) and Postgres. Schema in `supabase/migrations/`, demo data in `supabase/seed.sql`.
- Hosted on Vercel. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Demo mode:** with no Supabase variables set, the app runs on the sample company in `lib/demo.ts` and the login page offers "Continue to the demo". Keep demo mode working; it is how Thor shows the product.

## Rules that protect customers

These come from the product promises in `docs/PRODUCT.md`. Treat a change that weakens one as a product decision for Thor, not a code change.

1. **Every table carries `org_id` and has row level security.** A user only ever reads rows for organisations they are a member of. New tables follow the same pattern as `teams`.
2. **No individual scores.** Health is computed per team. Pulse answers are stored against the team and week, never against the person. Team results are hidden below five respondents (`MIN_GROUP` in `lib/scoring.ts` and `min_group` in SQL; keep them equal).
3. **Scores never feed pay, promotion or exit decisions.** Do not join wellbeing data to performance or HRIS compensation fields.
4. **The service role key never reaches the browser.** Only the anon key is public.
5. Customer data stays in an EU Supabase region.

## Writing rules

- Plain words for managers, not HR jargon. One sentence per heading where possible.
- No em dashes in product copy. No emoji. No eyebrow labels over big titles.
- Numbers are set in Helvetica (the `num` class); text in Calibri Light with Carlito as the free fallback.

## Checks before pushing

`npm run typecheck && npm run build`. Then look at the changed screens: `npm run dev` and open them, or run `node scripts/screens.mjs` for screenshots.

## Weekly review

The Hartbeat backend engineer skill runs every Thursday and reports lag, bugs and simplifications without changing anything. Thor decides what gets fixed.
