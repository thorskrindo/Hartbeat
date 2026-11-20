// The research-based content of the product: survey types, wellbeing pathways, initiatives and
// the patterns that link a team's signals to a plan. Sources and caveats: docs/EVIDENCE.md.
// Copy rule: plain words, no em dashes.

import type { PathwayId, PatternId, SurveyId } from "./types";

export interface Survey {
  id: SurveyId; name: string; line: string; what: string;
  measures: string[]; when: string[]; questions: string[]; basis: string; color: string;
}

export const SURVEYS: Record<SurveyId, Survey> = {
  voice: { id: "voice", name: "Employee voice", color: "#3280FD",
    line: "Do people speak up, and does it change anything?",
    what: "Checks whether people share ideas and raise problems, whether it feels safe to do so, and whether they believe someone acts on it.",
    measures: ["Speaking up with ideas", "Raising concerns", "Psychological safety", "Belief that voice is heard"],
    when: ["Low score on feeling heard in the pulse", "Fewer people answering pulses", "A reorganisation or new manager in the last quarter"],
    questions: ["If I saw a problem in how we work, I would say so.", "It is safe to take a risk or admit a mistake in this team.", "When I raise something, I can see that it is acted on."],
    basis: "Van Dyne and LePine (1998); Liang, Farh and Farh (2012); Edmondson (1999); Thomas, Whitman and Viswesvaran (2010)." },
  role: { id: "role", name: "Role satisfaction", color: "#1EA97C",
    line: "Is the job itself well designed and clear?",
    what: "Looks at the job rather than the person: how varied and meaningful the work is, how much say people have, and whether the role is clear and doable.",
    measures: ["Autonomy", "Skill variety and meaning", "Feedback from the work", "Role clarity", "Role overload"],
    when: ["Many meetings for other teams' projects", "Workload pulse low while hours stay normal", "New joiners or changed job descriptions"],
    questions: ["I know clearly what is expected of me in my role.", "I have a real say in how I do my work.", "Most of my week goes to work that belongs to my role."],
    basis: "Hackman and Oldham (1975, 1976); Humphrey, Nahrgang and Morgeson (2007); Kahn et al. (1964)." },
  drive: { id: "drive", name: "Motivation and ambition", color: "#9C7BE8",
    line: "Why people work, and where they want to go.",
    what: "Measures energy and absorption in the work, whether motivation comes from interest or from pressure, and whether people see a way to grow here.",
    measures: ["Vigour and dedication", "Motivation from interest or pressure", "Growth and ambition", "Intent to stay"],
    when: ["Energy dipping while calendar load is normal", "No learning time in calendars", "Long time in the same role"],
    questions: ["At work, I feel full of energy.", "I do this work because I find it meaningful, not because I have to.", "I can see how I could grow in this organisation."],
    basis: "Deci and Ryan (2000); Gagné et al. (2015); Schaufeli, Bakker and Salanova (2006); Mitchell et al. (2001)." },
  burnout: { id: "burnout", name: "Burnout risk", color: "#F0A020",
    line: "Are demands outgrowing resources?",
    what: "Checks for the early signs of burnout, exhaustion and pulling away from the work, and for the demands and missing support that cause them.",
    measures: ["Exhaustion", "Mental distance from work", "Workload and pace", "Support from manager and peers"],
    when: ["Calendars above 80% full for weeks", "Sick days one standard deviation above the company average", "Low workload score in the latest pulse"],
    questions: ["At the end of the working day, I feel worn out.", "I struggle to switch off from work in the evening.", "When the workload gets too much, I have someone to turn to."],
    basis: "Demerouti et al. (2001); Bakker and Demerouti (2007); Kristensen et al. (2005), Copenhagen Burnout Inventory." }
};

export const PATHWAYS: Record<PathwayId, { label: string; color: string; bg: string; fg: string }> = {
  workload: { label: "Too much, for too long", color: "#F0A020", bg: "#FDF0E0", fg: "#8A4A06" },
  support:  { label: "Feeling unsupported",   color: "#3280FD", bg: "#EAF1FE", fg: "#1F4FA8" },
  voice:    { label: "Not being heard",       color: "#9C7BE8", bg: "#F1ECFD", fg: "#5B3FB8" },
  growth:   { label: "No way forward",        color: "#1EA97C", bg: "#E5F5EC", fg: "#17734F" },
  meaning:  { label: "Work without meaning",  color: "#E8709A", bg: "#FCEAF1", fg: "#A23463" }
};

export interface Initiative {
  id: string; path: PathwayId; name: string; strength: "survey" | "early";
  short: string; what: string; chain: [string, string, string]; why: string;
  steps: string[]; track: string[]; evidence: string;
}

