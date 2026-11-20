import type { Status } from "@/lib/types";

/** Twelve weeks of health with Thriving, Steady and At risk zones behind the line. */
export function TrendChart({ values, weeks }: { values: (number | null)[]; weeks: string[]; status?: Status | null }) {
  const W = 640, H = 240, L = 44, R = 624, T = 20, B = 200;
  const y = (v: number) => T + (90 - Math.max(30, Math.min(90, v))) / 60 * (B - T);
  const pts = values.map((v, i) => (v == null ? null : [L + (i / Math.max(1, values.length - 1)) * (R - L), y(v)] as [number, number]));
  const real = pts.filter((p): p is [number, number] => !!p);
  let d = "";
  real.forEach((p, i) => {
    if (!i) { d = `M${p[0]} ${p[1]}`; return; }
    const p0 = real[i - 2] ?? real[i - 1], p1 = real[i - 1], p3 = real[i + 1] ?? p;
    const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6], c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  });
  const last = real[real.length - 1];
  const label = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weekly health score for the last twelve weeks" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="hz" gradientUnits="userSpaceOnUse" x1="0" y1={T} x2="0" y2={B}>
          <stop offset="0" stopColor="#18A874" /><stop offset=".25" stopColor="#2FBF85" /><stop offset=".3" stopColor="#3280FD" />
          <stop offset=".5" stopColor="#3280FD" /><stop offset=".6" stopColor="#F0A020" /><stop offset="1" stopColor="#E5484D" />
        </linearGradient>
      </defs>
      <rect x={L} y={T} width={R - L} height={y(75) - T} fill="#1EA97C" fillOpacity=".07" />
      <rect x={L} y={y(75)} width={R - L} height={y(60) - y(75)} fill="#3280FD" fillOpacity=".05" />
      <rect x={L} y={y(60)} width={R - L} height={y(45) - y(60)} fill="#F0A020" fillOpacity=".08" />
      <rect x={L} y={y(45)} width={R - L} height={B - y(45)} fill="#E5484D" fillOpacity=".06" />
      <g fontFamily="Calibri, Carlito, sans-serif" fontSize="12" fontWeight="700" letterSpacing=".8">
        <text x={R - 10} y={T + 16} textAnchor="end" fill="#1E7A4F">THRIVING</text>
        <text x={R - 10} y={y(75) + 16} textAnchor="end" fill="#1F5FD0">STEADY</text>
        <text x={R - 10} y={y(60) + 16} textAnchor="end" fill="#9A520A">AT RISK</text>
        <text x={R - 10} y={y(45) + 16} textAnchor="end" fill="#B3272D">STRUGGLING</text>
      </g>
      <g fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="12" fill="#8A8B93">
        {[90, 75, 60, 45, 30].map((v) => <text key={v} x={12} y={y(v) + 4}>{v}</text>)}
        {weeks.map((w, i) => (i % 2 === 0 || i === weeks.length - 1) && (
          <text key={w} x={L + (i / Math.max(1, weeks.length - 1)) * (R - L)} y={B + 22} textAnchor={i === weeks.length - 1 ? "end" : i === 0 ? "start" : "middle"}>{label(w)}</text>
        ))}
      </g>
      <line x1={L} y1={B} x2={R} y2={B} stroke="#DAD7D0" />
      {d && <path d={d} fill="none" stroke="url(#hz)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
      {last && <><circle cx={last[0]} cy={last[1]} r="13" fill="#3280FD" fillOpacity=".12" /><circle cx={last[0]} cy={last[1]} r="6.5" fill="#fff" stroke="#3280FD" strokeWidth="3" /></>}
    </svg>
  );
}
