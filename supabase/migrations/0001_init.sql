-- Hartbeat: first schema.
--
-- The rule behind every table: each row belongs to one organisation (org_id), and row level
-- security lets a signed-in user see only the organisations they are a member of. That is the
-- "one database wall per company" promise in docs/PRODUCT.md.
--
-- Pulse answers are stored against team and week, never against a person, and team results are
-- only returned when at least five people answered (min_group). Keep min_group equal to
-- MIN_GROUP in lib/scoring.ts.


-- ---------------------------------------------------------------- organisations and members

create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  created_at  timestamptz not null default now()
);

create table public.memberships (
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'manager' check (role in ('admin', 'hr', 'manager')),
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_idx on public.memberships(user_id);

-- Security definer helpers, so policies can check membership without recursing into
-- the memberships policy itself.
create or replace function public.is_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where org_id = p_org and user_id = auth.uid());
$$;

create or replace function public.has_role(p_org uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where org_id = p_org and user_id = auth.uid() and role = any(p_roles));
$$;

-- ---------------------------------------------------------------- teams and people

create table public.teams (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 80),
  kind             text not null default 'other',   -- picks the department symbol: engineering, sales, marketing, cs, design, hr, ops, finance, comms, other
  manager_user_id  uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  unique (org_id, name)
);
create index teams_org_idx on public.teams(org_id);

create table public.people (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  team_id     uuid references public.teams(id) on delete set null,
  full_name   text not null,
  email       text,
  role_title  text,
  start_date  date,
  location    text,
  age_band    text,     -- aggregate succession planning only; never used to rank a person
  created_at  timestamptz not null default now(),
  unique (org_id, email)
);
create index people_org_idx on public.people(org_id);
create index people_team_idx on public.people(team_id);

-- ---------------------------------------------------------------- weekly signals per team

-- Counts and averages only, never content. Filled by CSV import now, by Microsoft 365,
-- Google Workspace and HRIS connections later.
create table public.team_signals (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references public.organizations(id) on delete cascade,
  team_id               uuid not null references public.teams(id) on delete cascade,
  week_start            date not null,
  calendar_load_pct     numeric(5,1) check (calendar_load_pct between 0 and 100),
  after_hours_meetings  numeric(6,2) check (after_hours_meetings >= 0),   -- per person per week
  sick_days_per_person  numeric(6,2) check (sick_days_per_person >= 0),   -- per person, rolling four weeks
  unique (team_id, week_start)
);
create index team_signals_org_idx on public.team_signals(org_id);

-- ---------------------------------------------------------------- the anonymous pulse

-- One personal link per person per pulse. The link is what makes each answer count once;
-- the answer itself is stored without the person.
create table public.pulse_invites (
  token       uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete cascade,
  person_id   uuid not null references public.people(id) on delete cascade,
  week_start  date not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now(),
  unique (person_id, week_start)
);
create index pulse_invites_org_idx on public.pulse_invites(org_id);

create table public.pulse_responses (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete cascade,
  week_start  date not null,
  workload    smallint not null check (workload between 1 and 5),
  heard       smallint not null check (heard between 1 and 5),
  energy      smallint not null check (energy between 1 and 5)
  -- no person_id, no timestamp: an answer cannot be traced back to who gave it or when
);
create index pulse_responses_team_week_idx on public.pulse_responses(team_id, week_start);

-- ---------------------------------------------------------------- wellbeing plans

