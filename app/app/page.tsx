import { Shell } from "@/components/Shell";
import { TeamCard } from "@/components/TeamCard";
import { getCtx, getHealth } from "@/lib/data";

export const metadata = { title: "Department health · Hartbeat" };

export default async function DepartmentHealth() {
  const ctx = await getCtx();
  const health = await getHealth(ctx);
  const needs = health.filter((h) => h.status === "At risk" || h.status === "Struggling").length;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <Shell ctx={ctx} here="/app">
      <div className="stack" style={{ gap: 28 }}>
        <div className="rise">
          <p className="sub" style={{ margin: "0 0 8px" }}>{today}</p>
          <h1 className="title">{needs === 0 ? <>Every team is doing <em>well</em> this week.</> : <><span className="num">{needs}</span> {needs === 1 ? "team needs" : "teams need"} you <em>this week</em>.</>}</h1>
        </div>
        <div className="banner rise">
          <span><b>Pulse</b> · three questions every fourth day</span>
          <span>About 91 short pulses a year, instead of one long survey</span>
        </div>
        {health.length ? (
          <div className="grid">{health.map((h, i) => <TeamCard key={h.team.id} h={h} i={i} />)}</div>
        ) : (
          <div className="card stack" style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 24 }}>No teams yet.</h2>
            <p className="note" style={{ margin: 0 }}>Import your people from an HR system export and Hartbeat builds the teams for you.</p>
            <a className="btn" href="/app/people" style={{ alignSelf: "flex-start" }}>Import people</a>
          </div>
        )}
      </div>
    </Shell>
  );
}
