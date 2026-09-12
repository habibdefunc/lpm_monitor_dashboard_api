# User API Spec

## Ketentuan umum

Login bersifat public; endpoint lainnya membutuhkan X-API-TOKEN dari login. Role pada database harus ADMIN atau STAF. Login baru mengganti token lama, dan logout mengosongkan token.

Request JSON menggunakan Content-Type: application/json. Body menolak field tidak dikenal. Create memerlukan seluruh field pada contoh; update hanya memerlukan minimal satu field dan mempertahankan field yang tidak dikirim. PATCH /users/current tidak menerima role; perubahan role hanya melalui endpoint ADMIN.

Validasi backend saat ini: username/name/jenis_kel 1–100 karakter, password 1–255, email 1–254, no_hp 1–20, alamat 1–500. Role harus ADMIN atau STAF. Username/email harus unik. Format email dan aturan nomor HP 10–15 digit pada frontend belum diterapkan sebagai aturan format di UserValidation backend; keduanya tidak boleh dianggap identik.

Error menggunakan {"errors":"message"}; status umum mengikuti [common.md](common.md). ID pengguna harus integer positif maksimal 2147483647. replacement_user_id pada body delete wajib number, bukan string.

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

## PREVIEW DELETE USER
endpoint : GET /api/users/:id/deletion-preview

akses: ADMIN

request header:

X-API-TOKEN: token

request parameter:

id: ID pengguna yang akan dihapus.

response body (success):

status: 200 OK
```json
{
    "data": {
        "user": {
            "id": 1,
            "username": "staf01",
            "name": "Staf LPM",
            "jenis_kel": "L",
            "email": "staf01@example.com",
            "no_hp": "081234567890",
            "alamat": "Medan",
            "role": "STAF"
        },
        "active_activities": 2,
        "requires_replacement": true
    }
}
```

Preview tidak mengubah data. Kegiatan aktif adalah DIRENCANAKAN dan BERJALAN. Jika tidak ada, active_activities = 0 dan requires_replacement = false. Frontend memilih pengganti dari GET /api/users, mengecualikan pengguna yang akan dihapus, lalu menampilkan konfirmasi. Jumlah kegiatan diperiksa ulang saat DELETE; preview bukan jaminan bahwa data belum berubah.

status error: 400 untuk ID tidak valid, 401 token tidak valid, 403 bukan ADMIN, 404 pengguna tidak ditemukan, 409 mencoba menghapus akun sendiri.

## DELETE USER
endpoint : DELETE /api/users/:id

akses: ADMIN

request header:

X-API-TOKEN: token

request parameter:

id: ID pengguna yang akan dihapus, misalnya /api/users/1.

request body:

```json
{
    "confirm": true,
    "replacement_user_id": 2
}
```

confirm wajib boolean true. replacement_user_id berupa number integer positif, wajib jika masih ada kegiatan aktif. Pengganti harus pengguna lain yang terdaftar dengan role ADMIN atau STAF. Jika tidak ada kegiatan aktif, cukup kirim {"confirm": true}. Field tambahan ditolak.

Setelah konfirmasi, server mengalihkan seluruh kegiatan DIRENCANAKAN dan BERJALAN ke pengganti lalu menghapus pengguna dalam satu transaksi. Jika salah satu langkah gagal, seluruh perubahan dibatalkan. Kegiatan SELESAI tidak dialihkan: responsible_user_id menjadi null. Dokumentasi dan file tetap disimpan; uploaded_by menjadi null. Token pengguna yang dihapus tidak dapat digunakan lagi.

Akun sendiri dan ADMIN terakhir tidak dapat dihapus. Response sukses tetap UserResponse pengguna yang dihapus, tanpa password dan token.

status error tambahan:

- 400: konfirmasi tidak valid, ID pengganti tidak valid, pengganti sama dengan target, atau role pengganti tidak didukung.
- 401: token tidak valid.
- 403: bukan ADMIN.
- 404: pengguna target atau pengganti tidak ditemukan.
- 409: akun sendiri, ADMIN terakhir, atau kegiatan aktif belum memiliki pengganti.

Jika kegiatan aktif belum memiliki pengganti, errors = "Select a replacement user for active activities". Pengganti yang tidak ditemukan menghasilkan errors = "Replacement user not found".

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
