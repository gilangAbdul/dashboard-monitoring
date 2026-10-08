# Dashboard Monitoring Pencacahan Ulang SLS/RT (Next.js + Google Sheets)

Dashboard web yang membaca data dari Google Sheets (hasil Google Form) dan menampilkan:
KPI satker, progres per pegawai (target 150), hasil verifikasi, tren harian, peringkat poin,
dan catatan assignment yang tidak ditemukan. Ada filter Kecamatan, Kelurahan, dan rentang tanggal.

Tanpa konfigurasi apa pun, dashboard otomatis menampilkan **data demo** (35 pegawai fiktif),
jadi Anda bisa melihat tampilannya dulu.

## 1. Jalankan di komputer

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## 2. Hubungkan ke Google Sheets (service account)

1. Buka https://console.cloud.google.com, buat project (atau pakai yang ada).
2. **APIs & Services > Library**, aktifkan **Google Sheets API**.
3. **APIs & Services > Credentials > Create credentials > Service account**. Beri nama bebas.
4. Buka service account tadi, tab **Keys > Add key > Create new key > JSON**. File JSON akan terunduh.
5. Di Google Sheets Anda, klik **Bagikan** dan tambahkan alamat `client_email` dari file JSON
   sebagai **Viewer**.
6. Salin `.env.example` menjadi `.env.local`, lalu isi:
   - `GOOGLE_SHEET_ID`: bagian URL di antara `/d/` dan `/edit`
   - `GOOGLE_CLIENT_EMAIL`: field `client_email` di file JSON
   - `GOOGLE_PRIVATE_KEY`: field `private_key` di file JSON, dalam tanda kutip ganda
7. Jalankan ulang `npm run dev`. Label "DATA DEMO" akan hilang kalau koneksi berhasil.

**Jangan** commit `.env.local` atau file JSON ke Git/GitHub. File itu berisi kunci rahasia.

## Struktur tab yang dibaca

| Tab | Kolom yang dipakai |
|---|---|
| `Olah` | A Tanggal, B Pegawai, C Kecamatan, D Kelurahan, E RT/SLS, F Jenis Awal, H Kategori, K Total Poin |
| `Rekap` | A2:A Daftar nama pegawai (supaya yang belum input tetap tampil dengan nilai 0) |
| `Form Responses 1` | K Catatan Verifikasi Tidak Ditemukan, N Catatan Lapangan |

Tab `Olah` dan `Rekap` adalah tab hasil rumus yang sudah Anda buat. Kalau nama tab berbeda,
ubah `SHEET_RESPONS`, `SHEET_OLAH`, `SHEET_REKAP` di `.env.local`.
Kolom Kategori harus berisi tepat: `Terbukti tidak ditemukan`, `Keluarga ditemukan`, `Usaha ditemukan`
(sesuai rumus tab Olah).

## 3. Kata sandi (disarankan)

Data berisi kinerja pegawai. Isi `DASHBOARD_PASSWORD` di `.env.local` untuk mengaktifkan
login sederhana: browser akan meminta kata sandi (nama pengguna bebas diisi apa saja).
Untuk keamanan lebih kuat, gunakan layanan login sungguhan (misalnya NextAuth) atau
batasi akses lewat jaringan internal kantor.

## 4. Deploy

Cara paling mudah adalah Vercel: unggah project ini ke GitHub, impor di vercel.com, lalu isi
semua variabel dari `.env.local` di **Settings > Environment Variables**. Setelah itu
ketik ulang `GOOGLE_PRIVATE_KEY` persis seperti di `.env.local`.

Alternatif: server kantor dengan `npm run build && npm start`.

## Struktur kode

```
app/page.tsx            halaman dashboard (filter, KPI, grafik, tabel)
app/globals.css         tema (warna, kartu)
components/Charts.tsx   grafik batang, donat, garis (Recharts)
components/RankingTable.tsx  tabel peringkat dengan pencarian
components/KpiCard.tsx  kartu angka utama
lib/sheets.ts           pembacaan Google Sheets API + cache 30 detik
lib/mock.ts             data demo
lib/utils.ts            format tanggal/angka, warna status
middleware.ts           kata sandi opsional
```

## Mengubah aturan

- Target per pegawai: `TARGET_PER_PEGAWAI` di `.env.local`.
- Warna status (merah/kuning/hijau): fungsi `statusColor` di `lib/utils.ts`.
- Aturan poin dihitung di tab `Olah` pada Google Sheets, bukan di kode ini.
  Ubah rumus di sana, dashboard otomatis mengikuti.
