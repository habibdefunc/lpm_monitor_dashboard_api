# Common API Rules

Ketentuan ini berlaku untuk API kategori, kegiatan, dokumentasi, dashboard, dan kalender. Detail API pengguna: [user.md](user.md).

Semua endpoint fitur menggunakan X-API-TOKEN. Role diperiksa dari akun di database: ADMIN atau STAF. Token tidak ada/tidak valid menghasilkan 401; role tidak didukung menghasilkan 403.

response body (failed):

```json
{
    "errors": "Error message"
}
```

Pesan contoh spec bersifat ilustratif. Validasi Zod menghasilkan string berawalan `Validation Error :` beserta rincian field. Pesan bisnis service menggunakan Bahasa Inggris.

| Status | Kondisi |
| --- | --- |
| 400 | Input, query, referensi, atau ticket tidak valid; ukuran file tidak cocok dengan ticket |
| 401 | Token tidak ada/tidak valid |
| 403 | Hak akses atau pemilik ticket tidak sesuai |
| 404 | Data/objek Storage tidak ditemukan, atau dokumentasi bukan milik kegiatan pada URL |
| 409 | Nilai unik sudah digunakan atau data masih memiliki relasi yang membatasi penghapusan |
| 410 | Ticket upload kedaluwarsa |
| 413 | File multipart atau ukuran aktual file melebihi 10 MiB |
| 415 | Ekstensi, MIME, atau signature file tidak sesuai |
| 500 | Kesalahan internal, termasuk error koneksi yang tidak dipetakan khusus |
| 502 | Respons gagal dari Supabase Storage selain objek tidak ditemukan |
| 503 | Konfigurasi Supabase Storage tidak lengkap/tidak valid |

Ukuran metadata pada upload-url di luar 1–10.485.760 byte menghasilkan 400 melalui Zod. Batas 10 file adalah batas antrean frontend, bukan batas jumlah dokumentasi pada kegiatan.

Validasi request:

- ID kategori/kegiatan/dokumentasi adalah integer positif maksimal 2147483647. Parser ID fitur menerima number atau string angka; respons menggunakan number. Jangan menganggap semua field number dikoersi: size pada upload-url wajib number.
- Body JSON create/update kategori dan kegiatan, termasuk status, menolak field tidak dikenal. Update minimal satu field.
- Body upload-url hanya menerima file_name, mime_type, size. Body complete/cancel hanya menerima ticket.
- GET kegiatan/dashboard/kalender memvalidasi query sesuai spec; field tidak dikenal ditolak.
- GET daftar kategori/dokumentasi tidak menerima query; query apa pun menghasilkan 400.
- Endpoint detail, download, create, update, dan delete mengabaikan query tambahan.
- GET dan DELETE fitur ini tidak memerlukan body. DELETE pengguna berbeda: wajib body confirm dan, jika diperlukan, replacement_user_id sesuai user.md.
- Multipart legacy menerima satu field file bernama file, tanpa field tambahan. Alur utama upload beberapa file dijelaskan di [documentation.md](documentation.md).

Relasi dan akses:

- ADMIN mengelola pengguna dan mutasi kategori. STAF boleh membaca kategori untuk form kegiatan.
- STAF hanya boleh mengelola kegiatan tanggung jawabnya; akses dokumentasi, dashboard, dan kalender mengikuti pembatasan tersebut.
- Kategori tidak dapat dihapus selama digunakan kegiatan.
- Penghapusan kegiatan menghapus metadata dokumentasi dan berkasnya.
- Penghapusan pengguna mengalihkan kegiatan aktif ke pengganti terlebih dahulu. Relasi pengguna pada kegiatan selesai dan pengunggah dokumentasi menjadi null.

PostgreSQL dan Storage tidak memiliki transaksi bersama. Saat penghapusan, berkas dipindahkan sementara, lalu dipulihkan jika transaksi database gagal. File .pending-delete dapat memerlukan pemulihan manual jika proses terhenti. Upload gagal/terputus dapat meninggalkan objek tanpa metadata; tersedia script cleanup pada [storage-setup.md](storage-setup.md).

File cloud disimpan private. Backend memeriksa akses sebelum mengeluarkan signed URL unduh 60 detik. Pemegang URL tersebut dapat mengakses file selama URL masih berlaku. Tidak ada secret key atau file_path dalam respons dokumentasi.
