# 👑 Panduan Administrator - Temala Coffee

## 🎯 Peran Admin
Admin adalah pemegang kendali penuh atas sistem Temala Coffee. Tugas utamanya adalah memastikan data master (Menu, User, Promo) selalu up-to-date dan memantau performa bisnis.

---

## 🛠️ Fitur & Fungsi Utama

### 1. Dashboard (`/dashboard`)
Pusat informasi untuk memantau kesehatan bisnis.
- **Fungsi:** Melihat omzet harian/bulanan, jumlah pesanan, dan tren penjualan.
- **Aksi:** Pantau grafik dan angka statistik untuk pengambilan keputusan bisnis.

### 2. Kelola Menu (`/dashboard/menus`)
Tempat mengatur katalog produk makanan dan minuman.
- **Fungsi:** CRUD (Create, Read, Update, Delete) Menu.
- **Tips:** Pastikan foto menu menarik dan harga selalu terupdate.

### 3. Kelola User (`/dashboard/users`)
Tempat mengatur akun pengguna sistem.
- **Fungsi:** Melihat daftar pengguna, mengubah role (misal: mengangkat user jadi Kasir).
- **Keamanan:** Admin bisa menonaktifkan akun yang mencurigakan.

### 4. Kelola Promo (`/dashboard/promos`)
Fitur untuk strategi marketing.
- **Fungsi:** Menambahkan banner promo yang akan muncul di halaman depan pelanggan.
- **Contoh:** "Diskon 50% Hari Kemerdekaan", "Buy 1 Get 1 Kopi Susu".

### 5. Kelola Event (`/dashboard/events`)
Fitur untuk mengelola acara cafe.
- **Fungsi:** Menginformasikan event seperti Live Music, Nobar, atau Workshop.

---

## 🔄 Hubungan dengan Role Lain

| Role | Hubungan dengan Admin |
|------|-----------------------|
| **Kasir** | Admin menyediakan Menu & Harga yang digunakan Kasir untuk bertransaksi. Admin juga memantau hasil kerja Kasir lewat laporan pendapatan. |
| **Pelanggan** | Admin menyediakan konten (Menu, Promo, Event) yang dilihat Pelanggan. Admin tidak berinteraksi langsung dengan pesanan harian pelanggan (tugas Kasir). |

---

## ⚠️ Hal Penting untuk Admin
1. **Hati-hati Menghapus Data:** Menghapus Menu atau User bersifat permanen.
2. **Keamanan Akun:** Jangan berikan password Admin kepada sembarang orang.
3. **Update Berkala:** Rajin update Promo dan Event agar website terasa "hidup".

---
*Dokumen ini dibuat otomatis oleh Asisten AI Temala.*
