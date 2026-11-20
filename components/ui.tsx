import type { Status, TeamKind } from "@/lib/types";
import { STATUS_TONE } from "@/lib/scoring";

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 700, fontSize: size, letterSpacing: "-.03em", color: "#121316", fontFamily: "Calibri, Carlito, sans-serif" }}>
      H
      <svg width={size * 0.66} height={size * 0.62} viewBox="0 0 24 22" aria-hidden="true" style={{ transform: "rotate(180deg)", margin: "0 1px" }}>
        <path className="beat" d="M12 21s-8.5-5.3-10.6-10.2C-.2 6.9 2.4 2 7 2c2.3 0 4 1.3 5 3 1-1.7 2.7-3 5-3 4.6 0 7.2 4.9 5.6 8.8C20.5 15.7 12 21 12 21z" fill="#3280FD" />
      </svg>
      rtbeat
      <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Hartbeat</span>
    </span>
  );
}

export function StatusPill({ status }: { status: Status | null }) {
  if (!status) return <span className="pill" style={{ background: "#F0EEEA", color: "#6B6C74" }}>No data yet</span>;
  const t = STATUS_TONE[status];
  return <span className="pill" style={{ color: t.fg, background: t.bg }}><i style={{ background: t.bar }} />{status}</span>;
}

/** Flat, colourful department symbols that sit straight on the card, with no badge behind them. */
export function DeptIcon({ kind, size = 34 }: { kind: TeamKind; size?: number }) {
  const s = { width: size, height: size, flex: "none" as const };
  switch (kind) {
    case "engineering": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="6" width="26" height="18" rx="4" fill="#D6E6FF"/><rect x="3" y="6" width="26" height="5" rx="2.5" fill="#86B6FF"/><path d="M12 15.5l-3 3 3 3M20 15.5l3 3-3 3" fill="none" stroke="#3280FD" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.4 14.5l-2.8 8" stroke="#1F5FD0" strokeWidth="2.4" strokeLinecap="round"/><rect x="11" y="26" width="10" height="2.6" rx="1.3" fill="#86B6FF"/></svg>);
    case "sales": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="18" width="6" height="10" rx="2" fill="#FFD48A"/><rect x="13" y="13" width="6" height="15" rx="2" fill="#FFB547"/><rect x="22" y="8" width="6" height="20" rx="2" fill="#F08A24"/><path d="M4 14.5 12 8l5 3.5L27 3.5" fill="none" stroke="#1EA97C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 3h5.5v5.5" fill="none" stroke="#1EA97C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>);
    case "cs": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><path d="M5 5h22a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H14l-6.5 5.5V23H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" fill="#9FE5C3"/><path d="M16 19.5s-5.5-3.2-5.5-6.9c0-1.8 1.4-3.1 3-3.1 1.1 0 2 .6 2.5 1.5.5-.9 1.4-1.5 2.5-1.5 1.6 0 3 1.3 3 3.1 0 3.7-5.5 6.9-5.5 6.9Z" fill="#14966A"/></svg>);
    case "design": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><path d="M8 4.5c6.5-2 15.5.5 19 7 2.6 4.8-.6 8.6-4.2 7.8-2.4-.5-3.6 1.3-2.5 3.4 1.6 3-1.2 5.7-5.3 4.8C6.5 25.6 2.4 18.8 3.4 12.6 4 9 5.5 5.3 8 4.5Z" fill="#E2D6FF"/><circle cx="10" cy="11" r="2.4" fill="#FF6B8B"/><circle cx="16" cy="8" r="2.4" fill="#FFB547"/><circle cx="22" cy="11" r="2.4" fill="#3280FD"/><circle cx="9.5" cy="18" r="2.4" fill="#1EA97C"/></svg>);
    case "marketing": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><path d="M4 13h5l12-7v20l-12-7H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" fill="#FFC2B4"/><path d="M21 6v20" stroke="#F07F6B" strokeWidth="2.6" strokeLinecap="round"/><path d="M8 19l2 7h3l-1.6-6" fill="#F07F6B"/><path d="M25 12.5c1.4 1 1.4 6 0 7" fill="none" stroke="#F07F6B" strokeWidth="2.2" strokeLinecap="round"/></svg>);
    case "comms": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="5" width="20" height="15" rx="4" fill="#C9B6FF"/><path d="M9 20v5l5-5" fill="#C9B6FF"/><rect x="11" y="12" width="18" height="13" rx="4" fill="#7C5CE6"/><circle cx="16" cy="18.5" r="1.4" fill="#fff"/><circle cx="20" cy="18.5" r="1.4" fill="#fff"/><circle cx="24" cy="18.5" r="1.4" fill="#fff"/></svg>);
    case "hr": case "ops": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><circle cx="11.5" cy="10" r="5" fill="#FF8A65"/><path d="M2.5 27c0-5.5 4-9.5 9-9.5s9 4 9 9.5Z" fill="#FFB49A"/><circle cx="22.5" cy="11.5" r="4" fill="#7C5CE6"/><path d="M16.5 27c.4-4.4 2.9-7.6 6-7.6 3.6 0 6.5 3.4 6.5 7.6Z" fill="#B9A6F5"/></svg>);
    case "finance": return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="23" rx="11" ry="4" fill="#F0A020"/><ellipse cx="16" cy="18" rx="11" ry="4" fill="#FFB547"/><ellipse cx="16" cy="13" rx="11" ry="4" fill="#FFD48A"/></svg>);
    default: return (<svg style={s} viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="12" r="6" fill="#86B6FF"/><circle cx="21" cy="12" r="6" fill="#9FE5C3"/><circle cx="16" cy="21" r="6" fill="#FFB547" opacity=".9"/></svg>);
  }
}

/** Twelve weeks as a small line. The shape says more than the number. */
export function Sparkline({ values, color, width = 120, height = 32, area = false }: { values: (number | null)[]; color: string; width?: number; height?: number; area?: boolean }) {
  const v = values.filter((x): x is number => x != null);
  if (v.length < 2) return null;
  const mn = Math.min(...v) - 3, mx = Math.max(...v) + 3;
  const pts = v.map((y, i) => [(i / (v.length - 1)) * width, height - ((y - mn) / (mx - mn)) * height]);
  const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
  const last = pts[pts.length - 1];
  const id = "g" + color.replace("#", "");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
      {area && <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".26"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>}
      {area && <path d={`${d} L${width} ${height} L0 ${height} Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={area ? 2.6 : 2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={area ? 4.5 : 3} fill="#fff" stroke={color} strokeWidth={2.4} />
    </svg>
  );
}

export function Ring({ score, color, size = 120 }: { score: number | null; color: string; size?: number }) {
  const c = 2 * Math.PI * 50, off = c * (1 - (score ?? 0) / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#EFEDE8" strokeWidth="12" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span className="num" style={{ fontSize: size * 0.32, fontWeight: 700, letterSpacing: "-.04em" }}>{score ?? "–"}</span>
      </div>
    </div>
  );
}
