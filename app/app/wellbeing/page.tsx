import { Shell } from "@/components/Shell";
import { getCtx, getHealth } from "@/lib/data";
import { Planner } from "./Planner";

export const metadata = { title: "Wellbeing · Hartbeat" };

export default async function Wellbeing({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
  const { team } = await searchParams;
  const ctx = await getCtx();
  const health = await getHealth(ctx);
  const needing = health.filter((h) => h.pattern);
  return (
    <Shell ctx={ctx} here="/app/wellbeing">
      {needing.length ? <Planner teams={needing} initial={team ?? null} /> : (
        <div className="stack" style={{ gap: 12 }}>
          <h1 className="title">No team needs a wellbeing plan <em>right now</em>.</h1>
          <p className="sub">Plans appear here when a team turns at risk or struggling.</p>
        </div>
      )}
    </Shell>
  );
}
