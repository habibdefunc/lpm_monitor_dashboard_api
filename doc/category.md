# Category API Spec

name wajib 1-100 karakter dan description wajib 1-255 karakter saat create. Update minimal satu field. ID pada response berupa number.

## CREATE CATEGORY
endpoint : POST /api/categories

akses: ADMIN

request header:

X-API-TOKEN: token

request body:
```json
{
    "name": "Rapat",
    "description": "Pertemuan koordinasi dan evaluasi."
}
```


response body (success):

status: 201 Created
```json
{
    "data": {
        "id": 1,
        "name": "Rapat",
        "description": "Pertemuan koordinasi dan evaluasi."
    }
}
```


response body (failed):

status: 409 Conflict
```json
{
    "errors": "Category name already exists"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## GET CATEGORIES
endpoint : GET /api/categories/current

akses: ADMIN dan STAF yang sudah login

request header:

X-API-TOKEN: token


response body (success):

status: 200 OK
```json
{
    "data": [
        {
            "id": 1,
            "name": "Rapat",
            "description": "Pertemuan koordinasi dan evaluasi."
        }
    ]
}
```

Jika tidak ada kategori, data berupa array kosong [].
response body (failed):

status: 400 Bad Request
```json
{
    "errors": "Request tidak valid"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## GET CATEGORY BY ID
endpoint : GET /api/categories/current/{id}

akses: ADMIN dan STAF yang sudah login

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 1,
        "name": "Rapat",
        "description": "Pertemuan koordinasi dan evaluasi."
    }
}
```


response body (failed):

status: 404 Not Found
```json
{
    "errors": "Category not found"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## UPDATE CATEGORY
endpoint : PATCH /api/categories/current/{id}

akses: ADMIN

request header:

X-API-TOKEN: token

request body:

name dan description dapat diperbarui sebagian. Nama milik kategori yang sama boleh tetap digunakan.
```json
{
    "name": "Rapat",
    "description": "Pertemuan koordinasi dan evaluasi."
}
```


response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 1,
        "name": "Rapat",
        "description": "Pertemuan koordinasi dan evaluasi."
    }
}
```


response body (failed):

status: 409 Conflict
```json
{
    "errors": "Category name already exists"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

## DELETE CATEGORY
endpoint : DELETE /api/categories/current/{id}

akses: ADMIN

request header:

X-API-TOKEN: token

response body (success):

status: 200 OK
```json
{
    "data": {
        "message": "Category deleted successfully"
    }
}
```


response body (failed):

status: 409 Conflict
```json
{
    "errors": "Category is still used by activities"
}
```

status error lainnya: mengikuti ketentuan pada [common.md](common.md), sesuai operasi.

