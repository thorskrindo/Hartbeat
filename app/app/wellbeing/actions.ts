"use server";
import { getCtx } from "@/lib/data";
import { INITIATIVE, TIERS } from "@/lib/library";
import { supabaseServer } from "@/lib/supabase/server";

export async function startPlan(input: { teamId: string; tier: string; items: [string, number, number][] }): Promise<{ ok: boolean; message: string }> {
  const ctx = await getCtx();
  if (!TIERS.some((t) => t.id === input.tier)) return { ok: false, message: "Unknown way of running the plan." };
  const items = input.items.filter(([id, a, b]) => INITIATIVE[id] && a >= 1 && b <= 8 && a <= b);
  if (!items.length) return { ok: false, message: "Add at least one initiative." };
  if (ctx.demo) return { ok: true, message: "Plan started. In the demo nothing is saved." };

  const sb = await supabaseServer();
  const { data: plan, error } = await sb.from("wellbeing_plans")
    .insert({ org_id: ctx.org.id, team_id: input.teamId, tier: input.tier, status: "active" })
    .select("id").single();
  if (error || !plan) return { ok: false, message: "We could not save the plan." };
  const { error: e2 } = await sb.from("plan_items").insert(items.map(([id, a, b]) => ({
    org_id: ctx.org.id, plan_id: plan.id, initiative_id: id, start_week: a, end_week: b })));
  if (e2) return { ok: false, message: "The plan was saved without its initiatives. Try again." };
  return { ok: true, message: "Plan started. The team hears what is changing on Monday." };
}
