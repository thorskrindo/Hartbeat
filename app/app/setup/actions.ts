"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function createOrganization(_: unknown, form: FormData): Promise<{ message: string } | null> {
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return { message: "Give the company a name." };
  const sb = await supabaseServer();
  const { data: org, error } = await sb.rpc("create_organization", { p_name: name });
  if (error || !org) return { message: "We could not create the company. Try again." };
  if (form.get("sample") === "on") await sb.rpc("load_demo_data", { p_org: org });
  redirect("/app");
}
