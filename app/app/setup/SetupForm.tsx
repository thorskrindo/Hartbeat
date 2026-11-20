"use client";
import { useActionState } from "react";
import { createOrganization } from "./actions";

export function SetupForm() {
  const [state, action, pending] = useActionState(createOrganization, null);
  return (
    <form action={action} className="stack">
      <label className="field">Company name
        <input className="input" name="name" required maxLength={120} placeholder="e.g. Nordlys AS" />
      </label>
      <label className="row" style={{ fontSize: 15, color: "#3F4047" }}>
        <input type="checkbox" name="sample" style={{ width: 20, height: 20 }} /> Fill it with sample teams so I can look around first
      </label>
      <button className="btn" disabled={pending}>{pending ? "Creating…" : "Create my company"}</button>
      {state && <p className="msg err" role="alert">{state.message}</p>}
    </form>
  );
}
