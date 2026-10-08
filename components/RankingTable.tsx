"use client";

import { useMemo, useState } from "react";
import { statusColor } from "@/lib/utils";

export type Row = {
  nama: string;
  dicek: number;
  poin: number;
  capaian: number;
  hariIni: number;
  rt: number;
};

export default function RankingTable({ rows, target }: { rows: Row[]; target: number }) {
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
      <div className="max-h-[520px] overflow-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Pegawai</th>
              <th className="px-3 py-2.5 text-right">Dicek</th>
              <th className="px-3 py-2.5 w-44">Capaian</th>
              <th className="px-3 py-2.5 text-right">Poin</th>
              <th className="px-3 py-2.5 text-right">Hari ini</th>
              <th className="px-3 py-2.5 text-right">RT/SLS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((r) => (
              <tr key={r.nama} className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-400">{r.rank}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">{r.nama}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {r.dicek}
                  <span className="text-slate-400">/{target}</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
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
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{r.poin}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{r.hariIni}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{r.rt}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
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
