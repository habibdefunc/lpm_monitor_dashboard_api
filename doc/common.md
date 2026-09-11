# Common API Rules

Ketentuan ini berlaku untuk API kategori, kegiatan, dokumentasi, dashboard, dan kalender. API pengguna mengikuti [user.md](user.md).

Semua endpoint fitur menggunakan header X-API-TOKEN. Role mengikuti akun yang tersimpan: ADMIN dan STAF.

response body (failed):

```json
{
    "errors": "Error message"
}
```

Pesan validasi pada contoh spec bersifat ilustratif. Validasi Zod menghasilkan string dengan awalan `Validation Error :` beserta rincian field. Pesan bisnis dari service menggunakan Bahasa Inggris.

- 400: input, query, atau referensi tidak valid.
- 401: token tidak ada atau tidak valid.
- 403: hak akses tidak sesuai.
- 404: data tidak ditemukan atau dokumentasi bukan milik kegiatan pada URL.
- 409: data unik sudah digunakan atau kategori masih memiliki kegiatan.
- 413: file melampaui 10 MiB.
- 415: tipe file tidak didukung.
- 500: kesalahan internal.

ID adalah integer positif. ID di body dapat berupa number atau string angka; response menggunakan number.

Validasi request:

- Body JSON create/update kategori dan kegiatan, termasuk update status, menolak field yang tidak dikenal. Update minimal satu field.
- GET daftar kegiatan, dashboard, dan kalender memvalidasi query sesuai spec masing-masing dan menolak query yang tidak dikenal.
- GET daftar kategori dan daftar dokumentasi tidak menerima query; query apa pun menghasilkan 400.
- Endpoint detail, download, create, update, dan delete tidak memvalidasi query URL; query tambahan diabaikan.
- Upload dokumentasi hanya menerima satu field file bernama file melalui multipart/form-data. Field tambahan ditolak.
- Endpoint GET dan DELETE tidak memerlukan body. Body tambahan tidak divalidasi oleh service dan tidak digunakan.

Kategori tidak dapat dihapus selama dipakai kegiatan. Menghapus kegiatan turut menghapus dokumentasi dan berkasnya. Menghapus pengguna mengikuti relasi SetNull pada schema yang sudah ada.

Database dan filesystem tidak memiliki transaksi bersama. Saat penghapusan, berkas dipindahkan sementara lalu dipulihkan jika transaksi database gagal. Jika proses berhenti mendadak atau pembersihan akhir gagal, berkas .pending-delete mungkin memerlukan pemeriksaan manual.
