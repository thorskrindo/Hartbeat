// How a team's weekly health score is made, and how its "likely factors" are picked.
// Every number shown to a manager comes from here, so keep it readable: the product promise
// is that every score shows its working.

import type { Factor, PatternId, Status, SurveyId, Team, TeamHealth, Week } from "./types";

/** Smallest group whose pulse results are shown. Keep equal to min_group in the SQL migration. */
export const MIN_GROUP = 5;

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export function statusFor(score: number): Status {
  if (score >= 75) return "Thriving";
  if (score >= 60) return "Steady";
  if (score >= 45) return "At risk";
  return "Struggling";
}

/** Weights. The pulse (how people say they are) carries most; system signals add context. */
const W = { pulse: 0.55, load: 0.2, after: 0.1, sick: 0.15 };

export function weekScore(w: Week): number | null {
  const parts: [number, number][] = [];
  if (w.pulse && w.pulse.respondents >= MIN_GROUP) {
    const p = ((w.pulse.workload - 1) + (w.pulse.heard - 1) + (w.pulse.energy - 1)) / 12 * 100;
    parts.push([p, W.pulse]);
  }
  // Up to 55% of the working week in meetings is healthy; every point above costs 1.8
  if (w.calendarLoadPct != null) parts.push([clamp(100 - Math.max(0, w.calendarLoadPct - 55) * 1.8), W.load]);
  // Each after-hours meeting per person per week costs 15 points
  if (w.afterHoursMeetings != null) parts.push([clamp(100 - w.afterHoursMeetings * 15), W.after]);
  // Each sick day per person over four weeks costs 50 points
  if (w.sickDaysPerPerson != null) parts.push([clamp(100 - w.sickDaysPerPerson * 50), W.sick]);
  if (!parts.length) return null;
  const total = parts.reduce((s, [, wt]) => s + wt, 0);
  return Math.round(parts.reduce((s, [v, wt]) => s + v * wt, 0) / total);
}

interface OrgContext { sickMean: number; sickSd: number }

export function orgContext(weeksByTeam: Week[][]): OrgContext {
  const latest = weeksByTeam.map((ws) => ws[ws.length - 1]?.sickDaysPerPerson).filter((v): v is number => v != null);
  if (latest.length < 2) return { sickMean: latest[0] ?? 0, sickSd: 0 };
  const mean = latest.reduce((a, b) => a + b, 0) / latest.length;
  const sd = Math.sqrt(latest.reduce((a, b) => a + (b - mean) ** 2, 0) / (latest.length - 1));
  return { sickMean: mean, sickSd: sd };
}

