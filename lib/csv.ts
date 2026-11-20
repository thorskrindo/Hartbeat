/** Small CSV reader for HR system exports: handles quotes, commas or semicolons, and a header row. */
export function parseCsv(text: string): Record<string, string>[] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  const [head, ...body] = rows;
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const PICK: Record<string, string[]> = {
  fullName: ["full name", "name", "employee name", "employee", "navn"],
  email: ["email", "work email", "e-mail", "epost"],
  team: ["team", "department", "avdeling", "org unit", "group"],
  roleTitle: ["role", "title", "job title", "position", "stilling"],
  startDate: ["start date", "hire date", "started", "startdato"],
  location: ["location", "office", "city", "sted"]
};

export interface ImportRow { fullName: string; email: string | null; team: string | null; roleTitle: string | null; startDate: string | null; location: string | null }

export function toPeople(records: Record<string, string>[]): ImportRow[] {
  const find = (r: Record<string, string>, k: keyof typeof PICK) => {
    const key = PICK[k].find((p) => r[p] != null && r[p] !== "");
    return key ? r[key] : null;
  };
  return records.map((r) => {
    const first = r["first name"] ?? r["firstname"], last = r["last name"] ?? r["lastname"];
    const date = find(r, "startDate");
    const iso = date && !isNaN(Date.parse(date)) ? new Date(date).toISOString().slice(0, 10) : null;
    return {
      fullName: find(r, "fullName") ?? [first, last].filter(Boolean).join(" "),
      email: find(r, "email")?.toLowerCase() ?? null,
      team: find(r, "team"), roleTitle: find(r, "roleTitle"), startDate: iso, location: find(r, "location")
    };
  }).filter((p) => p.fullName);
}

export function guessKind(team: string): string {
  const t = team.toLowerCase();
  if (/engineer|platform|tech|develop|it\b/.test(t)) return "engineering";
  if (/sales|salg|account/.test(t)) return "sales";
  if (/market/.test(t)) return "marketing";
  if (/customer|support|success|kunde/.test(t)) return "cs";
  if (/design|ux/.test(t)) return "design";
  if (/hr|people|personal/.test(t)) return "hr";
  if (/financ|økonomi|account/.test(t)) return "finance";
  if (/comm|kommunik|pr\b/.test(t)) return "comms";
  if (/ops|operat|drift/.test(t)) return "ops";
  return "other";
}
