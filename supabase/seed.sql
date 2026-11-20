-- Sample data for a pilot demo. Fills an organisation you are an admin of with four teams,
-- people, twelve weeks of signals and anonymous pulse answers, so the dashboard has
-- something to show before real data is connected.
--
-- Usage, in the Supabase SQL editor while signed in as the admin (or replace auth.uid()):
--   select public.load_demo_data('<your organisation id>');

create or replace function public.load_demo_data(p_org uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  t record;
  w int;
  wk date;
  n int;
  base_load numeric; base_sick numeric; mood numeric;
begin
  if not public.has_role(p_org, array['admin']) then raise exception 'admins only'; end if;

  insert into teams(org_id, name, kind) values
    (p_org, 'Engineering · Platform', 'engineering'),
    (p_org, 'Sales · Nordics', 'sales'),
    (p_org, 'Marketing', 'marketing'),
    (p_org, 'Customer Success', 'cs')
  on conflict (org_id, name) do nothing;

  for t in select id, kind from teams where org_id = p_org loop
    -- each team gets its own story: marketing slides into overload, the rest hold or improve
    for w in 0..11 loop
      wk := date_trunc('week', current_date)::date - (11 - w) * 7;
      if t.kind = 'marketing' then
        base_load := 62 + w * 2.2;  base_sick := 0.3 + w * 0.06;  mood := 3.8 - w * 0.08;
      elsif t.kind = 'sales' then
        base_load := 66 + (w % 3);  base_sick := 0.35;            mood := 3.5 - (w % 4) * 0.05;
      elsif t.kind = 'cs' then
        base_load := 70 - w * 0.8;  base_sick := 0.3;             mood := 3.6 + w * 0.05;
      else
        base_load := 55 + (w % 2);  base_sick := 0.15;            mood := 4.0;
      end if;
      insert into team_signals(org_id, team_id, week_start, calendar_load_pct, after_hours_meetings, sick_days_per_person)
      values (p_org, t.id, wk, least(base_load, 98), greatest(0, (base_load - 60) / 8), base_sick)
      on conflict (team_id, week_start) do nothing;
      for n in 1..7 loop
        insert into pulse_responses(org_id, team_id, week_start, workload, heard, energy)
        values (p_org, t.id, wk,
          greatest(1, least(5, round(mood + (random() - 0.5) * 1.6)::int)),
          greatest(1, least(5, round(mood + 0.2 + (random() - 0.5) * 1.6)::int)),
          greatest(1, least(5, round(mood - 0.1 + (random() - 0.5) * 1.6)::int)));
      end loop;
    end loop;
  end loop;
end $$;
grant execute on function public.load_demo_data(uuid) to authenticated;
