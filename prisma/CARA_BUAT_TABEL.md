# Cara Membuat Tabel Database - Langkah Cepat

## ⚠️ PENTING: Lakukan ini SEBELUM `npx prisma db seed`

### Langkah 1: Buka phpMyAdmin
1. Buka browser
2. Ketik: `http://localhost/phpmyadmin`
3. Tekan Enter

### Langkah 2: Pilih Database
- Di sidebar **kiri**, klik database **`temala`**

### Langkah 3: Buka Tab SQL
- Di bagian **atas**, klik tab **`SQL`**

### Langkah 4: Copy-Paste Script
1. Buka file `prisma/create_tables.sql` (sudah terbuka di editor Anda)
2. **Select All** (Ctrl+A) - pilih semua isi file
3. **Copy** (Ctrl+C)
4. Kembali ke phpMyAdmin
5. **Paste** (Ctrl+V) di kotak text area yang besar
6. Klik tombol **`Go`** atau **`Kirim`** di pojok kanan bawah

### Langkah 5: Verifikasi Tabel Terbuat
Setelah klik Go, Anda seharusnya lihat:
- ✅ Pesan sukses
- ✅ Di sidebar kiri muncul tabel-tabel: roles, users, menus, orders, dll.

### Langkah 6: Jalankan Seed
**BARU setelah tabel terbuat**, kembali ke terminal dan jalankan:
```bash
npx prisma db seed
```

## Hasil yang Diharapkan

Jika berhasil, seed command akan output:
```
Seeding database...
Roles created.
Kasir user created: kasir@temala.com / admin123
Client user created: client@temala.com / admin123
Dummy Menus created.
Dummy Events created.
Seeding completed.
```

## Troubleshooting

### Error: "Table already exists"
Jika ada error tabel sudah ada, tambahkan ini di **AWAL** SQL script:
```sql
SET FOREIGN_KEY_CHECKS=0;
```

Dan di **AKHIR** script:
```sql
SET FOREIGN_KEY_CHECKS=1;
```

### Tidak ada tombol "Go"
Tombol mungkin bernama:
- **Kirim**
- **Execute** 
- **Run**

### Database kosong setelah SQL
Refresh halaman (F5) dan cek lagi sidebar kiri.
