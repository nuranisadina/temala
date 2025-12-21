# 📁 Struktur Proyek Temala Coffee

## 🏗️ Arsitektur Folder

```
temala/
├── app/                          # Next.js App Router
│   ├── about/                    # Halaman About
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth authentication
│   │   ├── events/               # CRUD events
│   │   ├── menus/                # CRUD menu items
│   │   ├── orders/               # Order management
│   │   ├── payments/             # Payment processing
│   │   ├── reset-admin/          # Admin password reset
│   │   ├── seed/                 # Database seeding
│   │   ├── upload/               # File upload
│   │   ├── users/                # User management
│   │   └── vouchers/             # Voucher system
│   │       ├── route.ts          # CRUD vouchers (admin)
│   │       ├── active/           # Get active vouchers (public)
│   │       └── apply/            # Apply voucher at checkout
│   │
│   ├── cart/                     # Keranjang belanja
│   ├── client-dashboard/         # Dashboard untuk pelanggan
│   │   ├── cart/                 # Keranjang di dashboard client
│   │   ├── history/              # Riwayat transaksi
│   │   ├── menu/                 # Menu dalam dashboard
│   │   ├── orders/               # Pesanan aktif client
│   │   └── profile/              # Profil pengguna
│   │
│   ├── dashboard/                # Dashboard Admin
│   │   ├── events/               # Manajemen event
│   │   ├── menus/                # Manajemen menu
│   │   ├── promos/               # Manajemen promo banner
│   │   ├── reports/              # Laporan penjualan
│   │   ├── users/                # Manajemen pengguna
│   │   └── vouchers/             # Manajemen voucher
│   │
│   ├── kasir/                    # Dashboard Kasir
│   │   └── reports/              # Laporan kasir
│   │
│   ├── login/                    # Halaman login
│   ├── menu/                     # Halaman menu publik
│   ├── types/                    # TypeScript type definitions
│   │
│   ├── globals.css               # Global CSS styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # Reusable components
│   ├── AuthProvider.tsx          # Auth context provider
│   ├── ClientSidebar.tsx         # Sidebar untuk client dashboard
│   └── PromoBanner.tsx           # Promo/voucher banner
│
├── docs/                         # Dokumentasi
│   ├── PANDUAN_ADMIN.md          # Panduan untuk admin
│   └── PROSES_PESANAN.md         # Alur proses pesanan
│
├── lib/                          # Library utilities
│   └── prisma.ts                 # Prisma client instance
│
├── prisma/                       # Database
│   ├── migrations/               # Migration files
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed data
│   └── dev.db                    # SQLite database
│
├── public/                       # Static assets
│   ├── logo.png                  # Logo website
│   └── uploads/                  # Uploaded files (images)
│
└── [Config Files]
    ├── .env / .env.local         # Environment variables
    ├── package.json              # Dependencies
    ├── tsconfig.json             # TypeScript config
    ├── next.config.ts            # Next.js config
    ├── postcss.config.mjs        # PostCSS config
    └── eslint.config.mjs         # ESLint config
```

## 👥 Role-based Access

| Role | Dashboard | Fitur Utama |
|------|-----------|-------------|
| **Admin** | `/dashboard` | Kelola menu, users, promo, events, laporan |
| **Kasir** | `/kasir` | Proses pesanan, terima pembayaran, laporan |
| **Pelanggan** | `/client-dashboard` | Pesan menu, lihat riwayat, profil |
| **Guest** | `/` (landing) | Lihat menu, promo, tambah keranjang |

## 🔑 Fitur Utama
- ✅ Multi-role authentication (Admin, Kasir, Pelanggan)
- ✅ Menu management dengan kategori
- ✅ Promo banner system
- ✅ Voucher diskon system
- ✅ Event management
- ✅ Order tracking real-time
- ✅ Payment proof upload (QRIS)
- ✅ Laporan penjualan

## 🗑️ File yang Telah Dihapus
- `components/Sidebar.tsx` - Redundan (diganti DashboardContent.tsx)
- `components/ThemeProvider.tsx` - Dark mode tidak digunakan
- `components/ThemeToggle.tsx` - Dark mode tidak digunakan
- `app/(public)/` - Duplikat landing page
- `app/orders/` - Duplikat dengan client-dashboard/orders
