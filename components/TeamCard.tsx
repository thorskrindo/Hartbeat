import Link from "next/link";
import { SURVEYS } from "@/lib/library";
import { STATUS_TONE } from "@/lib/scoring";
import type { TeamHealth } from "@/lib/types";
import { DeptIcon, Sparkline, StatusPill } from "./ui";

export function TeamCard({ h, i = 0 }: { h: TeamHealth; i?: number }) {
  const tone = h.status ? STATUS_TONE[h.status] : null;
  return (
    <article className="card stack rise" style={{ animationDelay: `${i * 70}ms`, gap: 16,
      background: tone ? `linear-gradient(180deg, ${tone.bg} 0%, #fff 42%)` : "#fff" }}>
      <Link href={`/app/teams/${h.team.id}`} className="team-card" style={{ color: "inherit" }}>
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div className="row" style={{ gap: 12, flexWrap: "nowrap" }}>
            <DeptIcon kind={h.team.kind} />
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.2 }}>{h.team.name}</h2>
              <span className="note"><span className="num">{h.team.size}</span> people</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="score" style={{ color: tone?.fg ?? "#6B6C74" }}>{h.score ?? "–"}</div>
            {h.delta != null && <span className="note num">{h.delta > 0 ? "+" : ""}{h.delta} this week</span>}
          </div>
        </div>
        <div className="row between">
          <StatusPill status={h.status} />
          {tone && <Sparkline values={h.trend} color={tone.bar} width={130} height={30} />}
        </div>
        <span className="track"><span style={{ width: `${h.score ?? 0}%`, background: tone?.bar ?? "#ccc" }} /></span>
        <div className="stack" style={{ gap: 10 }}>
          <span className="label">Likely factors</span>
          {h.factors.length ? h.factors.map((f) => (
            <div className="factor" key={f.what + f.detail}>
              <i style={{ background: f.tone === "bad" ? (tone?.bar ?? "#F0A020") : f.tone === "good" ? "#1EA97C" : "#C9C7C0" }} />
              <div><b>{f.what}</b><span>{f.detail}</span></div>
            </div>
          )) : <span className="note">Not enough data yet. Import signals or run a pulse.</span>}
        </div>
      </Link>
      {h.surveyId && (
        <Link className="link-row" href={`/app/teams/${h.team.id}#survey`} style={{ background: tone?.bg, color: tone?.fg, border: `1px solid ${tone?.bar}40` }}>
          <span>Suggested survey: <b>{SURVEYS[h.surveyId].name}</b></span><span aria-hidden="true">›</span>
        </Link>
      )}
      {h.pattern && (
        <Link className="link-row" href={`/app/wellbeing?team=${h.team.id}`} style={{ background: "#121316", color: "#fff" }}>
          <span>Open the wellbeing plan</span><span aria-hidden="true">›</span>
        </Link>
      )}
    </article>
  );
}