export const INITIATIVES: Initiative[] = [
  { id: "reset", path: "workload", name: "Workload reset", strength: "survey",
    short: "A team stop-list, protected focus time and a cap on late meetings.",
    what: "The team agrees what to stop, delay or hand back, protects focus blocks in the calendar, and sets a limit on meetings after 17:00.",
    chain: ["Less work intensification", "Felt support", "Less health harm"],
    why: "Pushing more output from the same people is linked to health harm at work. The harm is smaller where people feel the organisation supports them.",
    steps: ["A 30 minute team session to build the stop-list", "Focus time blocked and meetings past 17:00 flagged", "A two minute check at week 4 on what came back"],
    track: ["Calendar load", "Meetings after hours", "Workload pulse"],
    evidence: "Chillakuri and Vanka (2020, 2021), via Qamar, Afshan and Rana (2024)." },
  { id: "flex", path: "workload", name: "Flexible working trial", strength: "survey",
    short: "Flexitime, home days or a compressed week, tried for eight weeks.",
    what: "The team picks one form of flexibility, tries it for eight weeks, and keeps, changes or drops it based on the numbers.",
    chain: ["Flexible working", "Control over time", "Wellbeing, less absence"],
    why: "Flexible working strengthens the link between good HR practice and wellbeing.",
    steps: ["Choose the form with the team, not for it", "Agree core hours so collaboration still works", "Review at week 8 with the data"],
    track: ["Sick days", "Workload pulse", "Energy pulse"],
    evidence: "Donald et al. (2020); Mariappanadar (2020), via Qamar, Afshan and Rana (2024)." },
  { id: "checkins", path: "support", name: "Manager support check-ins", strength: "survey",
    short: "Fortnightly one-to-ones about load, resources and blockers.",
    what: "Short one-to-ones every two weeks that ask about workload and what is in the way, not about performance.",
    chain: ["Supportive HR practice", "Perceived organisational support", "Less health harm"],
    why: "When people feel the organisation values them and has their back, HR practices turn into wellbeing instead of strain.",
    steps: ["Slots booked with three suggested questions", "One action logged per check-in", "Follow-ups shown to the team in aggregate"],
    track: ["One-to-ones held", "Feeling supported pulse", "Sick days"],
    evidence: "Mariappanadar (2020); Almarzooqi et al. (2019), via Qamar, Afshan and Rana (2024)." },
  { id: "open", path: "support", name: "Open decisions", strength: "survey",
    short: "Explain how work, pay and promotion are decided, in writing.",
    what: "Publish the criteria behind workload allocation, pay and promotion, and explain each big decision to the team when it is made.",
    chain: ["Transparency and justice", "Trust in the system", "Satisfaction and staying"],
    why: "Trust in managers and in the system links HR practices with job satisfaction and lower intention to quit.",
    steps: ["Write down the criteria that already exist", "Share them with the team and take questions", "Repeat at every major decision"],
    track: ["Trust pulse", "Intent to stay pulse"],
    evidence: "Gould-Williams (2003); Diaz-Carrion et al. (2020), via Qamar, Afshan and Rana (2024)." },
  { id: "forum", path: "voice", name: "Team voice forum", strength: "early",
    short: "A monthly team conversation with a written follow-up.",
    what: "Once a month the team raises what is not working. The manager answers in writing within a week: done, doing, or not doing and why.",
    chain: ["Social dialogue", "Voice that changes things", "Employee wellbeing"],
    why: "The quality and breadth of dialogue between people and management is one route from good HR practice to wellbeing.",
    steps: ["Topics collected anonymously beforehand", "A 45 minute forum, notes shared the same day", "Written answers tracked until closed"],
    track: ["Feeling heard pulse", "Topics closed"],
    evidence: "De Prins et al. (2020), via Qamar, Afshan and Rana (2024)." },
  { id: "anon", path: "voice", name: "Anonymous feedback with follow-ups", strength: "survey",
    short: "A safe channel to raise problems, and proof that someone acts.",
    what: "An always-open anonymous channel. Every theme gets a visible response, so people learn that speaking up is safe and useful.",
    chain: ["Employee-oriented HR", "Trust and psychological safety", "More voice"],
    why: "People speak up when they trust management and feel safe. Ethical leadership and employee-oriented HR both build that.",
    steps: ["Open the channel and explain who sees what", "Group themes, never single comments", "Answer each theme publicly within two weeks"],
    track: ["Feeling heard pulse", "Psychological safety pulse"],
    evidence: "Hu and Jiang (2018); Ahmad and Umrani (2019), via Qamar, Afshan and Rana (2024)." },
  { id: "growth", path: "growth", name: "A growth plan for every person", strength: "survey",
    short: "Learning time, a clear next step, and internal moves first.",
    what: "Each person agrees one skill to build and one next step, with protected learning time and open internal roles.",
    chain: ["Responsible talent development", "Learning and employability", "Engagement, less burnout"],
    why: "Developing and keeping people responsibly is linked to life satisfaction, engagement and lower burnout.",
    steps: ["A growth conversation in the next one-to-one", "Two hours a fortnight of protected learning time", "Internal roles shown first"],
    track: ["Ambition pulse", "Intent to stay pulse", "Internal moves"],
    evidence: "Anlesinya and Amponsah-Tawiah (2020); Donald et al. (2020), via Qamar, Afshan and Rana (2024)." },
  { id: "craft", path: "growth", name: "Job crafting sessions", strength: "survey",
    short: "People reshape their tasks toward what they do best.",
    what: "A guided session where each person maps their tasks and moves a little of their week toward strengths and interests.",
    chain: ["Socially responsible HR", "Job crafting", "Meaningful work, less strain"],
    why: "When people may shape their own job, work feels more meaningful and less straining, especially under authentic leaders.",
    steps: ["A 60 minute crafting workshop", "One change per person, agreed with the manager", "Check at week 4 whether it stuck"],
    track: ["Meaning pulse", "Energy pulse"],
    evidence: "Luu (2021), via Qamar, Afshan and Rana (2024)." },
  { id: "decent", path: "meaning", name: "Decent work check", strength: "survey",
    short: "Fair pay, security and safe conditions, checked team by team.",
    what: "A short audit of the basics: fair pay against the market, contract security, safe conditions and reasonable hours.",
    chain: ["Access to decent work", "Meaning and engagement", "Work-family enrichment"],
    why: "Decent work gives people meaning and energy at work, which carries over into life outside it.",
    steps: ["The team compared against four basics", "Gaps go to HR with a cost estimate", "Progress shared with the team"],
    track: ["Meaning pulse", "Intent to stay pulse"],
    evidence: "Kashyap and Arora (2020), via Qamar, Afshan and Rana (2024)." },
  { id: "purpose", path: "meaning", name: "Purpose and volunteering days", strength: "early",
    short: "Time to do good together, and pride in where you work.",
    what: "Team volunteering days and visible social responsibility, so people can be proud of what the organisation stands for.",
    chain: ["Socially responsible HR", "Pride and identification", "Commitment"],
    why: "People who identify with a responsible employer feel more pride and commitment.",
    steps: ["The team chooses a cause", "One day a quarter, in work time", "A short story shared afterwards"],
    track: ["Pride pulse", "Intent to stay pulse"],
    evidence: "Lechuga Sancho et al. (2018); Jerónimo et al. (2020), via Qamar, Afshan and Rana (2024)." }
];