/** The three inputs that most explain where the team is this week. */
export function likelyFactors(weeks: Week[], ctx: OrgContext): Factor[] {
  const now = weeks[weeks.length - 1];
  const before = weeks[Math.max(0, weeks.length - 5)];
  if (!now) return [];
  const out: (Factor & { weight: number })[] = [];

  if (now.calendarLoadPct != null) {
    const up = before?.calendarLoadPct != null ? Math.round(now.calendarLoadPct - before.calendarLoadPct) : 0;
    if (now.calendarLoadPct >= 80) {
      out.push({ what: `Calendars ${Math.round(now.calendarLoadPct)}% full on average`,
        detail: up > 0 ? `Up ${up} points in four weeks` : "Little room for focused work", tone: "bad", weight: now.calendarLoadPct - 70 });
    } else if (now.calendarLoadPct <= 58) {
      out.push({ what: "Focus time protected", detail: `Calendars ${Math.round(now.calendarLoadPct)}% full`, tone: "good", weight: 8 });
    }
  }
  if (now.afterHoursMeetings != null && now.afterHoursMeetings >= 1.5) {
    out.push({ what: "Meetings after hours", detail: `${r1(now.afterHoursMeetings)} a week per person`, tone: "bad", weight: now.afterHoursMeetings * 6 });
  }
  if (now.sickDaysPerPerson != null && ctx.sickSd > 0) {
    const z = (now.sickDaysPerPerson - ctx.sickMean) / ctx.sickSd;
    if (z >= 0.9) {
      out.push({ what: `Sick days ${z >= 1.8 ? "two standard deviations" : "one standard deviation"} higher`,
        detail: `${r1(now.sickDaysPerPerson)} days a person, company average ${r1(ctx.sickMean)}`, tone: "bad", weight: 10 + z * 6 });
    } else if (z <= -0.8) {
      out.push({ what: "Sick days below average", detail: `${r1(now.sickDaysPerPerson)} days a person`, tone: "good", weight: 6 });
    }
  }
  const p = now.pulse && now.pulse.respondents >= MIN_GROUP ? now.pulse : null;
  if (p) {
    const items: [keyof typeof p, string][] = [["workload", "workload"], ["heard", "feeling heard"], ["energy", "energy"]];
    for (const [k, label] of items) {
      const v = p[k] as number;
      if (v <= 3.0) out.push({ what: "Low score on the latest pulse", detail: `${r1(v)} out of 5 on ${label}`, tone: "bad", weight: (3.2 - v) * 30 });
      else if (v >= 4.1) out.push({ what: "Strong pulse scores", detail: `${r1(v)} out of 5 on ${label}`, tone: "good", weight: 5 });
    }
  } else if (now.pulse) {
    out.push({ what: "Too few pulse answers to show", detail: `Results appear from ${MIN_GROUP} answers`, tone: "neutral", weight: 1 });
  }
  return out.sort((a, b) => b.weight - a.weight).slice(0, 3).map(({ weight: _w, ...f }) => f);
}

/** Which survey type to suggest, and which wellbeing pattern the team shows. */
export function diagnose(weeks: Week[], ctx: OrgContext): { survey: SurveyId | null; pattern: PatternId | null } {
  const now = weeks[weeks.length - 1];
  if (!now) return { survey: null, pattern: null };
  const p = now.pulse && now.pulse.respondents >= MIN_GROUP ? now.pulse : null;
  const heavy = (now.calendarLoadPct ?? 0) >= 80 || (now.afterHoursMeetings ?? 0) >= 2;
  const sick = now.sickDaysPerPerson != null && ctx.sickSd > 0 && (now.sickDaysPerPerson - ctx.sickMean) / ctx.sickSd >= 0.9;
  if (p && p.heard <= 2.8) return { survey: "voice", pattern: "unheard" };
  if (heavy && (sick || (p && p.workload <= 3.0))) return { survey: "burnout", pattern: "overload" };
  if (p && p.energy <= 3.0 && !heavy) return { survey: "drive", pattern: "stuck" };
  if (p && (p.workload + p.heard + p.energy) / 3 <= 3.2) return { survey: "role", pattern: "drift" };
  return { survey: null, pattern: null };
}

export function teamHealth(team: Team, weeks: Week[], ctx: OrgContext): TeamHealth {
  const trend = weeks.slice(-12).map(weekScore);
  const score = trend[trend.length - 1] ?? null;
  const prev = trend[trend.length - 2] ?? null;
  const d = diagnose(weeks, ctx);
  const status = score == null ? null : statusFor(score);
  return {
    team, score, status,
    delta: score != null && prev != null ? score - prev : null,
    trend,
    factors: likelyFactors(weeks, ctx),
    surveyId: status === "At risk" || status === "Struggling" || status === "Steady" ? d.survey : null,
    pattern: status === "At risk" || status === "Struggling" ? d.pattern : null
  };
}

export const STATUS_TONE: Record<Status, { fg: string; bg: string; bar: string }> = {
  Thriving:   { fg: "#1E7A4F", bg: "#E2F3E9", bar: "#1EA97C" },
  Steady:     { fg: "#1F5FD0", bg: "#EAF1FE", bar: "#3280FD" },
  "At risk":  { fg: "#9A520A", bg: "#FDEFDC", bar: "#F0A020" },
  Struggling: { fg: "#B3272D", bg: "#FCE5E6", bar: "#E5484D" }
};
