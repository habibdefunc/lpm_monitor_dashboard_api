# Dashboard API Spec

## GET DASHBOARD
endpoint : GET /api/dashboard

akses: ADMIN dan STAF yang sudah login

request header:

X-API-TOKEN: token

request query:

year: opsional, integer 1-9999, default tahun berjalan di Asia/Jakarta. Hanya memengaruhi monthly_activities.

contoh: /api/dashboard?year=2026

response body (success):

status: 200 OK
```json
{
    "data": {
        "year": 2026,
        "summary": {
            "total": 1,
            "direncanakan": 1,
            "berjalan": 0,
            "selesai": 0
        },
        "monthly_activities": [
            {
                "month": 1,
                "total": 0
            },
            {
                "month": 2,
                "total": 0
            },
            {
                "month": 3,
                "total": 0
            },
            {
                "month": 4,
                "total": 0
            },
            {
                "month": 5,
                "total": 0
            },
            {
                "month": 6,
                "total": 0
            },
            {
                "month": 7,
                "total": 0
            },
            {
                "month": 8,
                "total": 0
            },
            {
                "month": 9,
                "total": 1
            },
            {
                "month": 10,
                "total": 0
            },
            {
                "month": 11,
                "total": 0
            },
            {
                "month": 12,
                "total": 0
            }
        ],
        "upcoming_activities": [
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
        ],
        "latest_activities": [
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
}
```

Contoh menggunakan tanggal hari ini 2026-09-10 di Asia/Jakarta.
response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Year harus berupa integer antara 1 dan 9999"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

