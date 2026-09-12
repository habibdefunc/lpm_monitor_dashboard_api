# LPM Monitor Dashboard API

Backend pencatatan kegiatan Lembaga Penjaminan Mutu UINSU.

## Teknologi

Node.js 22+, TypeScript, Express 5, PostgreSQL (Supabase), Prisma 6, Supabase Storage, Zod, bcrypt, Multer, Winston, Jest, dan Supertest. Integrasi Storage menggunakan fetch bawaan Node.js.

## Fitur API

- Login/logout, profil sendiri, dan hak akses ADMIN/STAF.
- CRUD pengguna; pengalihan kegiatan aktif sebelum hapus akun.
- CRUD kategori dan kegiatan, perubahan status, pencarian, filter, dan pagination.
- Dokumentasi JPEG/PNG/PDF maksimal 10 MiB per file, disimpan private di Supabase Storage. Frontend dapat mengantrekan sampai 10 file; backend memproses satu file per alur upload.
- Dashboard ringkasan dan kalender kegiatan.

## URL API

Base URL lokal: `http://localhost:3000/api`. Semua endpoint berikut membutuhkan `X-API-TOKEN: <token>`, kecuali login. ADMIN mengelola pengguna dan kategori; STAF dapat membaca kategori serta mengelola kegiatan tanggung jawabnya dan dokumentasinya.

| Method | Path | Fungsi |
| --- | --- | --- |
| POST | /users/login | Login |
| GET, PATCH, DELETE | /users/current | Profil sendiri, update profil, logout |
| POST, GET | /users | Tambah dan daftar pengguna (ADMIN) |
| GET, PATCH, DELETE | /users/:id | Detail, update, hapus pengguna (ADMIN) |
| GET | /users/:id/deletion-preview | Periksa tanggungan sebelum hapus |
| POST | /categories | Tambah kategori (ADMIN) |
| GET | /categories/current | Daftar kategori |
| GET, PATCH, DELETE | /categories/current/:id | Detail; update/hapus khusus ADMIN |
| POST | /activities | Tambah kegiatan |
| GET | /activities/current | Daftar, pencarian, filter, pagination |
| GET, PATCH, DELETE | /activities/current/:id | Detail, update, hapus kegiatan |
| PATCH | /activities/current/:id/status | Update status |
| POST | /activities/:activity_id/documentations/upload-url | Minta URL unggah sementara |
| POST | /activities/:activity_id/documentations/complete | Validasi file dan simpan metadata |
| POST | /activities/:activity_id/documentations/cancel | Bersihkan unggahan sementara |
| POST, GET | /activities/:activity_id/documentations | Upload multipart legacy; daftar dokumentasi |
| GET, DELETE | /activities/:activity_id/documentations/:id | Detail dan hapus dokumentasi |
| GET | /activities/:activity_id/documentations/:id/download-url | Minta signed URL unduh |
| GET | /activities/:activity_id/documentations/:id/download | Redirect file cloud; binary file lokal |
| GET | /dashboard | Ringkasan kegiatan |
| GET | /calendar | Kalender kegiatan |

Upload utama: minta upload-url → PUT file langsung ke URL Storage → complete. Tidak ada endpoint update dokumentasi. Detail request/response: [Documentation API](doc/documentation.md), [User API](doc/user.md), dan [aturan umum](doc/common.md).

## Instalasi

Siapkan Git, Node.js 22+, npm, dan project Supabase dengan PostgreSQL aktif.

```sh
git clone https://github.com/habibdefunc/lpm_monitor_dashboard_api.git
cd lpm_monitor_dashboard_api
npm ci
```

Salin `.env.example` menjadi `.env`: PowerShell `Copy-Item .env.example .env` atau Linux/macOS `cp .env.example .env`. Isi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST:5432/postgres"
SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_ISI_SERVER_KEY"
SUPABASE_STORAGE_BUCKET="documentations"
```

Salin DATABASE_URL dari Supabase Connect → Session pooler dan isi password database yang di-URL-encode bila mengandung karakter khusus. Ambil server secret key dari Settings → API Keys. Buat bucket private `documentations`, batas 10 MB, MIME `image/jpeg,image/png,application/pdf`. Semua kredensial tersebut hanya untuk backend.

```sh
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run build
npm pkg set "scripts.dev=node --env-file=.env --watch dist/index.js"
npm run dev
```

Perintah `npm pkg set` di atas memperbaiki script dev lama yang masih menunjuk `dist/main.js` dan membutuhkan nodemon yang belum terpasang. Node menjalankan hasil build; ulangi `npm run build` setelah mengubah TypeScript. Pastikan NODE_ENV lokal bukan production agar server membuka port 3000.

API lokal: **http://localhost:3000**. Akun seeder: **admin123 / Admin123!**; ubah password setelah login. Seeder tidak mereset akun admin yang sudah ada.

Untuk deployment, isi environment yang sama di Vercel backend, lalu deploy backend sebelum frontend. Penambahan Storage tidak memerlukan migrasi baru. Panduan Storage, cleanup, dan pengujian: [storage-setup.md](doc/storage-setup.md).
