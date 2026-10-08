export type Rec = {
  tanggal: string; // YYYY-MM-DD (WIB)
  pegawai: string;
  kecamatan: string;
  kelurahan: string;
  rtSls: string;
  jenis: string;
  kategori: string;
  poin: number;
  catatan: string;
};

export type RawData = {
  names: string[]; // daftar pegawai dari tab Rekap (supaya yang belum input tetap tampil)
  records: Rec[];
  demo: boolean;
};

export const KATEGORI = {
  TIDAK: "Terbukti tidak ditemukan",
  KELUARGA: "Keluarga ditemukan",
  USAHA: "Usaha ditemukan",
  LAIN: "Lainnya",
} as const;
