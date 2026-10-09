"use client";

import { useMemo, useState } from "react";
import { statusColor } from "@/lib/utils";

export type Row = {
  nama: string;
  dicek: number;
  poin: number;
  capaian: number;
  poinHariIni: number; // poin yang diperoleh pada hari ini
  rt: number;
};

const TH = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function RankingTable({ rows }: { rows: Row[]; target?: number }) {
  const [q, setQ] = useState("");

  const ranked = useMemo(() => {
    const sorted = [...rows].sort((a, b) => b.poin - a.poin || b.dicek - a.dicek);
    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows]);

  const shown = ranked.filter((r) => r.nama.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari nama pegawai…"
        className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
      />

      <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[820px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-14" />
            <col />
            <col className="w-24" />
            <col className="w-56" />
            <col className="w-24" />
            <col className="w-32" />
            <col className="w-24" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_#e2e8f0]">
            <tr>
              <th className={`${TH} text-center`}>#</th>
              <th className={`${TH} text-left`}>Pegawai</th>
              <th className={`${TH} text-right`}>Dicek</th>
              <th className={`${TH} text-left`}>Capaian</th>
              <th className={`${TH} text-right`}>Poin</th>
              <th className={`${TH} text-right`}>Poin hari ini</th>
              <th className={`${TH} text-right`}>RT/SLS</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.nama} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/50">
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      r.rank === 1
                        ? "bg-amber-100 text-amber-700"
                        : r.rank === 2
                          ? "bg-slate-200 text-slate-700"
                          : r.rank === 3
                            ? "bg-orange-100 text-orange-700"
                            : "text-slate-400"
                    }`}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="truncate px-4 py-3 font-medium text-slate-800" title={r.nama}>
                  {r.nama}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{r.dicek}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, r.capaian * 100)}%`, background: statusColor(r.capaian) }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-slate-600">
                      {Math.round(r.capaian * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{r.poin}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {r.poinHariIni > 0 ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                      +{r.poinHariIni}
                    </span>
                  ) : (
                    <span className="text-slate-300">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{r.rt}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada pegawai yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}