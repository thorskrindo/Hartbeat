import Link from "next/link";
import { Wordmark } from "@/components/ui";
import { IS_DEMO } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · Hartbeat" };

export default function Login() {
  return (
    <main className="wrap" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px 16px" }}>
      <div className="stack rise" style={{ width: "min(440px, 100%)", gap: 28 }}>
        <h1 className="title" style={{ textAlign: "center" }}>Do you know how your team is <em>really doing</em>?</h1>
        <div className="card stack" style={{ gap: 20, padding: 28 }}>
          <Wordmark />
          {IS_DEMO ? (
            <>
              <p style={{ margin: 0, color: "#3F4047" }}>This copy has no database connected yet, so it shows a sample company.</p>
              <Link className="btn" href="/app">Continue to the demo</Link>
            </>
          ) : <LoginForm />}
          <p className="note" style={{ margin: 0 }}>No passwords. We email you a link that signs you in.</p>
        </div>
      </div>
    </main>
  );
}
