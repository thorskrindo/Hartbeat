import { Wordmark } from "@/components/ui";
import { IS_DEMO } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";
import { PulseForm } from "./PulseForm";

export const metadata = { title: "Pulse · Hartbeat", robots: { index: false } };

export default async function Pulse({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const demo = IS_DEMO || token === "demo";
  let org = "Nordlys AS", valid = true, used = false;
  if (!demo) {
    const ok = /^[0-9a-f-]{36}$/i.test(token);
    const { data } = ok ? await (await supabaseServer()).rpc("pulse_invite_status", { p_token: token }) : { data: null };
    const row = (data as { valid: boolean; used: boolean; org_name: string }[] | null)?.[0];
    valid = !!row; used = !!row?.used; org = row?.org_name ?? "";
  }
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px 16px" }}>
      <div className="card stack" style={{ width: "min(440px, 100%)", gap: 20, padding: 28 }}>
        <div className="row between"><Wordmark size={22} /><span className="note">{org}</span></div>
        {!valid ? <p className="msg err">This pulse link is not valid.</p>
          : used ? <p className="msg ok">You already answered this pulse. Thank you.</p>
          : <PulseForm token={token} demo={demo} />}
      </div>
    </main>
  );
}
