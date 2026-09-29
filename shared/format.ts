export const FACILITY_NAME = "BuraPesa Medical Centre";
export const CURRENCY = "KSh";

export function formatMoney(amount: number, symbol: string | null = CURRENCY): string {
  const sym = symbol ?? CURRENCY;
  const n = Number(amount) || 0;
  return `${sym} ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function displayName(name: string | null | undefined): string {
  return (name ?? "").trim() || FACILITY_NAME;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function daysUntil(dateISO: string): number {
  const ms = new Date(dateISO + "T00:00:00").getTime() - new Date(todayISO() + "T00:00:00").getTime();
  return Math.round(ms / 86400000);
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
