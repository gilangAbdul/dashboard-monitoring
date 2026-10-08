// Warna status capaian: merah < 50%, kuning 50-99%, hijau >= 100%
export function statusColor(capaian: number): string {
  if (capaian >= 1) return "#14b8a6";
  if (capaian >= 0.5) return "#f59e0b";
  return "#ef4444";
}

// Tanggal hari ini (YYYY-MM-DD) menurut WIB
export function todayWIB(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
}

// Serial tanggal Google Sheets (hari sejak 1899-12-30) -> YYYY-MM-DD
export function serialToISO(serial: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

// Terima angka serial, "2026-10-08", "08/10/2026", dll -> YYYY-MM-DD ("" jika gagal)
export function toISODate(v: unknown): string {
  if (typeof v === "number") return serialToISO(v);
  if (typeof v !== "string" || !v.trim()) return "";
  const s = v.trim();
  if (/^\d+(\.\d+)?$/.test(s)) return serialToISO(Number(s));
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

export function fmtTanggal(iso: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function fmtNum(n: number): string {
  return n.toLocaleString("id-ID");
}

export function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

// "Gilang Abdul Jabbar, S.Tr.Stat." -> "Gilang Abdul Jabbar"
export function shortName(nama: string, max = 24): string {
  const base = nama.split(",")[0].trim();
  return base.length > max ? base.slice(0, max - 1) + "…" : base;
}
