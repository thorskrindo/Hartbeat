import "server-only";
import { redirect } from "next/navigation";
import { IS_DEMO } from "./env";
import { DEMO_ORG, DEMO_PEOPLE, DEMO_TEAMS, demoWeeks } from "./demo";
import { orgContext, teamHealth } from "./scoring";
import { supabaseServer } from "./supabase/server";
import type { Org, Person, Role, Team, TeamHealth, TeamKind, Week } from "./types";

export interface Ctx { demo: boolean; org: Org; role: Role; email: string | null }

/** Who is signed in and which organisation they are looking at. Sends new users to setup. */
export async function getCtx(): Promise<Ctx> {
  if (IS_DEMO) return { demo: true, org: DEMO_ORG, role: "admin", email: "demo@hartbeat.app" };
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb.from("memberships").select("role, organizations(id, name)").eq("user_id", user.id).limit(1).maybeSingle();
  const org = data?.organizations as unknown as Org | null;
  if (!data || !org) redirect("/app/setup");
  return { demo: false, org, role: data.role as Role, email: user.email ?? null };
}

function mondays(n: number): string[] {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return Array.from({ length: n }, (_, i) => {
    const x = new Date(d); x.setUTCDate(d.getUTCDate() - (n - 1 - i) * 7);
    return x.toISOString().slice(0, 10);
  });
}

async function liveTeamsAndWeeks(orgId: string): Promise<{ teams: Team[]; weeks: Record<string, Week[]> }> {
  const sb = await supabaseServer();
  const weeksList = mondays(12);
  const [teamsQ, peopleQ, sigQ, pulseQ] = await Promise.all([
    sb.from("teams").select("id, name, kind").eq("org_id", orgId).order("name"),
    sb.from("people").select("team_id").eq("org_id", orgId),
    sb.from("team_signals").select("team_id, week_start, calendar_load_pct, after_hours_meetings, sick_days_per_person")
      .eq("org_id", orgId).gte("week_start", weeksList[0]),
    sb.rpc("team_pulse", { p_org: orgId, p_weeks: 12 })
  ]);
  const size: Record<string, number> = {};
  (peopleQ.data ?? []).forEach((p) => { if (p.team_id) size[p.team_id] = (size[p.team_id] ?? 0) + 1; });
  const teams: Team[] = (teamsQ.data ?? []).map((t) => ({ id: t.id, name: t.name, kind: t.kind as TeamKind, size: size[t.id] ?? 0 }));
  const weeks: Record<string, Week[]> = {};
  for (const t of teams) {
    weeks[t.id] = weeksList.map((ws) => {
      const s = sigQ.data?.find((x) => x.team_id === t.id && x.week_start === ws);
      const p = (pulseQ.data as { team_id: string; week_start: string; respondents: number; workload: number; heard: number; energy: number }[] | null)
        ?.find((x) => x.team_id === t.id && x.week_start === ws);
      return {
        weekStart: ws,
        calendarLoadPct: s?.calendar_load_pct != null ? Number(s.calendar_load_pct) : null,
        afterHoursMeetings: s?.after_hours_meetings != null ? Number(s.after_hours_meetings) : null,
        sickDaysPerPerson: s?.sick_days_per_person != null ? Number(s.sick_days_per_person) : null,
        pulse: p ? { respondents: p.respondents, workload: Number(p.workload), heard: Number(p.heard), energy: Number(p.energy) } : null
      };
    }).filter((w) => w.calendarLoadPct != null || w.pulse);
  }
  return { teams, weeks };
}

export async function getHealth(ctx: Ctx): Promise<TeamHealth[]> {
  let teams: Team[], weeks: Record<string, Week[]>;
  if (ctx.demo) {
    teams = DEMO_TEAMS;
    weeks = Object.fromEntries(DEMO_TEAMS.map((t) => [t.id, demoWeeks(t.id)]));
  } else {
    ({ teams, weeks } = await liveTeamsAndWeeks(ctx.org.id));
  }
  const oc = orgContext(teams.map((t) => weeks[t.id] ?? []));
  const order = { Struggling: 0, "At risk": 1, Steady: 2, Thriving: 3 } as const;
  return teams
    .map((t) => teamHealth(t, weeks[t.id] ?? [], oc))
    .sort((a, b) => (a.status ? order[a.status] : 9) - (b.status ? order[b.status] : 9) || a.team.name.localeCompare(b.team.name));
}

export async function getTeams(ctx: Ctx): Promise<Team[]> {
  if (ctx.demo) return DEMO_TEAMS;
  return (await liveTeamsAndWeeks(ctx.org.id)).teams;
}

export async function getPeople(ctx: Ctx): Promise<Person[]> {
  if (ctx.demo) return DEMO_PEOPLE;
  const sb = await supabaseServer();
  const { data } = await sb.from("people").select("id, full_name, email, role_title, team_id, start_date, location")
    .eq("org_id", ctx.org.id).order("full_name");
  return (data ?? []).map((p) => ({ id: p.id, fullName: p.full_name, email: p.email, roleTitle: p.role_title,
    teamId: p.team_id, startDate: p.start_date, location: p.location }));
}
