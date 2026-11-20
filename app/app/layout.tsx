// Everything under /app depends on who is signed in and on this week's data.
export const dynamic = "force-dynamic";
export default function AppLayout({ children }: { children: React.ReactNode }) { return children; }
