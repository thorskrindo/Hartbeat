import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { TrendChart } from "@/components/TrendChart";
import { DeptIcon, Ring, StatusPill } from "@/components/ui";
import { getCtx, getHealth } from "@/lib/data";
import { SURVEYS } from "@/lib/library";
import { STATUS_TONE } from "@/lib/scoring";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getCtx();
  const h = (await getHealth(ctx)).find((x) => x.team.id === id);
  if (!h) notFound();
  const tone = h.status ? STATUS_TONE[h.status] : null;
  const weeks = Array.from({ length: h.trend.length }, (_, i) => {
    const d = new Date(); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - (h.trend.length - 1 - i) * 7);
    return d.toISOString().slice(0, 10);
  });
  const survey = h.surveyId ? SURVEYS[h.surveyId] : null;
  return (
    <Shell ctx={ctx} here="">
      <div className="stack" style={{ gap: 24 }}>
        <Link href="/app" className="note" style={{ color: "#A3ACBF", textDecoration: "none" }}>‹ All teams</Link>
        <div className="row rise" style={{ gap: 16 }}>
          <DeptIcon kind={h.team.kind} size={44} />
          <h1 className="title">{h.team.name}</h1>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "start" }}>
          <section className="card stack rise" style={{ gap: 18 }}>
            <div className="row" style={{ gap: 20 }}>
              <Ring score={h.score} color={tone?.bar ?? "#ccc"} />
              <div className="stack" style={{ gap: 8 }}>
                <StatusPill status={h.status} />
                {h.delta != null && <span className="note"><span className="num">{h.delta > 0 ? "+" : ""}{h.delta}</span> against last week</span>}
                <span className="note"><span className="num">{h.team.size}</span> people</span>
              </div>
            </div>
            <span className="label">Likely factors</span>
            {h.factors.map((f) => (
              <div className="factor" key={f.what + f.detail}>
                <i style={{ background: f.tone === "bad" ? (tone?.bar ?? "#F0A020") : f.tone === "good" ? "#1EA97C" : "#C9C7C0" }} />
                <div><b>{f.what}</b><span>{f.detail}</span></div>
              </div>
            ))}
            {h.pattern && <Link className="btn dark" href={`/app/wellbeing?team=${h.team.id}`}>Open the wellbeing plan</Link>}
          </section>
          <section className="card stack rise" style={{ gap: 10, gridColumn: "span 2" }}>
            <span className="label">Health score, last twelve weeks</span>
            <TrendChart values={h.trend} weeks={weeks} />
          </section>
        </div>
        {survey && (
          <section id="survey" className="card stack rise" style={{ gap: 16, maxWidth: 820 }}>
            <span className="label">Suggested survey</span>
            <h2 style={{ fontSize: 30 }}>{survey.name}</h2>
            <p style={{ margin: 0, color: "#3F4047" }}>{survey.what}</p>
            <div className="row" style={{ gap: 8 }}>{survey.measures.map((m) => <span key={m} className="chip" style={{ background: survey.color + "1F" }}>{m}</span>)}</div>
            <div className="stack" style={{ gap: 8, padding: 16, borderRadius: 16, background: "#FEF6EC" }}>
              <span style={{ fontWeight: 700, color: "#9A520A", fontSize: 14 }}>Recommended when these show up together</span>
              {survey.when.map((w) => <span key={w} style={{ fontSize: 15 }}>· {w}</span>)}
            </div>
            <span className="label">Three questions it adds to the pulse for four weeks</span>
            {survey.questions.map((q) => <div key={q} style={{ padding: "12px 14px", borderRadius: 14, background: "#F6F5F2" }}>{q}</div>)}
            <span className="note">Based on {survey.basis}</span>
          </section>
        )}
      </div>
    </Shell>
  );
}
