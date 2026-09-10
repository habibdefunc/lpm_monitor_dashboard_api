# User API Spec

## CREATE USER
endpoint : POST /api/users

akses: ADMIN

request header:

X-API-TOKEN: token

request body:
```json
{
    "username": "staf01",
    "password": "ContohSandi123!",
    "name": "Staf LPM",
    "jenis_kel": "L",
    "email": "staf01@example.com",
    "no_hp": "081234567890",
    "alamat": "Medan",
    "role": "STAF"
}
```

response body (success):

status: 201 Created
```json
{
    "data": {
        "id": 1,
        "username": "staf01",
        "name": "Staf LPM",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "STAF"
    }
}
```

response body (failed):

status: 409 Conflict
```json
{
    "errors": "Username already exists"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

## LOGIN USER
endpoint : POST /api/users/login

akses: tanpa login

request body:
```json
{
    "username": "staf01",
    "password": "ContohSandi123!"
}
```

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 1,
        "username": "staf01",
        "name": "Staf LPM",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "STAF",
        "token": "6f78eb59-7919-4bf1-a027-24ff05de765b"
    }
}
```

response body (failed):

status: 401 Unauthorized
```json
{
    "errors": "username or password is incorrect"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

## GET CURRENT USER
endpoint : GET /api/users/current

akses: ADMIN dan STAF yang sudah login

request header:

X-API-TOKEN: token

request body: tidak diperlukan.

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 1,
        "username": "staf01",
        "name": "Staf LPM",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "ADMIN"
    }
}
```

response body (failed):

status: 401 Unauthorized
```json
{
    "errors": "unauthorized"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

## UPDATE CURRENT USER
endpoint : PATCH /api/users/current

akses: ADMIN dan STAF yang sudah login

request header:

X-API-TOKEN: token

request body:
```json
{
    "name": "Staf LPM Diperbarui"
}
```

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 1,
        "username": "staf01",
        "name": "Staf LPM Diperbarui",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "ADMIN"
    }
}
```

response body (failed):

status: 409 Conflict
```json
{
    "errors": "Email already exists"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

Request kosong menghasilkan 400 dengan pesan validasi yang memuat "At least one field is required for update".

## LOGOUT USER
endpoint : DELETE /api/users/current

akses: ADMIN dan STAF

request header:

X-API-TOKEN: token

request body: tidak diperlukan.

response body (success):

status: 200 OK
```json
{
    "data": "OK"
}
```

response body (failed):

status: 401 Unauthorized
```json
{
    "errors": "unauthorized"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

## DELETE USER
endpoint : DELETE /api/users/current/:id

akses: ADMIN

request header:

X-API-TOKEN: token

request parameter:

id: ID pengguna yang akan dihapus, misalnya /api/users/current/1.

request body: tidak diperlukan.

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 1,
        "username": "staf01",
        "name": "Staf LPM",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "STAF"
    }
}
```

response body (failed):

status: 404 Not Found
```json
{
    "errors": "User not found"
}
```

status error lainnya: mengikuti ketentuan umum di atas.


## GET USERS
endpoint : GET /api/users

akses: ADMIN

request header:

X-API-TOKEN: token

Seluruh pengguna dikembalikan sebagai array, urutan id menaik, tanpa pagination. Jika tidak ada data, response data berupa []. Password dan token tidak dikembalikan.

request body: tidak diperlukan.

response body (success):

status: 200 OK
```json
{
    "data": [
        {
            "id": 2,
            "username": "staf01",
            "name": "Staf LPM",
            "jenis_kel": "L",
            "email": "staf01@example.com",
            "no_hp": "081234567890",
            "alamat": "Medan",
            "role": "STAF"
        }
    ]
}
```

response body (failed):

status: 403 Forbidden
```json
{
    "errors": "Only ADMIN can access this resource"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

## GET USER BY ID
endpoint : GET /api/users/:id

akses: ADMIN

request header:

X-API-TOKEN: token

request parameter:

id: integer positif ID pengguna target, misalnya /api/users/2.

request body: tidak diperlukan.

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 2,
        "username": "staf01",
        "name": "Staf LPM",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "STAF"
    }
}
```

response body (failed):

status: 404 Not Found
```json
{
    "errors": "User not found"
}
```

status error lainnya: mengikuti ketentuan umum di atas.

## UPDATE USER BY ID
endpoint : PATCH /api/users/:id

akses: ADMIN

request header:

X-API-TOKEN: token

request parameter:

id: integer positif ID pengguna target, misalnya /api/users/2.

request body:
```json
{
    "name": "Staf LPM Diperbarui",
    "role": "STAF"
}
```

Field update: username, password, name, jenis_kel, email, no_hp, alamat, role. Minimal satu field, field tidak dikirim tetap. Password baru di-hash. Role hanya ADMIN/STAF dan ADMIN terakhir tidak boleh diturunkan menjadi STAF.

response body (success):

status: 200 OK
```json
{
    "data": {
        "id": 2,
        "username": "staf01",
        "name": "Staf LPM Diperbarui",
        "jenis_kel": "L",
        "email": "staf01@example.com",
        "no_hp": "081234567890",
        "alamat": "Medan",
        "role": "STAF"
    }
}
```

response body (failed):

status: 409 Conflict
```json
{
    "errors": "Email already exists"
}
```

status error lainnya: mengikuti ketentuan umum di atas.
