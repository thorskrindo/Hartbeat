# Hartbeat: the product

## In one sentence

Hartbeat tells a manager, every week, how each of their teams is really doing, why, and the one thing to do next.

## Why it exists

Most companies learn that a team is struggling from an annual survey months after it started, or from a resignation. The signals were there earlier: calendars filling up, late evenings, absence creeping up, people going quiet. Hartbeat reads the signals a company already has, adds a short pulse, and turns them into a weekly read per team with a clear next step.

The site's line: **"Do you know how your team is really doing?"**

## Who it is for

- **Managers** see their own teams and get suggested next steps.
- **HR and People teams** see every team, run surveys and wellbeing plans, and connect the company's systems.
- **Employees** answer three questions every fourth day, in about 20 seconds, anonymously.

The first customers are design partners in pilots, starting in the Nordics and the UK.

## Products (one platform, one data layer)

"The last piece of HR software you need."

1. **Team health** (building now). The weekly read of every team, likely factors, survey suggestions and evidence-based wellbeing plans.
2. **Recruiting** (prototype, called Shortlist). Skills-based hiring, internal moves before external hires, structured interview questions, explained scores.
3. **Workforce planning** (next). Who the company needs next, built from its business goals, tenure and movement data.

## The weekly read

Each team gets a health score from 0 to 100 and a status:

| Score | Status |
|---|---|
| 75 and above | Thriving |
| 60 to 74 | Steady |
| 45 to 59 | At risk |
| below 45 | Struggling |

The score combines the pulse (how people say they are) with signals from systems (calendar load, meetings after hours, sick days). Every score shows its working: the "likely factors" listed on each team card are the inputs that moved it most. See `lib/scoring.ts`.

## The pulse

Three questions every fourth day, about 91 short pulses a year instead of one long survey a semester. Default questions cover workload, feeling heard and energy. Survey types can be added for four weeks at a time:

- **Employee voice**: do people speak up, and does it change anything?
- **Role satisfaction**: is the job itself well designed and clear?
- **Motivation and ambition**: why people work, and where they want to go.
- **Burnout risk**: are demands outgrowing resources?

Each survey type is rooted in established research (see `docs/EVIDENCE.md`) and is recommended when a specific combination of signals shows up.

## Wellbeing strategy

When a team is at risk, Hartbeat names the pattern ("Demands are outgrowing support"), flags any harm to act on first (work intensification, late evenings, load shifted after an absence), and recommends an eight-week plan from a library of ten initiatives in five pathways:

| Pathway | Initiatives |
|---|---|
| Too much, for too long | Workload reset; Flexible working trial |
| Feeling unsupported | Manager support check-ins; Open decisions |
| Not being heard | Team voice forum; Anonymous feedback with follow-ups |
| No way forward | A growth plan for every person; Job crafting sessions |
| Work without meaning | Decent work check; Purpose and volunteering days |

Three ways to run a plan, which is also how the service is sold:

- **Playbook**: the manager runs it; Hartbeat gives steps, scripts and measures.
- **Guided**: Hartbeat schedules every step, nudges the manager and reports weekly.
- **With a facilitator**: a Hartbeat partner runs workshops and forums; Hartbeat measures the effect.

Every plan is measured before, at week 4 and at week 8, so each customer builds its own evidence.

## Promises (the trust architecture)

These are founding decisions. Changing one is a decision for Thor.

1. **No individual scores.** Only teams of five or more are shown.
2. **Anonymous pulse.** Answers are stored against team and week, never against a person.
3. **Scores are never an input to pay, promotion or exit decisions.**
4. **Your data stays yours.** EU hosting, one database wall per company, GDPR first.
5. **A person makes every decision.** Hartbeat suggests and explains; managers and HR decide. Recruiting features are high-risk under the EU AI Act and need documentation, human oversight and bias testing.

## Connections to a customer's systems

In order of difficulty:

1. **CSV import** of people from any HR system export (built first; every HRIS can export).
2. **Microsoft 365 / Teams** for calendar load and meeting hours (needs the customer's IT to approve an app registration). Counts only, never content.
3. **Google Workspace** calendar.
4. **HRIS APIs**: Workday, BambooHR, HiBob, Personio, SAP SuccessFactors, Rippling. Built with design partners, one at a time.
5. **Slack** after-hours message counts.

## Open questions (from the ideas doc)

- Performance management: firewall it from wellbeing data, or build only the weekly check-in and growth half? Leaning towards the check-in half only.
- Packages: a cumulative ladder or separate modules a buyer picks from?
- "Department" or "team" in the interface? Scores are per team; buyers may say department. The home screen heading is "Your Department Health".
