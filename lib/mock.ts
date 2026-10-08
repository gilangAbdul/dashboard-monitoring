import { KATEGORI, type RawData, type Rec } from "./types";
import { todayWIB } from "./utils";

// Generator acak deterministik supaya tampilan demo stabil
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WILAYAH: Record<string, string[]> = {
  "Metro Pusat": ["Hadimulyo Barat", "Hadimulyo Timur", "Imopuro", "Yosomulyo"],
  "Metro Barat": ["Mulyojati", "Mulyosari", "Ganjar Agung", "Ganjar Asri"],
  "Metro Timur": ["Iringmulyo", "Yosodadi", "Yoso Mulyo", "Tejosari"],
  "Metro Selatan": ["Rejomulyo", "Sumbersari", "Margodadi", "Margorejo"],
  "Metro Utara": ["Banjarsari", "Purwosari", "Purwoasri", "Karangrejo"],
};

export function mockData(target: number): RawData {
  const rand = mulberry32(2026);
  const names = Array.from({ length: 35 }, (_, i) => `Pegawai ${String(i + 1).padStart(2, "0")}`);
  const kecList = Object.keys(WILAYAH);
  const today = new Date(`${todayWIB()}T00:00:00Z`).getTime();
  const records: Rec[] = [];

  names.forEach((nama, idx) => {
    // tiap pegawai punya tingkat kemajuan berbeda
    const progress = 0.15 + rand() * 0.95;
    const total = Math.round(target * progress);
    const kec = kecList[idx % kecList.length];
    for (let i = 0; i < total; i++) {
      const kel = WILAYAH[kec][Math.floor(rand() * 4)];
      const jenis = rand() < 0.45 ? "Usaha" : "Keluarga";
      const r = rand();
      let kategori: string = KATEGORI.TIDAK;
      let poin = 1;
      if (r > 0.3) {
        kategori = jenis === "Usaha" ? KATEGORI.USAHA : KATEGORI.KELUARGA;
        poin = jenis === "Usaha" ? 3 : 2;
      }
      const bonus = jenis === "Keluarga" && kategori === KATEGORI.KELUARGA && rand() < 0.2 ? 1 : 0;
      const dayOffset = Math.floor(rand() * rand() * 12);
      const tanggal = new Date(today - dayOffset * 86400000).toISOString().slice(0, 10);
      records.push({
        tanggal,
        pegawai: nama,
        kecamatan: kec,
        kelurahan: kel,
        rtSls: `RT ${String(1 + Math.floor(rand() * 40)).padStart(2, "0")}`,
        jenis,
        kategori,
        poin: poin + bonus,
        catatan:
          kategori === KATEGORI.TIDAK
            ? ["Pemilik pindah alamat", "Bangunan sudah dibongkar", "Tidak ada penghuni", "Usaha sudah tutup"][
                Math.floor(rand() * 4)
              ]
            : "",
      });
    }
  });

  return { names, records, demo: true };
}
