import { google } from "googleapis";
import { mockData } from "./mock";
import { toISODate } from "./utils";
import type { RawData, Rec } from "./types";

export const TARGET = Number(process.env.TARGET_PER_PEGAWAI ?? 150) || 150;

const cell = (row: unknown[] | undefined, i: number): string => {
  const v = row?.[i];
  return v === undefined || v === null ? "" : String(v).trim();
};

// Cache sederhana di memori server (30 detik) supaya tidak membebani Sheets API
let cache: { at: number; data: RawData } | null = null;
const TTL_MS = 30_000;

export async function getRawData(): Promise<RawData> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const data = await fetchRawData();
  cache = { at: Date.now(), data };
  return data;
}

async function fetchRawData(): Promise<RawData> {
  const id = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  // Belum dikonfigurasi -> tampilkan data demo
  if (!id || !email || !key) return mockData(TARGET);

  const respons = process.env.SHEET_RESPONS ?? "Form Responses 1";
  const olah = process.env.SHEET_OLAH ?? "Olah";
  const rekap = process.env.SHEET_REKAP ?? "Rekap";

  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: id,
    valueRenderOption: "UNFORMATTED_VALUE",
    ranges: [
      `'${olah}'!A2:K`, // Tanggal..Total Poin
      `'${rekap}'!A2:A`, // daftar nama pegawai
      `'${respons}'!K2:K`, // Catatan Verifikasi Lapangan Tidak Ditemukan
      `'${respons}'!N2:N`, // Catatan Lapangan
    ],
  });

  const [olahRows, rekapRows, catTidak, catLapangan] = (res.data.valueRanges ?? []).map(
    (v) => (v.values ?? []) as unknown[][],
  );

  // Baris Olah sejajar dengan baris Form Responses 1, jadi catatan dicocokkan lewat indeks
  const records: Rec[] = olahRows
    .map((row, i): Rec => ({
      tanggal: toISODate(row?.[0]),
      pegawai: cell(row, 1),
      kecamatan: cell(row, 2),
      kelurahan: cell(row, 3),
      rtSls: cell(row, 4),
      jenis: cell(row, 5),
      kategori: cell(row, 7),
      poin: Number(row?.[10]) || 0,
      catatan: cell(catTidak[i], 0) || cell(catLapangan[i], 0),
    }))
    .filter((r) => r.pegawai && r.tanggal);

  const names = rekapRows.map((r) => cell(r, 0)).filter(Boolean);

  return { names, records, demo: false };
}
