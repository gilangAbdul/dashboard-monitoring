"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { statusColor } from "@/lib/utils";

const AXIS = { fontSize: 12, fill: "#64748b" };

export function PegawaiBar({
  data,
  target,
}: {
  data: { nama: string; dicek: number; capaian: number }[];
  target: number;
}) {
  const height = Math.max(240, data.length * 26 + 60);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 28, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tick={AXIS} domain={[0, (max: number) => Math.max(max, target)]} />
        <YAxis type="category" dataKey="nama" width={150} tick={AXIS} interval={0} />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          formatter={(v) => [`${v} assignment`, "Dicek"]}
        />
        <ReferenceLine x={target} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Target", fill: "#64748b", fontSize: 11, position: "top" }} />
        <Bar dataKey="dicek" radius={[0, 6, 6, 0]} barSize={14}>
          {data.map((d) => (
            <Cell key={d.nama} fill={statusColor(d.capaian)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function KategoriDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [Number(v).toLocaleString("id-ID"), String(n)]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">{total.toLocaleString("id-ID")}</span>
          <span className="text-xs text-slate-500">assignment</span>
        </div>
      </div>
      <ul className="mt-2 space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-medium text-slate-900">
              {d.value.toLocaleString("id-ID")}
              <span className="ml-1 font-normal text-slate-400">
                ({total ? Math.round((d.value / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrenLine({ data }: { data: { tanggal: string; label: string; jumlah: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} />
        <Tooltip formatter={(v) => [`${v} assignment`, "Dicek"]} />
        <Line type="monotone" dataKey="jumlah" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}