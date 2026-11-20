"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const QS = [
  { k: "workload", q: "How manageable was your workload these last four days?", a: ["Far too much", "A bit too much", "About right", "Comfortable", "Room for more"] },
  { k: "heard", q: "Did you feel heard by your team?", a: ["Not at all", "A little", "Somewhat", "Mostly", "Completely"] },
  { k: "energy", q: "How much energy do you have going into tomorrow?", a: ["Running on empty", "Low", "Okay", "Good", "Full"] }
] as const;

export function PulseForm({ token, demo }: { token: string; demo: boolean }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const [state, setState] = useState<"asking" | "sending" | "done" | "error">("asking");

  async function pick(v: number) {
    const next = [...ans]; next[i] = v; setAns(next);
    if (i < 2) { setTimeout(() => setI(i + 1), 220); return; }
    setState("sending");
    if (demo) { setState("done"); return; }
    const { data, error } = await supabaseBrowser().rpc("submit_pulse", { p_token: token, p_workload: next[0], p_heard: next[1], p_energy: next[2] });
    setState(error || !data ? "error" : "done");
  }

  if (state === "done") return (
    <div className="stack rise" style={{ gap: 14, alignItems: "center", textAlign: "center", padding: "40px 0" }}>
      <h1 style={{ fontSize: 38 }}>Thank you.</h1>
      <p className="note" style={{ margin: 0, maxWidth: 280 }}>That took about twenty seconds. The next pulse comes in four days.</p>
    </div>
  );
  if (state === "error") return <p className="msg err">This link has already been used or has expired.</p>;
  const cur = QS[i];
  return (
    <div className="stack rise" key={i} style={{ gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {QS.map((_, k) => <span key={k} style={{ height: 5, borderRadius: 5, background: k < i ? "#3280FD" : k === i ? "#9EC3FF" : "#E3E1DB" }} />)}
      </div>
      <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>{cur.q}</h1>
      <div className="stack" role="group" aria-label="Your answer" style={{ gap: 10 }}>
        {cur.a.map((label, k) => (
          <button key={label} onClick={() => pick(k + 1)} disabled={state === "sending"} className="row"
            style={{ flexWrap: "nowrap", minHeight: 56, padding: "0 16px", borderRadius: 18, border: "1px solid " + (ans[i] === k + 1 ? "#3280FD" : "#E6E4DE"),
              background: ans[i] === k + 1 ? "#EAF1FE" : "#fff", color: "#121316", fontSize: 17, textAlign: "left" }}>
            <span className="num" style={{ width: 30, height: 30, borderRadius: 10, display: "grid", placeItems: "center", background: "#F3F2EF", fontWeight: 700, fontSize: 14 }}>{k + 1}</span>{label}
          </button>
        ))}
      </div>
      <p className="note" style={{ margin: 0, textAlign: "center" }}>Anonymous. Your manager only sees the team&apos;s average, and only for teams of five or more.</p>
    </div>
  );
}
