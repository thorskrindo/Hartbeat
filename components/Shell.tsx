import Link from "next/link";
import type { Ctx } from "@/lib/data";
import { Wordmark } from "./ui";

const LINKS = [
  { href: "/app", label: "Department health" },
  { href: "/app/wellbeing", label: "Wellbeing" },
  { href: "/app/people", label: "People" },
  { href: "/pulse/demo", label: "Employee pulse" }
];

export function Shell({ ctx, here, children }: { ctx: Ctx; here: string; children: React.ReactNode }) {
  return (
    <>
      <header className="wrap top">
        <div className="bar">
          <div className="row" style={{ gap: 18 }}>
            <Link href="/app" aria-label="Hartbeat home" style={{ textDecoration: "none" }}><Wordmark size={24} /></Link>
            <nav className="nav" aria-label="Main">
              {LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={here === l.href ? "page" : undefined}>{l.label}</Link>)}
            </nav>
          </div>
          <div className="who">
            <span>{ctx.org.name}</span>
            <form action="/auth/signout" method="post"><button className="btn ghost" style={{ minHeight: 40, padding: "0 16px", fontSize: 14 }}>{ctx.demo ? "Leave demo" : "Sign out"}</button></form>
          </div>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}
