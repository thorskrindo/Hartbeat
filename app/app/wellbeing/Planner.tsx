"use client";
import { useMemo, useState, useTransition } from "react";
import { INITIATIVE, INITIATIVES, PATHWAYS, PATTERNS, TIERS, type Initiative, type TierId } from "@/lib/library";
import type { PathwayId, PatternId, TeamHealth } from "@/lib/types";
import { DeptIcon, StatusPill } from "@/components/ui";
import { startPlan } from "./actions";

type Row = [string, number, number];
const STRENGTH = { survey: ["Survey evidence", "#1E7A4F", "#E2F3E9"], early: ["Early evidence", "#8A4A06", "#FDF0E0"] } as const;

export function Planner({ teams, initial }: { teams: TeamHealth[]; initial: string | null }) {
  const [teamId, setTeamId] = useState(initial && teams.some((t) => t.team.id === initial) ? initial : teams[0]?.team.id);
  const [tier, setTier] = useState<TierId>("guided");
  const [plans, setPlans] = useState<Record<string, Row[]>>({});
  const [open, setOpen] = useState<Initiative | null>(null);
  const [filter, setFilter] = useState<PathwayId | "all">("all");
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  const h = teams.find((t) => t.team.id === teamId);
  const pattern = PATTERNS[(h?.pattern ?? "overload") as PatternId];
  const rows = (teamId && plans[teamId]) || pattern.plan;
  const inPlan = useMemo(() => new Set(rows.map((r) => r[0])), [rows]);
  const setRows = (r: Row[]) => teamId && setPlans({ ...plans, [teamId]: r });
  const toggle = (id: string) => setRows(inPlan.has(id) ? rows.filter((r) => r[0] !== id) : [...rows, [id, 2, 8]]);

  if (!h) return <div className="card"><p style={{ margin: 0 }}>No team needs a wellbeing plan right now.</p></div>;

  return (
    <div className="stack" style={{ gap: 40 }}>
      <div className="row" role="group" aria-label="Team" style={{ gap: 8 }}>
        {teams.map((t) => (
          <button key={t.team.id} onClick={() => setTeamId(t.team.id)} aria-pressed={t.team.id === teamId}
            className="row" style={{ gap: 8, minHeight: 44, padding: "0 14px", borderRadius: 999, border: "1px solid " + (t.team.id === teamId ? "#fff" : "rgba(255,255,255,.2)"),
              background: t.team.id === teamId ? "#fff" : "transparent", color: t.team.id === teamId ? "#121316" : "#DCE2EE", fontSize: 15, flexWrap: "nowrap" }}>
            <DeptIcon kind={t.team.kind} size={22} />{t.team.name}
          </button>
        ))}
      </div>

      <section className="stack rise" key={teamId} style={{ gap: 16 }}>
        <div className="row"><StatusPill status={h.status} /><span className="note" style={{ color: "#A3ACBF" }}>Wellbeing strategy for {h.team.name}</span></div>
        <h1 className="title">{pattern.headline}</h1>
        <div className="row" style={{ gap: 10 }}>
          {h.factors.filter((f) => f.tone === "bad").map((f) => (
            <span key={f.what + f.detail} className="chip" style={{ background: "#fff", color: "#121316" }}>
              <i style={{ width: 8, height: 8, borderRadius: "50%", background: "#F0A020", marginRight: 8 }} />{f.what}
            </span>
          ))}
          <span aria-hidden="true" style={{ color: "#A3ACBF" }}>→</span>
          {pattern.paths.map((p) => <span key={p} className="chip" style={{ background: PATHWAYS[p].bg, color: PATHWAYS[p].fg, fontWeight: 700 }}>{PATHWAYS[p].label}</span>)}
        </div>
        <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap", gap: 12, padding: "14px 16px", borderRadius: 16, background: "#FDF0E0", color: "#5C3A0B", maxWidth: 820 }}>
          <span aria-hidden="true" style={{ fontWeight: 700 }}>!</span>
          <span><b>Harm watch: {pattern.harm}.</b> {pattern.harmNote}</span>
        </div>
      </section>

      <section className="stack" style={{ gap: 16 }}>
        <div className="row between">
          <h2 style={{ fontSize: 28 }}>The plan for the next eight weeks.</h2>
          <div className="seg" role="group" aria-label="How the plan is run">
            {TIERS.map((t) => <button key={t.id} aria-pressed={tier === t.id} onClick={() => setTier(t.id)}>{t.name}</button>)}
          </div>
        </div>
        <p className="sub" style={{ margin: 0 }}>{TIERS.find((t) => t.id === tier)!.note}</p>
        <div className="grid">
          {rows.map(([id, a, b]) => {
            const it = INITIATIVE[id], P = PATHWAYS[it.path];
            return (
              <article key={id} className="card stack rise" style={{ gap: 12, background: `linear-gradient(180deg, ${P.bg} 0%, #fff 50%)` }}>
                <div className="row between">
                  <span className="chip num" style={{ background: P.bg, color: P.fg, fontWeight: 700 }}>Week {a}{b > a ? `–${b}` : ""}</span>
                  <span className="chip" style={{ background: STRENGTH[it.strength][2], color: STRENGTH[it.strength][1], fontSize: 13 }}>{STRENGTH[it.strength][0]}</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700 }}>{it.name}</h3>
                <p style={{ margin: 0, color: "#3F4047" }}>{it.short}</p>
                <div className="row" style={{ gap: 6, fontSize: 13, color: "#55565E" }}>
                  {it.chain.map((c, k) => <span key={c} className="row" style={{ gap: 6 }}>{k > 0 && <span aria-hidden="true">→</span>}<span className="chip" style={{ background: "#fff", border: `1px solid ${P.color}55`, fontSize: 13 }}>{c}</span></span>)}
                </div>
                <button onClick={() => setOpen(it)} style={{ alignSelf: "flex-start", minHeight: 40, border: 0, background: "none", color: "#1F5FD0", fontWeight: 700, padding: 0 }}>See the evidence</button>
              </article>
            );
          })}
        </div>
        <div className="card stack" style={{ gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0,1fr))", gap: 6 }} className="num">
            {Array.from({ length: 8 }, (_, k) => <span key={k} style={{ fontSize: 12, fontWeight: k === 3 || k === 7 ? 700 : 400, color: k === 3 || k === 7 ? "#121316" : "#8A8B93" }}>W{k + 1}</span>)}
          </div>
          {rows.map(([id, a, b]) => {
            const it = INITIATIVE[id], P = PATHWAYS[it.path];
            return (
              <div key={id} style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0,1fr))", gap: 6 }}>
                <span style={{ gridColumn: `${a} / ${b + 1}`, padding: "7px 12px", borderRadius: 10, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: P.bg, color: P.fg, border: `1px solid ${P.color}55` }}>{it.name}</span>
              </div>
            );
          })}
          <span className="note">Measured before, at week 4 and at week 8, with the pulse and the team&apos;s signals.</span>
        </div>
        <div className="row">
          <button className="btn" disabled={pending} onClick={() => start(async () => {
            const r = await startPlan({ teamId: h.team.id, tier, items: rows });
            setMsg({ ...msg, [h.team.id]: r.message });
          })}>{pending ? "Starting…" : msg[h.team.id] ? "Plan started ✓" : "Start the plan on Monday"}</button>
          {msg[h.team.id] && <span className="note" style={{ color: "#A3ACBF" }} role="status">{msg[h.team.id]}</span>}
        </div>
      </section>

      <section className="stack" style={{ gap: 16 }}>
        <div className="row between">
          <h2 style={{ fontSize: 28 }}>Every initiative, by what it fixes.</h2>
          <div className="seg" role="group" aria-label="Filter">
            <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
            {(Object.keys(PATHWAYS) as PathwayId[]).map((p) => <button key={p} aria-pressed={filter === p} onClick={() => setFilter(p)}>{PATHWAYS[p].label}</button>)}
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {INITIATIVES.filter((i) => filter === "all" || i.path === filter).map((it) => {
            const P = PATHWAYS[it.path];
            return (
              <button key={it.id} onClick={() => setOpen(it)} className="card stack" style={{ gap: 8, textAlign: "left", border: inPlan.has(it.id) ? `1.5px solid ${P.color}` : undefined }}>
                <span className="chip" style={{ alignSelf: "flex-start", background: P.bg, color: P.fg, fontSize: 13, fontWeight: 700 }}>{P.label}</span>
                <b style={{ fontSize: 18 }}>{it.name}</b>
                <span className="note">{it.short}</span>
                {inPlan.has(it.id) && <span style={{ fontSize: 13, fontWeight: 700, color: "#1E7A4F" }}>In the plan</span>}
              </button>
            );
          })}
        </div>
        <p className="note" style={{ color: "#A3ACBF", maxWidth: 820, margin: 0 }}>Built on Qamar, Afshan and Rana (2024), a review of 134 studies on sustainable HR and wellbeing. Most are one-time surveys, so they show links, not proof of cause. That is why every plan is measured before and after.</p>
      </section>

      {open && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="sheet stack" role="dialog" aria-modal="true" aria-label={open.name} style={{ gap: 18 }}>
            <span aria-hidden="true" style={{ alignSelf: "center", width: 40, height: 5, borderRadius: 5, background: "#E3E1DB" }} />
            <div className="row between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
              <div className="stack" style={{ gap: 6 }}>
                <span className="chip" style={{ alignSelf: "flex-start", background: PATHWAYS[open.path].bg, color: PATHWAYS[open.path].fg, fontWeight: 700, fontSize: 13 }}>{PATHWAYS[open.path].label}</span>
                <h2 style={{ fontSize: 34, lineHeight: 1.05 }}>{open.name}</h2>
                <p style={{ margin: 0, color: "#3F4047" }}>{open.what}</p>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" style={{ flex: "none", width: 44, height: 44, border: 0, borderRadius: "50%", background: "#F3F2EF", fontSize: 18 }}>×</button>
            </div>
            <div className="stack" style={{ gap: 10, padding: 16, borderRadius: 18, background: "#F6F8FD" }}>
              <span style={{ fontWeight: 700, color: "#1F5FD0", fontSize: 14 }}>Why it works</span>
              <div className="row" style={{ gap: 6, fontSize: 14 }}>{open.chain.map((c, k) => <span key={c}>{k > 0 && "→ "}{c}</span>)}</div>
              <span>{open.why}</span>
            </div>
            <span className="label">How Hartbeat runs it</span>
            {open.steps.map((s) => <span key={s}>· {s}</span>)}
            <span className="label">What we track</span>
            <div className="row" style={{ gap: 6 }}>{open.track.map((t) => <span key={t} className="chip" style={{ background: "#F3F2EF" }}>{t}</span>)}</div>
            <div className="stack" style={{ gap: 6, paddingTop: 14, borderTop: "1px solid #F0EEEA" }}>
              <div className="row"><span className="label">Evidence</span><span className="chip" style={{ background: STRENGTH[open.strength][2], color: STRENGTH[open.strength][1], fontSize: 13 }}>{STRENGTH[open.strength][0]}</span></div>
              <span className="note">{open.evidence}</span>
            </div>
            <button className={inPlan.has(open.id) ? "btn ghost" : "btn"} style={{ alignSelf: "flex-start" }} onClick={() => toggle(open.id)}>
              {inPlan.has(open.id) ? "Remove from plan" : "Add to plan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
