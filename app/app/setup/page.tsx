import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui";
import { IS_DEMO } from "@/lib/env";
import { SetupForm } from "./SetupForm";

export const metadata = { title: "Set up · Hartbeat" };

export default function Setup() {
  if (IS_DEMO) redirect("/app");
  return (
    <main className="wrap" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px 16px" }}>
      <div className="stack rise" style={{ width: "min(480px, 100%)", gap: 28 }}>
        <h1 className="title" style={{ textAlign: "center" }}>Let&apos;s set up your company.</h1>
        <div className="card stack" style={{ gap: 20, padding: 28 }}>
          <Wordmark />
          <SetupForm />
          <p className="note" style={{ margin: 0 }}>You become its admin. Its data is walled off from every other company on Hartbeat.</p>
        </div>
      </div>
    </main>
  );
}
