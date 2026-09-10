# Calendar API Spec

## GET CALENDAR
endpoint : GET /api/calendar

akses: ADMIN dan STAF yang sudah login

request header:

X-API-TOKEN: token

request query:

- month: opsional, integer 1-12, default bulan berjalan di Asia/Jakarta.
- year: opsional, integer 1-9999, default tahun berjalan di Asia/Jakarta.
- category_id: opsional, ID kategori.
- status: opsional, DIRENCANAKAN, BERJALAN, atau SELESAI.
- responsible_user_id: opsional, ID penanggung jawab. STAF hanya boleh mengirim ID sendiri; ID pengguna lain menghasilkan 403.
- Filter digabung menggunakan AND. Filter referensi yang tidak memiliki hasil mengembalikan events = [].

contoh: /api/calendar?month=9&year=2026

response body (success):

status: 200 OK
```json
{
    "data": {
        "month": 9,
        "year": 2026,
        "events": [
            {
                "activity_id": "1",
                "name": "Rapat Evaluasi Mutu",
                "start_date": "2026-09-15",
                "end_date": "2026-09-15",
                "category_id": "1",
                "responsible_user_id": "1",
                "status": "DIRENCANAKAN",
                "status_label": "Direncanakan",
                "color": "#3B82F6"
            }
        ]
    }
}
```

Jika tidak ada kegiatan pada bulan tersebut, events berupa array kosong [].
response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Month harus berupa integer antara 1 dan 12"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

