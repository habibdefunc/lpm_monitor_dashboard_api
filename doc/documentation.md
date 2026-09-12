# Documentation API Spec

Dokumentasi menerima JPEG, PNG, atau PDF maksimal 10 MiB (10.485.760 byte) per file. Antrean frontend maksimal 10 file; tiap file memiliki request dan hasil sendiri, bukan satu transaksi batch. File yang sudah berhasil tetap tersimpan jika file lain gagal.

File baru disimpan private di Supabase Storage ketika SUPABASE_URL diatur atau aplikasi berjalan di Vercel. Multipart lokal tanpa konfigurasi Storage menggunakan storage/documentations; test lokal menggunakan filesystem. Metadata tetap pada tabel Documentation; file_path tidak dikirim ke frontend dan uploaded_by bisa null setelah akun pengunggah dihapus.

Alur utama: POST upload-url → PUT binary langsung ke URL Supabase → POST complete. Binary tidak melewati request Vercel. Endpoint multipart legacy tetap tersedia, tetapi total request-nya dibatasi payload Vercel 4,5 MB. Konfigurasi bucket 10 MB tidak menaikkan batas request Vercel.

## PREPARE DIRECT UPLOAD
endpoint : POST /api/activities/{activity_id}/documentations/upload-url

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

```http
X-API-TOKEN: token
Content-Type: application/json
```

request body:

```json
{
    "file_name": "daftar-hadir.pdf",
    "mime_type": "application/pdf",
    "size": 245760
}
```

file_name: 1–255 karakter, tanpa separator path/control character. Ekstensi harus sesuai MIME. size: number integer 1–10.485.760, bukan string. Field tambahan ditolak.

response body (success):

status: 200 OK

```json
{
    "data": {
        "ticket": "signed-ticket",
        "upload_url": "https://PROJECT.supabase.co/storage/v1/object/upload/sign/..."
    }
}
```

Cache-Control: private, no-store. Ticket berlaku 2 jam dan terikat pada user, kegiatan, nama, MIME, serta ukuran. URL hanya menulis objek sementara; server secret key tidak dikirim.

response body (failed):

status: 415 Unsupported Media Type

```json
{
    "errors": "Unsupported file type"
}
```

Ukuran metadata di luar batas menghasilkan 400; konfigurasi Storage belum lengkap menghasilkan 503.

## UPLOAD FILE TO STORAGE
endpoint : PUT {upload_url}

URL diambil persis dari PREPARE DIRECT UPLOAD. Ini request langsung ke Supabase, bukan endpoint Express.

request header:

```http
Content-Type: application/pdf
```

request body: binary file yang sesuai metadata. Jangan mengirim X-API-TOKEN backend atau server secret key.

Setelah Storage menerima file, client wajib memanggil COMPLETE DIRECT UPLOAD. Upload ke Storage saja belum membuat dokumentasi di database. Respons error pada tahap ini mengikuti format Supabase, bukan format errors milik backend.

## COMPLETE DIRECT UPLOAD
endpoint : POST /api/activities/{activity_id}/documentations/complete

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya; ticket harus diterbitkan untuk user dan kegiatan yang sama.

request header:

```http
X-API-TOKEN: token
Content-Type: application/json
```

request body:

```json
{
    "ticket": "signed-ticket"
}
```

response body (success):

status: 201 Created

```json
{
    "data": {
        "id": 1,
        "activity_id": 1,
        "file_name": "daftar-hadir.pdf",
        "mime_type": "application/pdf",
        "size": 245760,
        "uploaded_by": 1,
        "created_at": "2026-09-15T04:00:00Z",
        "download_url": "/api/activities/1/documentations/1/download"
    }
}
```

Backend memeriksa ulang tanggung jawab kegiatan, ukuran aktual, ekstensi, MIME, dan signature dasar file. Pemeriksaan ini bukan antivirus. Hanya byte yang lolos validasi disimpan ke objek final.

Retry ticket yang sama mengembalikan record yang sama selama record masih ada dan ticket masih valid. File yang sudah tercatat tidak bisa ditimpa melalui URL upload sementara. Sisa objek sementara dibersihkan setelah metadata tersimpan.

response body (failed):

status: 400 Bad Request

```json
{
    "errors": "Uploaded file size does not match"
}
```

Status lain: 403 user/kegiatan tidak sesuai atau akses berubah; 404 file belum tersedia; 410 ticket kedaluwarsa; 413 ukuran aktual >10 MiB; 415 signature tidak sesuai. Request gagal tidak membuat metadata baru.

## CANCEL TEMPORARY UPLOAD
endpoint : POST /api/activities/{activity_id}/documentations/cancel

akses: akun login pemilik ticket untuk activity_id yang sama, termasuk jika kegiatan sudah dialihkan/dihapus.

request header:

```http
X-API-TOKEN: token
Content-Type: application/json
```

request body:

```json
{
    "ticket": "signed-ticket"
}
```

response body (success):

status: 200 OK

```json
{
    "data": {
        "message": "Temporary upload removed"
    }
}
```

