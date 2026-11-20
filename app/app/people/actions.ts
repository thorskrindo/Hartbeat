"use server";
import { revalidatePath } from "next/cache";
import { guessKind, type ImportRow } from "@/lib/csv";
import { getCtx } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";

export async function importPeople(rows: ImportRow[]): Promise<{ ok: boolean; message: string }> {
  const ctx = await getCtx();
  if (ctx.role === "manager") return { ok: false, message: "Only HR and admins can import people." };
  const clean = rows.filter((r) => r.fullName && r.fullName.length <= 120).slice(0, 5000);
  if (!clean.length) return { ok: false, message: "No people found in the file. Check that it has a name column." };
  if (ctx.demo) return { ok: true, message: `Read ${clean.length} people in ${new Set(clean.map((r) => r.team).filter(Boolean)).size} teams. In the demo nothing is saved.` };

  const sb = await supabaseServer();
  const teamNames = [...new Set(clean.map((r) => r.team).filter((t): t is string => !!t))];
  if (teamNames.length) {
    const { error } = await sb.from("teams").upsert(teamNames.map((name) => ({ org_id: ctx.org.id, name, kind: guessKind(name) })),
      { onConflict: "org_id,name", ignoreDuplicates: true });
    if (error) return { ok: false, message: "We could not create the teams." };
  }
  const { data: teams } = await sb.from("teams").select("id, name").eq("org_id", ctx.org.id);
  const byName = new Map((teams ?? []).map((t) => [t.name, t.id]));
  const people = clean.map((r) => ({ org_id: ctx.org.id, full_name: r.fullName, email: r.email, role_title: r.roleTitle,
    team_id: r.team ? byName.get(r.team) ?? null : null, start_date: r.startDate, location: r.location }));
  const withEmail = people.filter((p) => p.email), without = people.filter((p) => !p.email);
  const a = withEmail.length ? await sb.from("people").upsert(withEmail, { onConflict: "org_id,email" }) : { error: null };
  const b = without.length ? await sb.from("people").insert(without) : { error: null };
  if (a.error || b.error) return { ok: false, message: "Some people could not be saved. Check the file and try again." };
  revalidatePath("/app", "layout");
  return { ok: true, message: `Imported ${people.length} people into ${teamNames.length} teams.` };
}
