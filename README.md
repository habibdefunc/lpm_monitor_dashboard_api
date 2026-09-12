# LPM Monitor Dashboard API

Backend dashboard pencatatan kegiatan LPM UINSU.

## Teknologi

Node.js 22, TypeScript, Express, PostgreSQL/Supabase, Prisma 6, Zod, bcrypt, Multer, Winston, Jest, dan Supertest.

## Fitur API

- Login, logout, dan hak akses ADMIN/STAF.
- CRUD pengguna serta pengalihan kegiatan aktif sebelum konfirmasi hapus.
- CRUD kategori dan kegiatan, status, pencarian, filter, dan pagination.
- Upload, download, dan hapus dokumentasi JPEG/PNG/PDF maksimal 10 MiB.
- Dashboard ringkasan dan kalender kegiatan.

## URL API

Base URL: `http://localhost:3000`. Selain login, gunakan header `X-API-TOKEN: <token>`. ADMIN mengelola seluruh data; STAF hanya kegiatan yang menjadi tanggung jawabnya.

| Method | URL | Fungsi |
| --- | --- | --- |
| POST | /api/users/login | Login |
| DELETE | /api/users/current | Logout |
| GET, PATCH | /api/users/current | Lihat dan ubah akun sendiri |
| POST, GET | /api/users | Tambah dan daftar pengguna |
| GET, PATCH, DELETE | /api/users/:id | Detail, ubah, dan hapus pengguna |
| GET | /api/users/:id/deletion-preview | Preview tanggungan sebelum hapus |
| POST | /api/categories | Tambah kategori |
| GET | /api/categories/current | Daftar kategori |
| GET, PATCH, DELETE | /api/categories/current/:id | Detail, ubah, dan hapus kategori |
| POST | /api/activities | Tambah kegiatan |
| GET | /api/activities/current | Daftar, pencarian, dan filter kegiatan |
| GET, PATCH, DELETE | /api/activities/current/:id | Detail, ubah, dan hapus kegiatan |
| PATCH | /api/activities/current/:id/status | Ubah status kegiatan |
| POST, GET | /api/activities/:activity_id/documentations | Upload dan daftar dokumentasi |
| GET, DELETE | /api/activities/:activity_id/documentations/:id | Detail dan hapus dokumentasi |
| GET | /api/activities/:activity_id/documentations/:id/download | Download file |
| GET | /api/dashboard | Ringkasan kegiatan |
| GET | /api/calendar | Kalender kegiatan |

## Instalasi

Siapkan Git, Node.js 22, npm, dan MySQL/MariaDB yang aktif.

**1. Clone dan install dependency**

```bash
git clone https://github.com/habibdefunc/lpm_monitor_dashboard_api.git
cd lpm_monitor_dashboard_api
npm ci
npm install --save-dev nodemon
```

Nodemon diperlukan oleh script `dev` dan belum tercantum di dependency repository.

**2. Buat database** melalui phpMyAdmin atau client MySQL:

```sql
CREATE DATABASE IF NOT EXISTS lpm_monitor_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**3. Salin `.env.example` menjadi `.env`**

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Isi koneksi database pada `.env`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
```

Ganti USER dan PASSWORD sesuai akun MySQL.

**4. Migrasi, seeder, build, dan jalankan API**

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run build
npm run dev
```

API berjalan di **http://localhost:3000**. Akun admin awal: **admin123** / **Admin123!**. Ubah password setelah login.

Script dev menjalankan hasil build di `dist`; jalankan `npm run build` kembali setelah mengubah kode TypeScript.
