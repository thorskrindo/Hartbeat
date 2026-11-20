"use client";
import { useActionState } from "react";
import { sendLoginLink } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(sendLoginLink, null);
  return (
    <form action={action} className="stack">
      <label className="field">Work email
        <input className="input" type="email" name="email" required autoComplete="email" placeholder="you@company.com" />
      </label>
      <button className="btn" type="submit" disabled={pending}>{pending ? "Sending…" : "Send me a sign-in link"}</button>
      {state && <p className={`msg ${state.ok ? "ok" : "err"}`} role="status">{state.message}</p>}
    </form>
  );
}
