# Roadmap

## Version 1: the pilot app (this repository)

- [x] Email login (magic link) with Supabase; demo mode without keys
- [x] One database wall per company (row level security on every table)
- [x] Department Health home: team cards with health score, status, likely factors, 12-week trend
- [x] Team page: trend, factors, suggested survey, wellbeing plan link
- [x] Wellbeing strategy: diagnosis, harm watch, recommended eight-week plan, library of ten initiatives, three service levels
- [x] People: import from a CSV export of any HR system
- [x] Anonymous three-question pulse by personal link, results only for teams of five or more
- [ ] Invite colleagues (HR, managers) to the organisation
- [ ] Send pulse links by email on a schedule (every fourth day)
- [ ] Import weekly signals (calendar load, sick days) by CSV until live connections exist

## Version 2: connections

- [ ] Microsoft 365 / Teams calendar load (Microsoft Graph, app registration approved by the customer's IT)
- [ ] Google Workspace calendar
- [ ] First HRIS API with a design partner (likely Workday, BambooHR or HiBob)
- [ ] Survey types switchable per team for four weeks

## Later

- Recruiting (Shortlist) and workforce planning inside the same app
- Weekly email digest for managers
- Data processing agreement template and a privacy page for pilots

## Parked, needs a decision from Thor

- Performance management (see the open questions in `PRODUCT.md`)
- Packages as a ladder or as modules
