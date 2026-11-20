export type Role = "admin" | "hr" | "manager";
export type Status = "Thriving" | "Steady" | "At risk" | "Struggling";
export type TeamKind =
  | "engineering" | "sales" | "marketing" | "cs" | "design" | "hr" | "ops" | "finance" | "comms" | "other";

export interface Org { id: string; name: string }

export interface Team {
  id: string;
  name: string;
  kind: TeamKind;
  size: number;
}

export interface Person {
  id: string;
  fullName: string;
  email: string | null;
  roleTitle: string | null;
  teamId: string | null;
  startDate: string | null;
  location: string | null;
}

/** One week of what Hartbeat knows about a team. Any field can be missing. */
export interface Week {
  weekStart: string;              // ISO date of the Monday
  calendarLoadPct?: number | null;
  afterHoursMeetings?: number | null;
  sickDaysPerPerson?: number | null;
  pulse?: { respondents: number; workload: number; heard: number; energy: number } | null;
}

export interface Factor { what: string; detail: string; tone: "bad" | "good" | "neutral" }

export interface TeamHealth {
  team: Team;
  score: number | null;
  status: Status | null;
  delta: number | null;           // change against last week
  trend: (number | null)[];        // up to 12 weekly scores, oldest first
  factors: Factor[];
  surveyId: SurveyId | null;
  pattern: PatternId | null;
}

export type SurveyId = "voice" | "role" | "drive" | "burnout";
export type PathwayId = "workload" | "support" | "voice" | "growth" | "meaning";
export type PatternId = "overload" | "unheard" | "stuck" | "drift";
