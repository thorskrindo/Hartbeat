"use client";
import { useState, useTransition } from "react";
import { parseCsv, toPeople, type ImportRow } from "@/lib/csv";
import { importPeople } from "./actions";

export function Importer() {
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="card stack" style={{ gap: 16 }}>
      <h2 style={{ fontSize: 24 }}>Import from your HR system.</h2>
      <p className="note" style={{ margin: 0 }}>Export people as a CSV file from Workday, BambooHR, HiBob, Personio or a spreadsheet. Hartbeat reads name, email, team, role, start date and location, and creates the teams.</p>
      <label className="btn ghost" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
        Choose a CSV file
        <input type="file" accept=".csv,text/csv" style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
          onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setMsg(null); setRows(toPeople(parseCsv(await f.text()))); }} />
      </label>
      {rows && (
        <>
          <p style={{ margin: 0 }}>Found <b className="num">{rows.length}</b> people in <b className="num">{new Set(rows.map((r) => r.team).filter(Boolean)).size}</b> teams. First rows:</p>
          <div className="scroll"><table><thead><tr><th>Name</th><th>Team</th><th>Role</th><th>Start</th></tr></thead><tbody>
            {rows.slice(0, 5).map((r, i) => <tr key={i}><td>{r.fullName}</td><td>{r.team ?? "–"}</td><td>{r.roleTitle ?? "–"}</td><td className="num">{r.startDate ?? "–"}</td></tr>)}
          </tbody></table></div>
          <button className="btn" disabled={pending} style={{ alignSelf: "flex-start" }}
            onClick={() => start(async () => setMsg(await importPeople(rows)))}>{pending ? "Importing…" : `Import ${rows.length} people`}</button>
        </>
      )}
      {msg && <p className={`msg ${msg.ok ? "ok" : "err"}`} role="status">{msg.message}</p>}
    </div>
  );
}
