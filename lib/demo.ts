// The sample company used in demo mode (no Supabase keys) and for screenshots.
// Deterministic, so the demo looks the same every time.

import type { Org, Person, Team, Week } from "./types";

export const DEMO_ORG: Org = { id: "demo", name: "Nordlys AS (sample company)" };

export const DEMO_TEAMS: Team[] = [
  { id: "t-eng", name: "Engineering · Platform", kind: "engineering", size: 24 },
  { id: "t-sales", name: "Sales · Nordics", kind: "sales", size: 11 },
  { id: "t-mkt", name: "Marketing", kind: "marketing", size: 12 },
  { id: "t-cs", name: "Customer Success", kind: "cs", size: 17 },
  { id: "t-comms", name: "Communications", kind: "comms", size: 6 },
  { id: "t-design", name: "Design", kind: "design", size: 5 }
];

function monday(offsetWeeks: number): string {
  const d = new Date();
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day - offsetWeeks * 7);
  return d.toISOString().slice(0, 10);
}

type Story = (w: number) => [number, number, number, number, number, number]; // load, after, sick, workload, heard, energy
const STORIES: Record<string, Story> = {
  "t-eng":    (w) => [56 + (w % 3), 0.4, 0.15, 3.9 + w * 0.01, 4.1, 4.0],
  "t-sales":  (w) => [64 + (w % 4), 1.0, 0.35, 3.5 - (w > 9 ? 0.4 : 0), 3.4, 3.3 - (w > 9 ? 0.3 : 0)],
  "t-mkt":    (w) => [62 + w * 2.2, 0.6 + w * 0.12, 0.3 + w * 0.08, 3.8 - w * 0.08, 3.5, 3.6 - w * 0.06],
  "t-cs":     (w) => [72 - w * 1.1, 1.4 - w * 0.08, 0.35 - w * 0.01, 3.4 + w * 0.06, 3.7, 3.5 + w * 0.06],
  "t-comms":  (w) => [70 + w * 0.8, 1.6 + w * 0.15, 0.4 + w * 0.09, 3.2, 3.3 - w * 0.08, 3.0 - w * 0.05],
  "t-design": (w) => [52, 0.2, 0.1, 4.2, 4.3, 4.2]
};

export function demoWeeks(teamId: string): Week[] {
  const story = STORIES[teamId];
  const team = DEMO_TEAMS.find((t) => t.id === teamId);
  if (!story || !team) return [];
  return Array.from({ length: 12 }, (_, i) => {
    const [load, after, sick, wl, he, en] = story(i);
    const r = (v: number) => Math.round(v * 100) / 100;
    return {
      weekStart: monday(11 - i),
      calendarLoadPct: Math.min(98, r(load)),
      afterHoursMeetings: r(Math.max(0, after)),
      sickDaysPerPerson: r(Math.max(0, sick)),
      pulse: { respondents: team.size > 6 ? team.size - 2 : team.size, workload: r(wl), heard: r(he), energy: r(en) }
    };
  });
}

export const DEMO_PEOPLE: Person[] = [
  ["Thor Skrindo", "Marketing lead", "t-mkt", "2024-08-01", "London"],
  ["Maya Okafor", "Head of marketing", "t-mkt", "2021-03-01", "London"],
  ["Leo Martins", "Content designer", "t-mkt", "2022-11-01", "Lisbon"],
  ["Jonas Berg", "Account executive", "t-sales", "2025-02-01", "Oslo"],
  ["Ana Costa", "Sales manager", "t-sales", "2020-09-01", "Lisbon"],
  ["Priya Nair", "Software engineer", "t-eng", "2023-06-01", "London"]
].map(([fullName, roleTitle, teamId, startDate, location], i) => ({
  id: `p-${i}`, fullName, roleTitle, teamId, startDate, location,
  email: `${fullName.split(" ")[0].toLowerCase()}@nordlys.example`
}));