export const INITIATIVE = Object.fromEntries(INITIATIVES.map((i) => [i.id, i])) as Record<string, Initiative>;

export interface Pattern {
  id: PatternId; headline: string; paths: PathwayId[]; harm: string; harmNote: string;
  plan: [string, number, number][];   // initiative id, start week, end week
}

export const PATTERNS: Record<PatternId, Pattern> = {
  overload: { id: "overload", headline: "Demands are outgrowing support.", paths: ["workload", "support"],
    harm: "work intensification", harmNote: "More output is being asked of the same people. Act on workload before adding anything new.",
    plan: [["reset", 1, 2], ["checkins", 2, 8], ["flex", 3, 8]] },
  unheard: { id: "unheard", headline: "People are not being heard.", paths: ["voice", "workload"],
    harm: "concerns going unspoken", harmNote: "When people stop raising problems, the numbers look calm until someone leaves. Open a safe channel first.",
    plan: [["anon", 1, 8], ["forum", 2, 8], ["reset", 1, 2]] },
  stuck: { id: "stuck", headline: "Energy is fading without overload.", paths: ["growth", "meaning"],
    harm: "quiet disengagement", harmNote: "Hours look normal but energy is dropping. This often comes before people start looking elsewhere.",
    plan: [["growth", 1, 8], ["craft", 2, 3], ["purpose", 5, 6]] },
  drift: { id: "drift", headline: "The job itself has gone unclear.", paths: ["support", "growth"],
    harm: "role overload", harmNote: "Unclear roles pull people into work that is not theirs. Redraw the role before adding support.",
    plan: [["open", 1, 3], ["checkins", 1, 8], ["craft", 4, 5]] }
};

export const TIERS = [
  { id: "playbook", name: "Playbook", note: "The manager runs it. Hartbeat gives the steps, the scripts and the measures." },
  { id: "guided", name: "Guided", note: "Hartbeat schedules every step, nudges the manager, and reports progress each week." },
  { id: "facilitated", name: "With a facilitator", note: "A Hartbeat partner runs the workshops and forums with the team. Hartbeat measures the effect." }
] as const;
export type TierId = (typeof TIERS)[number]["id"];
