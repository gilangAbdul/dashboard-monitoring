type Props = {
  label: string;
  value: string;
  sub?: string;
  accent?: string; // warna hex untuk strip di kiri atas
  progress?: number; // 0..1, opsional
};

export default function KpiCard({ label, value, sub, accent = "#2563eb", progress }: Props) {
  return (
    <div className="card relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {progress !== undefined && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, background: accent }}
          />
        </div>
      )}
      {sub && <p className="mt-2 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}