create table public.wellbeing_plans (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete cascade,
  tier        text not null default 'guided' check (tier in ('playbook', 'guided', 'facilitated')),
  status      text not null default 'active' check (status in ('draft', 'active', 'done')),
  started_on  date not null default current_date,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index wellbeing_plans_team_idx on public.wellbeing_plans(team_id);

create table public.plan_items (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  plan_id        uuid not null references public.wellbeing_plans(id) on delete cascade,
  initiative_id  text not null,           -- id from lib/initiatives.ts
  start_week     smallint not null check (start_week between 1 and 8),
  end_week       smallint not null check (end_week between 1 and 8),
  unique (plan_id, initiative_id)
);

-- ---------------------------------------------------------------- row level security

alter table public.organizations   enable row level security;
alter table public.memberships     enable row level security;
alter table public.teams           enable row level security;
alter table public.people          enable row level security;
alter table public.team_signals    enable row level security;
alter table public.pulse_invites   enable row level security;
alter table public.pulse_responses enable row level security;
alter table public.wellbeing_plans enable row level security;
alter table public.plan_items      enable row level security;

create policy "members read their organisation" on public.organizations
  for select using (public.is_member(id));
create policy "admins rename their organisation" on public.organizations
  for update using (public.has_role(id, array['admin']));

create policy "members see who else is in the organisation" on public.memberships
  for select using (public.is_member(org_id));
create policy "admins manage members" on public.memberships
  for all using (public.has_role(org_id, array['admin'])) with check (public.has_role(org_id, array['admin']));

-- Teams, people and signals: every member reads; admins and HR write.
create policy "members read teams" on public.teams for select using (public.is_member(org_id));
create policy "hr writes teams" on public.teams for all
  using (public.has_role(org_id, array['admin', 'hr'])) with check (public.has_role(org_id, array['admin', 'hr']));

create policy "members read people" on public.people for select using (public.is_member(org_id));
create policy "hr writes people" on public.people for all
  using (public.has_role(org_id, array['admin', 'hr'])) with check (public.has_role(org_id, array['admin', 'hr']));

create policy "members read signals" on public.team_signals for select using (public.is_member(org_id));
create policy "hr writes signals" on public.team_signals for all
  using (public.has_role(org_id, array['admin', 'hr'])) with check (public.has_role(org_id, array['admin', 'hr']));

-- Pulse invites are managed by HR. Nobody reads raw pulse responses directly:
-- the only way out is team_pulse(), which hides groups under five.
create policy "hr manages invites" on public.pulse_invites for all
  using (public.has_role(org_id, array['admin', 'hr'])) with check (public.has_role(org_id, array['admin', 'hr']));

-- Plans: any member can read and create plans for their organisation's teams.
create policy "members read plans" on public.wellbeing_plans for select using (public.is_member(org_id));
create policy "members write plans" on public.wellbeing_plans for all
  using (public.is_member(org_id)) with check (public.is_member(org_id));
create policy "members read plan items" on public.plan_items for select using (public.is_member(org_id));
create policy "members write plan items" on public.plan_items for all
  using (public.is_member(org_id)) with check (public.is_member(org_id));

-- ---------------------------------------------------------------- functions

-- Create an organisation and make the caller its admin (first login, onboarding).
create or replace function public.create_organization(p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into organizations(name) values (p_name) returning id into v_org;
  insert into memberships(org_id, user_id, role) values (v_org, auth.uid(), 'admin');
  return v_org;
end $$;
grant execute on function public.create_organization(text) to authenticated;

-- Weekly pulse averages per team, only where at least min_group people answered.
create or replace function public.team_pulse(p_org uuid, p_weeks int default 12)
returns table (team_id uuid, week_start date, respondents int, workload numeric, heard numeric, energy numeric)
language sql stable security definer set search_path = public as $$
  with min_group as (select 5 as n)
  select r.team_id, r.week_start, count(*)::int,
         round(avg(r.workload), 2), round(avg(r.heard), 2), round(avg(r.energy), 2)
  from pulse_responses r
  where r.org_id = p_org
    and public.is_member(p_org)
    and r.week_start >= current_date - (p_weeks * 7)
  group by r.team_id, r.week_start
  having count(*) >= (select n from min_group);
$$;
grant execute on function public.team_pulse(uuid, int) to authenticated;

-- What the pulse page needs to show, looked up by the personal link. Reveals nothing else.
create or replace function public.pulse_invite_status(p_token uuid)
returns table (valid boolean, used boolean, org_name text)
language sql stable security definer set search_path = public as $$
  select true, i.used_at is not null, o.name
  from pulse_invites i join organizations o on o.id = i.org_id
  where i.token = p_token;
$$;
grant execute on function public.pulse_invite_status(uuid) to anon, authenticated;

-- Submit a pulse by personal link, no login needed. Marks the link used and stores the
-- answer against the team and week only.
create or replace function public.submit_pulse(p_token uuid, p_workload int, p_heard int, p_energy int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_inv pulse_invites%rowtype;
begin
  select * into v_inv from pulse_invites where token = p_token for update;
  if not found or v_inv.used_at is not null then return false; end if;
  if p_workload not between 1 and 5 or p_heard not between 1 and 5 or p_energy not between 1 and 5 then
    raise exception 'answers must be 1 to 5';
  end if;
  update pulse_invites set used_at = now() where token = p_token;
  insert into pulse_responses(org_id, team_id, week_start, workload, heard, energy)
  values (v_inv.org_id, v_inv.team_id, v_inv.week_start, p_workload, p_heard, p_energy);
  return true;
end $$;
grant execute on function public.submit_pulse(uuid, int, int, int) to anon, authenticated;
