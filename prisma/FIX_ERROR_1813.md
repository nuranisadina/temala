# Fix Error #1813 - Tablespace Conflict

## Masalah
Error: `#1813 - tablespace for table "temala"."roles" exists`

## Solusi Cepat - 3 Langkah

![Panduan Fix Error](C:/Users/lenov/.gemini/antigravity/brain/deef102f-e641-4947-be9d-cd8373540f42/error_fix_guide_1766138521553.png)

### 1️⃣ Hapus SQL Lama di phpMyAdmin
- Di kotak SQL phpMyAdmin yang masih terbuka
- Tekan **Ctrl+A** (select all)
- Tekan **Delete** atau **Backspace**
- Kotak SQL sekarang kosong

### 2️⃣ Copy Script Baru
- Buka file **`create_tables.sql`** di VS Code (sudah saya update)
- Tekan **Ctrl+A** (select all)
- Tekan **Ctrl+C** (copy)

### 3️⃣ Paste & Execute
- Kembali ke phpMyAdmin
- Klik di kotak SQL
- Tekan **Ctrl+V** (paste)
- Klik tombol **`Go`** atau **`Kirim`**

## Hasil yang Diharapkan

✅ Pesan sukses di phpMyAdmin
✅ Tabel-tabel muncul di sidebar kiri: roles, users, menus, orders, dll.

## Setelah Berhasil

Jalankan di terminal:
```bash
npx prisma db seed
```

## Catatan
Script yang baru sudah termasuk:
- `SET FOREIGN_KEY_CHECKS=0;` - nonaktifkan foreign key sementara
- `DROP TABLE IF EXISTS ...;` - hapus tabel lama jika ada
- `CREATE TABLE ...;` - buat tabel baru
- `SET FOREIGN_KEY_CHECKS=1;` - aktifkan kembali foreign key
