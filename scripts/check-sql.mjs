// Runs the migration and seed in an in-memory Postgres (PGlite) with a stand-in for Supabase's
// auth schema, then checks the promises that matter: each company only sees its own rows,
// pulse results are hidden under five answers, and a pulse link works once.
// Usage: npm run test:sql
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
const ok = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exitCode = 1; } else console.log("ok  ", msg); };

await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key);
  create or replace function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon; create role authenticated;
`);
await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
await db.exec(readFileSync("supabase/seed.sql", "utf8"));
await db.exec(`grant usage on schema public to authenticated, anon;
  grant select, insert, update, delete on all tables in schema public to authenticated;`);

const A = "11111111-1111-1111-1111-111111111111", B = "22222222-2222-2222-2222-222222222222";
await db.exec(`insert into auth.users values ('${A}'), ('${B}');`);
const as = async (user, sql) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user}', false); set role authenticated;`);
  return db.query(sql);
};

const orgA = (await as(A, "select public.create_organization('Company A') as id")).rows[0].id;
const orgB = (await as(B, "select public.create_organization('Company B') as id")).rows[0].id;
await as(A, `select public.load_demo_data('${orgA}')`);

ok((await as(A, "select count(*)::int n from teams")).rows[0].n === 4, "company A sees its four teams");
ok((await as(B, "select count(*)::int n from teams")).rows[0].n === 0, "company B sees none of company A's teams");
ok((await as(B, "select count(*)::int n from team_signals")).rows[0].n === 0, "company B sees none of company A's signals");
ok((await as(A, "select count(*)::int n from pulse_responses")).rows[0].n === 0, "nobody reads raw pulse answers");
ok((await as(A, `select count(*)::int n from public.team_pulse('${orgA}')`)).rows[0].n > 0, "team averages come back for groups of five or more");
ok((await as(B, `select count(*)::int n from public.team_pulse('${orgA}')`)).rows[0].n === 0, "company B cannot read company A's averages");

// a small team: four answers must stay hidden
await as(A, `insert into teams(org_id, name, kind) values ('${orgA}', 'Tiny team', 'other')`);
const tiny = (await as(A, "select id from teams where name = 'Tiny team'")).rows[0].id;
for (let i = 0; i < 4; i++) {
  await as(A, `insert into people(org_id, team_id, full_name, email) values ('${orgA}', '${tiny}', 'P${i}', 'p${i}@a.test')`);
}
const people = (await as(A, `select id from people where team_id = '${tiny}'`)).rows;
const tokens = [];
for (const p of people) {
  tokens.push((await as(A, `insert into pulse_invites(org_id, team_id, person_id, week_start) values ('${orgA}', '${tiny}', '${p.id}', current_date) returning token`)).rows[0].token);
}
await db.exec("reset role; set role anon;");
for (const t of tokens) await db.query(`select public.submit_pulse('${t}', 3, 4, 3)`);
const again = await db.query(`select public.submit_pulse('${tokens[0]}', 1, 1, 1) as r`);
ok(again.rows[0].r === false, "a pulse link only works once");
ok((await as(A, `select count(*)::int n from public.team_pulse('${orgA}') where team_id = '${tiny}'`)).rows[0].n === 0, "a team with four answers stays hidden");

console.log(process.exitCode ? "\nSome checks failed." : "\nAll database checks passed.");
