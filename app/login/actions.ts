"use server";
import { IS_DEMO, siteUrl } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export async function sendLoginLink(_: unknown, form: FormData): Promise<{ ok: boolean; message: string }> {
  if (IS_DEMO) return { ok: false, message: "This copy runs in demo mode. Use Continue to the demo." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "That does not look like an email address." };
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${siteUrl()}/auth/callback` } });
  if (error) return { ok: false, message: "We could not send the link. Try again in a minute." };
  return { ok: true, message: `Check ${email} for your sign-in link.` };
}
