import { getRawData, TARGET } from "@/lib/sheets";
import { KATEGORI, type Rec } from "@/lib/types";
import { fmtNum, fmtPct, fmtTanggal, fmtTanggalLengkap, shortName, statusColor, todayWIB } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";
import RankingTable, { type Row } from "@/components/RankingTable";
import { KategoriDonut, PegawaiBar, TrenLine } from "@/components/Charts";

// Halaman dirender per permintaan (karena ada filter); pembacaan Google Sheets
// di-cache 30 detik di lib/sheets.ts supaya kuota API aman.
export const dynamic = "force-dynamic";

type SP = { kec?: string; kel?: string; dari?: string; sampai?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const raw = await getRawData();
  const today = todayWIB();

  // Opsi filter dari seluruh data
  const kecOptions = [...new Set(raw.records.map((r) => r.kecamatan).filter(Boolean))].sort();
  const kelOptions = [
    ...new Set(
      raw.records
        .filter((r) => !sp.kec || r.kecamatan === sp.kec)
        .map((r) => r.kelurahan)
        .filter(Boolean),
    ),
  ].sort();

  const records: Rec[] = raw.records.filter(
    (r) =>
      (!sp.kec || r.kecamatan === sp.kec) &&
      (!sp.kel || r.kelurahan === sp.kel) &&
      (!sp.dari || r.tanggal >= sp.dari) &&
      (!sp.sampai || r.tanggal <= sp.sampai),
  );

  // Rekap per pegawai (semua nama dari tab Rekap tetap tampil, walau belum input)
  const map = new Map<string, { dicek: number; poin: number; poinHariIni: number; rt: Set<string> }>();
  for (const n of raw.names) map.set(n, { dicek: 0, poin: 0, poinHariIni: 0, rt: new Set() });
  for (const r of records) {
    const m = map.get(r.pegawai) ?? { dicek: 0, poin: 0, poinHariIni: 0, rt: new Set<string>() };
    m.dicek += 1;
    m.poin += r.poin;
    if (r.tanggal === today) m.poinHariIni += r.poin;
    m.rt.add(`${r.kelurahan}|${r.rtSls}`);
    map.set(r.pegawai, m);
  }
  const rows: Row[] = [...map.entries()].map(([nama, m]) => ({
    nama,
    dicek: m.dicek,
    poin: m.poin,
    capaian: m.dicek / TARGET,
    poinHariIni: m.poinHariIni,
    rt: m.rt.size,
  }));

  const jumlahPegawai = rows.length || 1;
  const targetSatker = jumlahPegawai * TARGET;
  const totalDicek = records.length;
  const totalPoin = records.reduce((s, r) => s + r.poin, 0);
  const hariIni = records.filter((r) => r.tanggal === today).length;
  const capaianSatker = totalDicek / targetSatker;
  const selesai = rows.filter((r) => r.capaian >= 1).length;

  // Kategori
  const countKat = (k: string) => records.filter((r) => r.kategori === k).length;
  const donut = [
    { name: KATEGORI.TIDAK, value: countKat(KATEGORI.TIDAK), color: "#94a3b8" },
    { name: KATEGORI.KELUARGA, value: countKat(KATEGORI.KELUARGA), color: "#2563eb" },
    { name: KATEGORI.USAHA, value: countKat(KATEGORI.USAHA), color: "#14b8a6" },
    { name: KATEGORI.LAIN, value: countKat(KATEGORI.LAIN), color: "#e2e8f0" },
  ].filter((d) => d.value > 0);

  // Tren harian
  const perHari = new Map<string, number>();
  for (const r of records) perHari.set(r.tanggal, (perHari.get(r.tanggal) ?? 0) + 1);
  const tren = [...perHari.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tanggal, jumlah]) => ({ tanggal, label: fmtTanggal(tanggal), jumlah }));

  // Grafik batang: yang paling tertinggal di atas
  const bar = [...rows]
    .sort((a, b) => a.dicek - b.dicek)
    .map((r) => ({ nama: shortName(r.nama), dicek: r.dicek, capaian: r.capaian }));

  // Catatan tidak ditemukan (terbaru dulu)
  const catatan = records
    .filter((r) => r.kategori === KATEGORI.TIDAK)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 15);

  const warnaCapaian = statusColor(capaianSatker);
  const filterAktif = !!(sp.kec || sp.kel || sp.dari || sp.sampai);

  const inputCls =
    "mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Judul */}
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Monitoring Pencacahan Ulang SLS/RT
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {jumlahPegawai} pegawai • target {fmtNum(TARGET)} assignment per pegawai •{" "}
          {raw.demo ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              DATA DEMO
            </span>
          ) : (
            "data langsung dari Google Sheets"
          )}
        </p>
      </header>

      {/* Filter: memanjang selebar halaman */}
      <form method="get" className="card mb-4 w-full">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Filter</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <label className="text-xs font-medium text-slate-500">
            Kecamatan
            <select name="kec" defaultValue={sp.kec ?? ""} className={inputCls}>
              <option value="">Semua</option>
              {kecOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">
            Kelurahan
            <select name="kel" defaultValue={sp.kel ?? ""} className={inputCls}>
              <option value="">Semua</option>
              {kelOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">
            Dari tanggal
            <input type="date" name="dari" defaultValue={sp.dari ?? ""} className={inputCls} />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Sampai tanggal
            <input type="date" name="sampai" defaultValue={sp.sampai ?? ""} className={inputCls} />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Terapkan
            </button>
            {filterAktif && (
              <a href="/" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Reset
              </a>
            )}
          </div>
        </div>
      </form>

      {/* KPI: Total Assignment, Total Poin, Hari ini, Capaian Satker */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Assignment" value={fmtNum(totalDicek)} accent="#2563eb" />
        <KpiCard label="Total Poin" value={fmtNum(totalPoin)} accent="#7c3aed" />
        <KpiCard
          label="Dikerjakan hari ini"
          value={fmtNum(hariIni)}
          sub={fmtTanggalLengkap(today)}
          accent="#14b8a6"
        />
        <KpiCard
          label="Capaian Satker"
          value={fmtPct(capaianSatker)}
          sub={`${selesai} dari ${jumlahPegawai} pegawai sudah mencapai target`}
          accent={warnaCapaian}
          progress={capaianSatker}
        />
      </section>

      {/* Progres per pegawai (kiri) + Hasil verifikasi & Tren (kanan, atas-bawah dalam satu kartu) */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="card lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Progres per pegawai</h2>
          <p className="mb-3 text-sm text-slate-500">
            Yang paling tertinggal ada di atas. Merah &lt; 50%, kuning 50-99%, hijau ≥ 100% target.
          </p>
          <PegawaiBar data={bar} target={TARGET} />
        </div>

        <div className="card lg:sticky lg:top-4">
          <h2 className="text-base font-semibold text-slate-900">Hasil verifikasi</h2>
          <p className="mb-3 text-sm text-slate-500">Sebaran kategori assignment</p>
          {donut.length ? (
            <KategoriDonut data={donut} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">Belum ada data.</p>
          )}

          <hr className="my-5 border-slate-100" />

          <h2 className="text-base font-semibold text-slate-900">Tren harian</h2>
          <p className="mb-3 text-sm text-slate-500">Jumlah assignment dicek per hari</p>
          {tren.length ? (
            <TrenLine data={tren} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">Belum ada data.</p>
          )}
        </div>
      </section>

      {/* Peringkat pegawai */}
      <section className="card mt-4">
        <h2 className="text-base font-semibold text-slate-900">Peringkat pegawai</h2>
        <p className="mb-3 text-sm text-slate-500">Diurutkan berdasarkan total poin</p>
        <RankingTable rows={rows} target={TARGET} />
      </section>

      {/* Catatan */}
      <section className="card mt-4">
        <h2 className="text-base font-semibold text-slate-900">Catatan assignment tidak ditemukan</h2>
        <p className="mb-3 text-sm text-slate-500">15 kasus terbaru yang terbukti tidak ditemukan</p>
        <div className="overflow-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Tanggal</th>
                <th className="px-3 py-2.5">Pegawai</th>
                <th className="px-3 py-2.5">Kelurahan</th>
                <th className="px-3 py-2.5">RT/SLS</th>
                <th className="px-3 py-2.5">Jenis</th>
                <th className="px-3 py-2.5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catatan.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">{fmtTanggal(r.tanggal)}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{shortName(r.pegawai, 28)}</td>
                  <td className="px-3 py-2.5">{r.kelurahan}</td>
                  <td className="px-3 py-2.5">{r.rtSls}</td>
                  <td className="px-3 py-2.5">{r.jenis}</td>
                  <td className="px-3 py-2.5 text-slate-600">{r.catatan || "-"}</td>
                </tr>
              ))}
              {catatan.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    Belum ada assignment yang terbukti tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-6 text-center text-xs text-slate-400">
        Data dibaca dari Google Sheets dan disegarkan otomatis setiap ±30 detik. Muat ulang halaman untuk melihat data terbaru.
      </footer>
    </main>
  );
}