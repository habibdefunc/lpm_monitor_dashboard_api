# Supabase Storage setup

1. Gunakan bucket private `documentations`, batas 10 MB, MIME `image/jpeg,image/png,application/pdf`.
2. Jangan membuat policy public untuk bucket ini. Aplikasi memakai auth token sendiri; otorisasi kegiatan diperiksa backend sebelum mengeluarkan signed URL.
3. Isi environment backend lokal dan Vercel Production (bukan environment frontend):

```env
SUPABASE_URL=https://yacmndoxroumxkqzrbgq.supabase.co
SUPABASE_SECRET_KEY=sb_secret_ISI_DARI_SUPABASE
SUPABASE_STORAGE_BUCKET=documentations
```

Ambil server secret key dari Supabase Settings → API Keys. Backend juga menerima legacy `SUPABASE_SERVICE_ROLE_KEY` jika secret key belum tersedia; isi salah satu. Ini bukan password database, anon key, atau publishable key. Jangan commit/kirim key. DATABASE_URL tetap connection string PostgreSQL yang sudah berfungsi.

Integrasi Storage tidak menambahkan dependency atau mengubah schema/migrasi. Instalasi awal tetap memerlukan generate, migrate deploy, dan seed sesuai [README](../README.md). Kode memakai fetch Node.js; gunakan Node.js 22 atau lebih baru. Build serta test dijalankan sendiri:

```sh
# Folder api
npm run build
npx jest test/documentation.test.ts --runInBand
npx jest test/documentation-storage.test.ts --runInBand
npx jest test/activity.test.ts --runInBand

# Folder web
npm run lint
npm run build
```

Test signed storage memakai mock network; test integrasi membutuhkan database test dengan migrasi yang sesuai. Test file lokal tetap menggunakan disk lokal ketika NODE_ENV=test, sehingga tidak menulis ke bucket produksi. Jangan menggunakan database produksi untuk test.

Deploy backend lebih dahulu, kemudian frontend. Upload tidak mengirim binary lewat Vercel: frontend menerima ticket, PUT langsung ke Storage, lalu complete. Complete mendownload dan memvalidasi maksimal 10 MiB di server sebelum menyimpan objek final dan metadata. Pastikan durasi maksimum function deployment memadai untuk finalisasi (budget transaksi 90 detik; timeout client 120 detik).

Antrean UI maksimal 10 file, per file 10 MiB (10.485.760 byte). Ini bukan batas jumlah dokumentasi pada kegiatan dan bukan satu upload multipart berisi 10 file. Ada status per file dan retry hanya file gagal. Jangan tutup halaman sebelum proses selesai. Jika ticket kedaluwarsa, hapus item dari antrean dan pilih ulang. Retry complete bersifat idempoten selama dokumentasi masih ada dan ticket masih valid. Penghapusan kegiatan/dokumentasi juga menggunakan Storage untuk objek cloud.

Signed upload dan ticket berlaku 2 jam; signed download berlaku 60 detik. Pembatalan menghapus objek sementara, bukan mencabut signed URL yang sudah diterbitkan. File disimpan private, tetapi siapa pun yang memegang signed URL dapat menggunakannya sampai kedaluwarsa. Frontend tidak menerima server secret key dan tidak perlu environment Supabase baru.

## Cleanup dan file lama

Koneksi putus/browser ditutup dapat meninggalkan objek sementara atau file final tanpa record jika transaksi database gagal. Script berikut mengecek objek lebih tua dari 24 jam dan hanya menargetkan nama file yang dibuat alur upload. File yang masih memiliki record serta file pending-delete tidak dihapus.

```sh
# Sesudah build, folder api; Node.js 22+. Pertama tinjau dry-run:
node --env-file=.env dist/scripts/cleanupStorage.js
# Setelah hasil ditinjau, untuk menghapus orphan:
node --env-file=.env dist/scripts/cleanupStorage.js --apply
```

Jalankan cleanup secara berkala dari lingkungan server tepercaya. Script tidak dijalankan otomatis saat deploy. File pending-delete memerlukan pemeriksaan manual bila proses mati saat penghapusan/rollback.

File lokal lama tidak otomatis dipindahkan. Record dengan file_path nama biasa tetap dibaca dari storage/documentations; record cloud memakai prefix supabase:. Jika file lama hanya ada di komputer lokal, unggah ulang lewat aplikasi. Jangan menganggap file tersebut tersedia di Vercel.

## Pemeriksaan manual

- Pilih JPG, PNG, PDF sekaligus; masing-masing muncul satu kali di tabel setelah berhasil.
- File >10 MiB atau ekstensi tidak sesuai ditolak.
- Retry setelah respons complete terputus tidak menggandakan record.
- STAF tidak bisa mempersiapkan/mengonfirmasi/mengunduh dokumentasi kegiatan milik orang lain.
- Alihkan tanggung jawab saat upload: complete dari STAF lama harus ditolak.
- Uji lihat/unduh file >4,5 MB, delete dokumentasi, dan delete kegiatan beserta dokumentasinya.

Belum ada hasil eksekusi build/test untuk perubahan ini; jangan menganggap test sudah lulus.
