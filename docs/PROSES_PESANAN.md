# 📋 Dokumentasi Proses Pesanan - Temala Coffee

## 🎯 Gambaran Umum

Aplikasi Temala Coffee memiliki sistem pemesanan yang terintegrasi antara **Pelanggan (Client)**, **Kasir**, dan **Admin**. Dokumen ini menjelaskan alur proses pesanan dari awal hingga selesai, termasuk alur Dine-in (Makan di Tempat).

---

## 📊 Status Pesanan

| Status | Warna | Deskripsi |
|--------|-------|-----------|
| **Pending** | 🟡 Kuning | Pesanan baru masuk, menunggu diproses kasir |
| **Paid / Diproses** | 🔵 Biru | Pesanan sedang diproses / disiapkan barista |
| **Served / Disajikan** | 🟣 Ungu | Pesanan sudah disajikan ke meja pelanggan (Dine-in) |
| **Completed / Selesai** | 🟢 Hijau | Pesanan selesai dan lunas |
| **Cancelled / Dibatal** | 🔴 Merah | Pesanan dibatalkan |

---

## 🔄 Alur Proses Pesanan

### A. Pesanan dari Pelanggan (Client Dashboard)

```
┌──────────────────────────────────────────────────────────────────┐
│                    ALUR PESANAN CLIENT                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN                                                        │
│     └── Pelanggan login ke akun                                  │
│                                                                  │
│  2. PILIH MENU                                                   │
│     └── Buka halaman Menu → Pilih item → Tambah ke Keranjang     │
│                                                                  │
│  3. CHECKOUT                                                     │
│     └── Buka Keranjang → Isi form → Pilih metode bayar           │
│                                                                  │
│  4. PEMBAYARAN                                                   │
│     ├── [CASH] → Bayar di kasir saat ambil pesanan               │
│     └── [QRIS] → Scan QR → Upload bukti pembayaran               │
│                                                                  │
│  5. MENUNGGU                                                     │
│     └── Lihat status di halaman "Pesanan Saya"                   │
│                                                                  │
│  6. DISAJIKAN (Dine-in)                                          │
│     └── Pesanan diantar ke meja, status "Disajikan"              │
│                                                                  │
│  7. SELESAI                                                      │
│     └── Bayar di kasir (jika Cash) atau konfirmasi selesai       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### B. Proses di Sisi Kasir

```
┌──────────────────────────────────────────────────────────────────┐
│                    ALUR KERJA KASIR                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PESANAN MASUK (Tab: Pesanan Aktif)                              │
│  ════════════════════════════════════                            │
│                                                                  │
│  [KASUS 1] Pembayaran CASH                                       │
│  ─────────────────────────────                                   │
│  Status: PENDING                                                 │
│  Aksi:                                                           │
│    ├── [Proses] → Ubah ke PAID, mulai siapkan pesanan            │
│    └── [Batal]  → Ubah ke CANCELLED jika ada masalah             │
│                                                                  │
│  [KASUS 2] Pembayaran QRIS (dengan bukti)                        │
│  ─────────────────────────────────────────                       │
│  Status: PAID (menunggu verifikasi)                              │
│  Aksi:                                                           │
│    ├── [Lihat Bukti] → Cek gambar bukti transfer                 │
│    ├── [Verifikasi]  → Konfirmasi pembayaran valid               │
│    └── [Tolak]       → Jika bukti tidak valid                    │
│                                                                  │
│  [KASUS 3] Pesanan Sedang Diproses                               │
│  ─────────────────────────────────                               │
│  Status: PAID (sudah diverifikasi / Cash)                        │
│  Aksi:                                                           │
│    ├── [Sajikan] → Pesanan siap diantar, ubah ke SERVED          │
│    └── [Batal]   → Batalkan pesanan                              │
│                                                                  │
│  [KASUS 4] Pesanan Disajikan (Dine-in)                           │
│  ─────────────────────────────────────                           │
│  Status: SERVED                                                  │
│  Aksi:                                                           │
│    ├── [Bayar/Selesai] → Terima pembayaran, ubah ke COMPLETED    │
│                                                                  │
│  RIWAYAT (Tab: Riwayat)                                          │
│  ══════════════════════                                          │
│  Status: COMPLETED / CANCELLED                                   │
│  Aksi:                                                           │
│    ├── [Cetak Struk] → Print receipt                             │
│    └── [Hapus]       → Hapus dari database (Admin only)          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛒 Detail Proses Per Metode Pembayaran

