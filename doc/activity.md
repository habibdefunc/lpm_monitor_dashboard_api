# Activity API Spec

## CREATE ACTIVITY
endpoint : POST /api/activities

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

request body:
```json
{
    "name": "Rapat Evaluasi Mutu",
    "description": "Evaluasi pelaksanaan program mutu.",
    "start_date": "2026-09-15",
    "end_date": "2026-09-15",
    "category_id": "1",
    "responsible_user_id": "1",
    "status": "DIRENCANAKAN"
}
```


response body (success):

status: 201 Created
```json
{
    "data": {
        "id": "1",
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": "1",
        "responsible_user_id": "1",
        "status": "DIRENCANAKAN",
        "created_at": "2026-09-10T03:00:00Z",
        "updated_at": "2026-09-10T03:00:00Z"
    }
}
```


response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Request tidak valid"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## GET ACTIVITIES
endpoint : GET /api/activities/current

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

request query:

- search: opsional, pencarian sebagian nama kegiatan tanpa membedakan huruf besar/kecil, 1-150 karakter.
- start_date dan end_date: opsional, format YYYY-MM-DD; jika keduanya ada, end_date >= start_date.
- category_id: opsional, ID kategori.
- status: opsional, DIRENCANAKAN, BERJALAN, atau SELESAI.
- responsible_user_id: opsional, ID penanggung jawab. STAF hanya boleh mengirim ID dirinya sendiri; ID pengguna lain menghasilkan 403.
- page: integer >= 1, default 1.
- size: integer 1-100, default 10.
- Semua filter digabung menggunakan AND. Referensi filter yang tidak memiliki hasil menghasilkan array kosong.
- Urutan: created_at terbaru dahulu, lalu id menaik jika timestamp sama.

contoh: /api/activities?search=rapat&status=DIRENCANAKAN&page=1&size=10

response body (success):

status: 200 OK
```json
{
    "data": [
        {
            "id": "1",
            "name": "Rapat Evaluasi Mutu",
            "description": "Evaluasi pelaksanaan program mutu.",
            "start_date": "2026-09-15",
            "end_date": "2026-09-15",
            "category_id": "1",
            "responsible_user_id": "1",
            "status": "DIRENCANAKAN",
            "created_at": "2026-09-10T03:00:00Z",
            "updated_at": "2026-09-10T03:00:00Z"
        }
    ]
}
```

Response juga memiliki field paging sejajar dengan data:
```json
{
    "paging": {
        "page": 1,
        "size": 10,
        "total_items": 1,
        "total_pages": 1
    }
}
```

Jika tidak ada hasil, data = [], total_items = 0, total_pages = 0. Halaman melewati halaman terakhir menghasilkan data = [] dengan total tetap akurat.
response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Request tidak valid"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## GET ACTIVITY BY ID
endpoint : GET /api/activities/current/{id}

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": "1",
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": "1",
        "responsible_user_id": "1",
        "status": "DIRENCANAKAN",
        "created_at": "2026-09-10T03:00:00Z",
        "updated_at": "2026-09-10T03:00:00Z"
    }
}
```


response body (failed):

status: 404 Not Found
```json
{
    "errors": "Kegiatan tidak ditemukan"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## UPDATE ACTIVITY
endpoint : PATCH /api/activities/current

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

request body:

Semua field create boleh diperbarui sebagian. Validasi rentang tanggal menggunakan gabungan nilai lama dan nilai baru.
```json
{
    "name": "Rapat Evaluasi Mutu",
    "description": "Evaluasi pelaksanaan program mutu."
}
```


response body (success):

status: 200 OK
```json
{
    "data": {
        "id": "1",
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": "1",
        "responsible_user_id": "1",
        "status": "DIRENCANAKAN",
        "created_at": "2026-09-10T03:00:00Z",
        "updated_at": "2026-09-10T03:00:00Z"
    }
}
```


response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Request tidak valid"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## UPDATE ACTIVITY STATUS
endpoint : PATCH /api/activities/current/{id}/status

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

request parameter:

id: ID kegiatan.

request body:

Hanya field status yang diterima dan wajib dikirim. Aturannya sama dengan status pada UPDATE ACTIVITY.
```json
{
    "status": "BERJALAN"
}
```


response body (success):

status: 200 OK
```json
{
    "data": {
        "id": "1",
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": "1",
        "responsible_user_id": "1",
        "status": "BERJALAN",
        "created_at": "2026-09-10T03:00:00Z",
        "updated_at": "2026-09-15T02:00:00Z"
    }
}
```


response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Status kegiatan tidak valid"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## DELETE ACTIVITY
endpoint : DELETE /api/activities/current

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK
```json
{
    "data": {
        "message": "Kegiatan berhasil dihapus"
    }
}
```


response body (failed):

status: 404 Not Found
```json
{
    "errors": "Kegiatan tidak ditemukan"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