Hanya objek sementara yang dihapus; dokumentasi final tidak berubah. Ticket harus belum kedaluwarsa. Membatalkan tidak mencabut signed URL upload yang sudah diterbitkan; URL tetap berlaku sampai kedaluwarsa. Sisa unggahan dibersihkan lewat cleanup.

response body (failed):

status: 410 Gone

```json
{
    "errors": "Upload ticket expired. Select the file again."
}
```

## UPLOAD DOCUMENTATION (MULTIPART LEGACY)
endpoint : POST /api/activities/{activity_id}/documentations

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

```http
X-API-TOKEN: token
Content-Type: multipart/form-data; boundary=<boundary>
```

request body (form-data):

file: satu file binary JPEG/PNG/PDF. Field tambahan ditolak. Boundary dibuat otomatis oleh HTTP client.

response body (success):

status: 201 Created

```json
{
    "data": {
        "id": 1,
        "activity_id": 1,
        "file_name": "daftar-hadir.pdf",
        "mime_type": "application/pdf",
        "size": 245760,
        "uploaded_by": 1,
        "created_at": "2026-09-15T04:00:00Z",
        "download_url": "/api/activities/1/documentations/1/download"
    }
}
```

response body (failed):

status: 413 Payload Too Large

```json
{
    "errors": "Maximum file size is 10 MiB"
}
```

Gunakan signed upload untuk file besar di Vercel. Batas platform dapat menolak request sebelum middleware dijalankan.

## GET DOCUMENTATIONS
endpoint : GET /api/activities/{activity_id}/documentations

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

request query: tidak menerima query.

response body (success):

status: 200 OK

```json
{
    "data": [
        {
            "id": 1,
            "activity_id": 1,
            "file_name": "daftar-hadir.pdf",
            "mime_type": "application/pdf",
            "size": 245760,
            "uploaded_by": 1,
            "created_at": "2026-09-15T04:00:00Z",
            "download_url": "/api/activities/1/documentations/1/download"
        }
    ]
}
```

data berupa [] jika kosong; urutan created_at terbaru, lalu id menaik. Tidak ada pagination pada endpoint ini.

response body (failed):

status: 404 Not Found

```json
{
    "errors": "Activity not found"
}
```

## GET DOCUMENTATION BY ID
endpoint : GET /api/activities/{activity_id}/documentations/{id}

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK

```json
{
    "data": {
        "id": 1,
        "activity_id": 1,
        "file_name": "daftar-hadir.pdf",
        "mime_type": "application/pdf",
        "size": 245760,
        "uploaded_by": 1,
        "created_at": "2026-09-15T04:00:00Z",
        "download_url": "/api/activities/1/documentations/1/download"
    }
}
```

response body (failed):

status: 404 Not Found

```json
{
    "errors": "Documentation not found"
}
```

## GET DOWNLOAD URL
endpoint : GET /api/activities/{activity_id}/documentations/{id}/download-url

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK

```json
{
    "data": {
        "url": "https://PROJECT.supabase.co/storage/v1/object/sign/...",
        "expires_in": 60
    }
}
```

Cache-Control: private, no-store. Frontend mengambil binary langsung dari URL ini tanpa token backend, lalu membuat object URL untuk preview/unduh. Signed URL dapat digunakan oleh pemegangnya selama 60 detik; perubahan role tidak mencabut URL yang sudah diterbitkan.

Untuk file lokal legacy, respons data adalah {"url":null,"expires_in":null}; gunakan endpoint download lama.

response body (failed):

status: 404 Not Found

```json
{
    "errors": "Documentation not found"
}
```

## DOWNLOAD DOCUMENTATION
endpoint : GET /api/activities/{activity_id}/documentations/{id}/download

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

response (file Supabase):

status: 302 Found

```http
Location: <signed-url-berlaku-60-detik>
Cache-Control: private, no-store
```

Client yang mengikuti redirect akan menerima file dari Supabase. Frontend menggunakan download-url agar token backend tidak diteruskan ke Storage.

response (file lokal legacy):

status: 200 OK

```http
Content-Type: <mime-file>
Content-Disposition: attachment; filename="daftar-hadir.pdf"
Content-Length: <ukuran-byte>
Cache-Control: private, no-store
X-Content-Type-Options: nosniff
```

Body berupa binary, bukan JSON. File lokal harus tersedia pada filesystem runtime.

response body (failed):

status: 404 Not Found

```json
{
    "errors": "Documentation not found"
}
```

## DELETE DOCUMENTATION
endpoint : DELETE /api/activities/{activity_id}/documentations/{id}

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

request body: tidak diperlukan.

response body (success):

status: 200 OK

```json
{
    "data": {
        "message": "Documentation deleted successfully"
    }
}
```

Metadata dan file dihapus. File dipindahkan sementara sebelum transaksi database selesai; dipulihkan jika transaksi gagal. Penanganan file tanpa metadata/pending-delete dijelaskan di storage-setup.md.

response body (failed):

status: 404 Not Found

```json
{
    "errors": "Documentation not found"
}
```

Tidak ada endpoint update file dokumentasi. Untuk mengganti file, unggah file baru dan hapus file lama setelah upload berhasil.

Status error umum semua endpoint backend: [common.md](common.md). Setup environment, deployment, file lama, dan cleanup: [storage-setup.md](storage-setup.md).