### 1. Pembayaran TUNAI (Cash) - Dine In

```
PELANGGAN                     KASIR                      STATUS
═══════════════════════════════════════════════════════════════════
   │                           │                           │
   │ Checkout (Cash)           │                           │
   │ ─────────────────────────►│                      [PENDING]
   │                           │                           │
   │                           │ Klik "Proses"             │
   │                           │ ─────────────────────────►│
   │                           │                      [PAID/DIPROSES]
   │                           │                           │
   │                           │ Siapkan pesanan           │
   │                           │ ...                       │
   │                           │                           │
   │                           │ Klik "Sajikan"            │
   │                           │ ─────────────────────────►│
   │                           │                      [SERVED/DISAJIKAN]
   │ Makan...                  │                           │
   │                           │                           │
   │ Datang ke kasir           │ Terima uang cash          │
   │ ─────────────────────────►│                           │
   │                           │                           │
   │                           │ Klik "Bayar/Selesai"      │
   │                           │ ─────────────────────────►│
   │                           │                      [COMPLETED]
   │                           │                           │
═══════════════════════════════════════════════════════════════════
```

### 2. Pembayaran QRIS (Non-Tunai)

```
PELANGGAN                     KASIR                      STATUS
═══════════════════════════════════════════════════════════════════
   │                           │                           │
   │ Checkout (QRIS)           │                           │
   │ Scan QR Code              │                           │
   │ Upload bukti              │                           │
   │ ─────────────────────────►│                      [PAID]
   │                           │                    (Menunggu Verifikasi)
   │                           │                           │
   │                           │ Klik "Verifikasi"         │
   │                           │ ─────────────────────────►│
   │                           │                      [PAID/DIPROSES]
   │                           │                    (Terverifikasi)
   │                           │                           │
   │                           │ Klik "Sajikan"            │
   │                           │ ─────────────────────────►│
   │                           │                      [SERVED/DISAJIKAN]
   │ Makan...                  │                           │
   │                           │                           │
   │ Selesai makan             │ Klik "Selesai"            │
   │ ─────────────────────────►│ ─────────────────────────►│
   │                           │                      [COMPLETED]
   │                           │                           │
═══════════════════════════════════════════════════════════════════
```

---

## 💻 Lokasi Halaman di Aplikasi

### Pelanggan (Client)
| Halaman | URL | Fungsi |
|---------|-----|--------|
| Dashboard | `/client-dashboard` | Ringkasan statistik |
| Menu | `/client-dashboard/menu` | Pilih menu |
| Keranjang | `/client-dashboard/cart` | Review & checkout |
| Pesanan Saya | `/client-dashboard/orders` | Lihat status pesanan |
| Riwayat | `/client-dashboard/history` | Riwayat pesanan |
| Profil | `/client-dashboard/profile` | Edit profil |

### Kasir
| Halaman | URL | Fungsi |
|---------|-----|--------|
| Dashboard | `/kasir` | POS Manual + Pesanan masuk |
| Laporan | `/kasir/reports` | Kelola pesanan + Verifikasi |

### Admin
| Halaman | URL | Fungsi |
|---------|-----|--------|
| Dashboard | `/dashboard` | Statistik keseluruhan |
| Kelola Menu | `/dashboard/menus` | CRUD menu |
| Kelola User | `/dashboard/users` | CRUD pengguna |
| Transaksi | `/dashboard/orders` | Lihat semua transaksi |
| Pengaturan | `/dashboard/settings` | Konfigurasi sistem |

