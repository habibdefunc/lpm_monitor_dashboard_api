# Activity API Spec

ID pada response berupa number. Activity tidak memiliki created_at/updated_at sesuai schema yang ada. Filter tanggal menampilkan kegiatan yang beririsan dengan rentang secara inklusif. responsible_user_id dapat null pada response jika pengguna telah dihapus.

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
    "category_id": 1,
    "responsible_user_id": 1,
    "status": "DIRENCANAKAN"
}
```


response body (success):

status: 201 Created
```json
{
    "data": {
        "id": 1,
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": 1,
        "responsible_user_id": 1,
        "status": "DIRENCANAKAN"
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

- search: opsional, pencarian sebagian nama kegiatan; sensitivitas huruf mengikuti collation MySQL, 1-150 karakter.
- start_date dan end_date: opsional, format YYYY-MM-DD; jika keduanya ada, end_date >= start_date.
- category_id: opsional, ID kategori.
- status: opsional, DIRENCANAKAN, BERJALAN, atau SELESAI.
- responsible_user_id: opsional, ID penanggung jawab. STAF hanya boleh mengirim ID dirinya sendiri; ID pengguna lain menghasilkan 403.
- page: integer >= 1, default 1.
- size: integer 1-100, default 10.
- Semua filter digabung menggunakan AND. Referensi filter yang tidak memiliki hasil menghasilkan array kosong.
- Urutan: id terbesar dahulu, mengikuti schema Activity yang tidak memiliki timestamp.

contoh: /api/activities/current?search=rapat&status=DIRENCANAKAN&page=1&size=10

response body (success):

status: 200 OK
```json
{
    "data": [
        {
            "id": 1,
            "name": "Rapat Evaluasi Mutu",
            "description": "Evaluasi pelaksanaan program mutu.",
            "start_date": "2026-09-15",
            "end_date": "2026-09-15",
            "category_id": 1,
            "responsible_user_id": 1,
            "status": "DIRENCANAKAN"
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
        "id": 1,
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": 1,
        "responsible_user_id": 1,
        "status": "DIRENCANAKAN"
    }
}
```


response body (failed):

status: 404 Not Found
```json
{
    "errors": "Activity not found"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## UPDATE ACTIVITY
endpoint : PATCH /api/activities/current/{id}

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
        "id": 1,
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": 1,
        "responsible_user_id": 1,
        "status": "DIRENCANAKAN"
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
        "id": 1,
        "name": "Rapat Evaluasi Mutu",
        "description": "Evaluasi pelaksanaan program mutu.",
        "start_date": "2026-09-15",
        "end_date": "2026-09-15",
        "category_id": 1,
        "responsible_user_id": 1,
        "status": "BERJALAN"
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
endpoint : DELETE /api/activities/current/{id}

akses: ADMIN untuk seluruh kegiatan; STAF hanya kegiatan yang menjadi tanggung jawabnya

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK
```json
{
    "data": {
        "message": "Activity deleted successfully"
    }
}
```


response body (failed):

status: 404 Not Found
```json
{
    "errors": "Activity not found"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

