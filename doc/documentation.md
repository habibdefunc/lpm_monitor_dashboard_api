# Documentation API Spec

Upload menerima satu field file, format JPEG, PNG, atau PDF, maksimal 10 MiB. Ekstensi, MIME, dan signature dasar diperiksa. File disimpan privat di storage/documentations; download tetap memerlukan token. uploaded_by dapat null jika pengguna telah dihapus.

## UPLOAD DOCUMENTATION
endpoint : POST /api/activities/{activity_id}/documentations

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token
Content-Type: multipart/form-data; boundary=<boundary>

request body (form-data):

file: file foto atau dokumen pendukung (binary). Boundary dibuat otomatis oleh HTTP client saat menggunakan FormData.

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

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## GET DOCUMENTATIONS
endpoint : GET /api/activities/{activity_id}/documentations

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token


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

Jika kegiatan belum memiliki dokumentasi, data berupa array kosong [].
response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Request tidak valid"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

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

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## DOWNLOAD DOCUMENTATION
endpoint : GET /api/activities/{activity_id}/documentations/{id}/download

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token


response body (success):

status: 200 OK

response header:

Content-Type: MIME file yang tersimpan
Content-Disposition: attachment; filename="daftar-hadir.pdf"
Content-Length: ukuran file dalam byte
Cache-Control: private, no-store
X-Content-Type-Options: nosniff

Response berupa binary file, bukan JSON. Nama pada Content-Disposition disanitasi server. Untuk menampilkan foto, frontend dapat mengambil file melalui request terautentikasi lalu membuat object URL.

response body (failed):

status: 404 Not Found
```json
{
    "errors": "Documentation not found"
}
```
status error lainnya: 401, 403, 500 mengikuti common.md. Error dikembalikan sebagai application/json.

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


response body (failed):

status: 404 Not Found
```json
{
    "errors": "Documentation not found"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