---

## 🔌 API Endpoints

### Orders
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/orders` | Ambil semua pesanan |
| GET | `/api/orders?user_id=X` | Pesanan per user |
| GET | `/api/orders?status=X` | Filter by status |
| POST | `/api/orders` | Buat pesanan baru |
| PATCH | `/api/orders/[id]` | Update status pesanan |
| DELETE | `/api/orders/[id]` | Hapus pesanan |

### Payments
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/payments` | Ambil semua pembayaran |
| GET | `/api/payments/[id]` | Detail pembayaran |
| PATCH | `/api/payments/[id]` | Verifikasi pembayaran |

### Upload
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/upload` | Upload bukti pembayaran |

---

## 📱 Notifikasi & Sinkronisasi

### Auto-Refresh
- **Client Dashboard**: 15 detik
- **Client Orders**: 10 detik  
- **Kasir Reports**: 10 detik
- **Admin Dashboard**: 15 detik

### Badge Notifikasi Kasir
- 🔔 Muncul jika ada pesanan dengan bukti pembayaran yang perlu diverifikasi
- Angka menunjukkan jumlah pesanan pending verifikasi

---

## 📋 Checklist Proses Kasir

### Pesanan Baru Masuk
- [ ] Buka halaman Laporan Kasir
- [ ] Lihat tab "Pesanan Aktif"
- [ ] Cek pesanan dengan status Pending/Menunggu Verifikasi

### Untuk Pembayaran Cash
- [ ] Klik tombol "Proses" untuk mulai siapkan
- [ ] Siapkan pesanan
- [ ] Klik tombol "Sajikan" saat pesanan siap diantar
- [ ] Terima uang dari pelanggan setelah selesai makan
- [ ] Klik tombol "Bayar" untuk menyelesaikan pesanan
- [ ] (Opsional) Cetak struk

### Untuk Pembayaran QRIS
- [ ] Lihat badge notifikasi 🔔
- [ ] Klik "Lihat Bukti" untuk cek screenshot
- [ ] Klik "Verifikasi" jika valid
- [ ] Siapkan pesanan
- [ ] Klik tombol "Sajikan" saat pesanan siap diantar
- [ ] Klik tombol "Selesai" setelah pelanggan selesai
- [ ] (Opsional) Cetak struk

### Jika Ada Masalah
- [ ] Klik "Tolak" untuk pembayaran tidak valid
- [ ] Klik "Batal" untuk membatalkan pesanan
- [ ] Hubungi pelanggan jika perlu

---

## 🔒 Hak Akses

| Role | Buat Pesanan | Proses Pesanan | Verifikasi | Hapus Pesanan | Kelola Menu |
|------|--------------|----------------|------------|---------------|-------------|
| Pelanggan | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kasir | ✅ (POS) | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ❓ FAQ

### Q: Bagaimana jika pelanggan lupa upload bukti QRIS?
**A:** Pesanan akan tetap dengan status "Pending". Kasir bisa menghubungi pelanggan atau memproses sebagai Cash.

### Q: Bagaimana jika bukti pembayaran tidak valid?
**A:** Kasir klik "Tolak", pesanan akan dibatalkan. Pelanggan perlu membuat pesanan baru.

### Q: Apakah pesanan bisa diedit setelah checkout?
**A:** Tidak bisa. Pelanggan harus membatalkan dan membuat pesanan baru.

### Q: Berapa lama data pesanan disimpan?
**A:** Semua data tersimpan di database. Admin bisa menghapus secara manual dari halaman riwayat.

---

## 📞 Support

Jika ada pertanyaan atau kendala teknis, hubungi tim development.

---

*Dokumentasi ini terakhir diperbarui: 21 Desember 2024*
