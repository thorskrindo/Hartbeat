import { Shell } from "@/components/Shell";
import { getCtx, getPeople, getTeams } from "@/lib/data";
import { Importer } from "./Importer";

export const metadata = { title: "People · Hartbeat" };

function tenure(start: string | null) {
  if (!start) return "–";
  const m = Math.max(0, Math.round((Date.now() - Date.parse(start)) / (30.44 * 864e5)));
  const y = Math.floor(m / 12), r = m % 12;
  return [y ? `${y} yr` : "", r ? `${r} mo` : ""].filter(Boolean).join(" ") || "New";
}

export default async function People() {
  const ctx = await getCtx();
  const [people, teams] = await Promise.all([getPeople(ctx), getTeams(ctx)]);
  const teamName = new Map(teams.map((t) => [t.id, t.name]));
  return (
    <Shell ctx={ctx} here="/app/people">
      <div className="stack" style={{ gap: 24 }}>
        <h1 className="title rise">Your people, in <em>one place</em>.</h1>
        {ctx.role !== "manager" && <Importer />}
        <div className="card stack" style={{ gap: 10 }}>
          <div className="row between"><h2 style={{ fontSize: 22 }}>Everyone</h2><span className="note"><span className="num">{people.length}</span> people</span></div>
          <div className="scroll"><table><thead><tr><th>Name</th><th>Team</th><th>Role</th><th>Tenure</th><th>Location</th></tr></thead><tbody>
            {people.map((p) => <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.fullName}</td><td>{p.teamId ? teamName.get(p.teamId) ?? "–" : "–"}</td><td>{p.roleTitle ?? "–"}</td><td className="num">{tenure(p.startDate)}</td><td>{p.location ?? "–"}</td></tr>)}
          </tbody></table></div>
          <p className="note" style={{ margin: 0 }}>People are never scored. Health is only shown for teams of five or more.</p>
        </div>
      </div>
    </Shell>
  );
}
