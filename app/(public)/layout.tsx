// app/(public)/layout.tsx
'use client'

import Link from 'next/link'
import { Instagram, Phone, User, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession() // Cek status login
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800">
      
      {/* NAVBAR BIRU */}
      <nav className="bg-blue-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-extrabold text-2xl tracking-tighter">
            TML.
          </Link>

          {/* Menu Link (Desktop) */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-blue-200 transition">Beranda</Link>
            <Link href="#about" className="hover:text-blue-200 transition">Tentang Kami</Link>
            <Link href="#menu" className="hover:text-blue-200 transition">Menu</Link>
            <Link href="#promo" className="hover:text-blue-200 transition">Promo</Link>
          </div>

          {/* AREA DINAMIS: Login vs Profil User */}
          <div className="flex gap-3 items-center">
            
            {status === 'loading' ? (
              // 1. Sedang Memuat (Tampilkan placeholder kosong atau spinner kecil)
              <div className="text-xs text-blue-300">Memuat...</div>
            
            ) : session ? (
              // 2. SUDAH LOGIN (Tampilkan Nama User & Dropdown Logout)
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 rounded-lg hover:bg-blue-900 transition"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs text-blue-200 font-light">Halo,</p>
                    <p className="text-sm font-bold leading-none max-w-[100px] truncate">{session.user?.name}</p>
                  </div>
                </button>

                {/* Dropdown Menu (Muncul saat diklik) */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 text-slate-800 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-sm truncate">{session.user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                )}
              </div>

            ) : (
              // 3. BELUM LOGIN (Tampilkan Tombol Login/Register)
              <>
                <Link href="/login" className="px-5 py-1.5 border border-white rounded text-sm font-medium hover:bg-white hover:text-blue-700 transition">
                  Log In
                </Link>
                <Link href="/register" className="px-5 py-1.5 bg-blue-500 rounded text-sm font-medium hover:bg-blue-600 transition hidden sm:block">
                  Register
                </Link>
              </>
            )}

          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER (Tetap sama) */}
      <footer className="bg-blue-700 text-white pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h2 className="text-4xl font-extrabold mb-4">TML.</h2>
            <p className="text-blue-200 text-sm">coffee & more</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Produk</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>Coffee</li>
              <li>Non Coffee</li>
              <li>Signature</li>
              <li>Snack</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Informasi</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>Beranda</li>
              <li>Tentang Kami</li>
              <li>Menu</li>
              <li>Promo</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Kontak</h3>
            <div className="flex gap-4 text-blue-100">
              <Phone size={24} />
              <Instagram size={24} />
            </div>
            <p className="text-sm mt-4 text-blue-200">Jl. Temala No. 1</p>
          </div>
        </div>
        <div className="text-center text-xs text-blue-300 border-t border-blue-600 pt-6">
          &copy; 2025 Temala Coffee. All rights reserved.
        </div>
      </footer>
    </div>
  )
}