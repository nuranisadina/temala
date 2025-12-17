// app/about/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingBag, Coffee, User, LogOut, LayoutDashboard, Monitor, ChevronDown, Menu as MenuIcon, X, MapPin, Award, Users, Heart } from 'lucide-react'

export default function AboutPage() {
  const { data: session, status } = useSession()
  // @ts-ignore
  const userRole = session?.user?.role 

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Cek Keranjang (Untuk Badge Navbar/Floating)
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const total = savedCart.reduce((acc: number, item: any) => acc + item.quantity, 0)
      setCartCount(total)
    } catch (e) {}
  }, [])

  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen">
      
      {/* === NAVBAR (KONSISTEN) === */}
      <nav className="bg-blue-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            <Link href="/" className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tighter">TML.</h1>
            </Link>

            {/* Menu Link (Pakai /# agar balik ke Home) */}
            <div className="hidden md:flex gap-6 text-sm font-bold items-center">
                <Link href="/" className="hover:text-blue-200 transition">Beranda</Link>
                <Link href="/about" className="text-blue-200 underline underline-offset-4">Tentang Kami</Link>
                <Link href="/menu" className="hover:text-blue-200 transition">Menu</Link>
                <Link href="/#promo" className="hover:text-blue-200 transition">Promo</Link>
                <Link href="/#event" className="hover:text-blue-200 transition">Event</Link>
                <Link href="/#faq" className="hover:text-blue-200 transition">FAQ</Link>
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex gap-4 items-center">
                {status === 'authenticated' ? (
                     <div className="relative">
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-blue-800/50 hover:bg-blue-800 px-3 py-1.5 rounded-full transition border border-blue-500">
                            <div className="w-8 h-8 bg-white text-blue-700 rounded-full flex items-center justify-center"><User size={18} /></div>
                            <span className="text-sm font-bold pr-1">{session?.user?.name}</span>
                            <ChevronDown size={14}/>
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 text-slate-800 border border-slate-100 z-50">
                                {userRole === 'Admin' && <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold"><LayoutDashboard size={16}/> Dashboard</Link>}
                                {userRole === 'Kasir' && <Link href="/pos" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm font-bold"><Monitor size={16}/> POS Kasir</Link>}
                                {(userRole === 'Pelanggan' || !userRole) && <Link href="/orders" className="block px-4 py-2 hover:bg-slate-50 text-sm font-bold">Pesanan Saya</Link>}
                                <button onClick={() => signOut()} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2"><LogOut size={16}/> Keluar</button>
                            </div>
                        )}
                     </div>
                ) : (
                    <>
                        <Link href="/login" className="text-white font-bold text-sm hover:text-blue-200 transition">Log In</Link>
                        <Link href="/register" className="bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-100 transition">Register</Link>
                    </>
                )}
            </div>
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden"><MenuIcon/></button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden bg-blue-800 p-4 space-y-2 border-t border-blue-600">
                <Link href="/" className="block py-2 text-blue-100 font-bold">Beranda</Link>
                <Link href="/about" className="block py-2 text-white bg-blue-900/50 px-2 rounded font-bold">Tentang Kami</Link>
                <Link href="/menu" className="block py-2 text-blue-100 font-bold">Menu</Link>
            </div>
        )}
      </nav>

      {/* === BANNER HEADER === */}
      <div className="relative w-full h-80 bg-slate-900 overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 bg-blue-900/80 z-10"></div> 
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
         <div className="relative z-20 text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase">Tentang Kami</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">Mengenal lebih dekat perjalanan Temala Coffee.</p>
         </div>
      </div>

      {/* === CONTENT: CERITA KAMI === */}
      <section className="max-w-6xl mx-auto px-6 py-20">
         <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
               <span className="text-blue-600 font-black tracking-widest text-sm uppercase">Sejarah Kami</span>
               <h2 className="text-4xl font-black text-slate-900">BERAWAL DARI MIMPI SEDERHANA.</h2>
               <p className="text-slate-600 leading-relaxed text-justify">
                  Temala Coffee didirikan pada tahun 2023 di Pekanbaru. Bermula dari kecintaan kami terhadap biji kopi lokal Indonesia, kami bermimpi untuk menciptakan tempat di mana kopi berkualitas bertemu dengan kenyamanan.
               </p>
               <p className="text-slate-600 leading-relaxed text-justify">
                  Nama "Temala" diambil dari filosofi lokal yang berarti "Tempat Meramu Rasa". Kami percaya bahwa setiap cangkir kopi memiliki cerita, dan kami ingin menjadi bagian dari cerita keseharian Anda.
               </p>
            </div>
            <div className="flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="h-64 bg-slate-200 rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80" className="w-full h-full object-cover hover:scale-110 transition"/>
                  </div>
                  <div className="h-64 bg-slate-200 rounded-2xl overflow-hidden mt-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1447933601403-0c60e017bc32?auto=format&fit=crop&q=80" className="w-full h-full object-cover hover:scale-110 transition"/>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* === VISI MISI === */}
      <section className="bg-slate-50 py-20">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-black text-slate-900">KENAPA TEMALA?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition duration-300">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                     <Award size={32}/>
                  </div>
                  <h3 className="font-bold text-xl mb-3">Kualitas Terbaik</h3>
                  <p className="text-slate-500 text-sm">Kami hanya menggunakan 100% biji kopi Arabica & Robusta pilihan dari petani lokal.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition duration-300">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
                     <Users size={32}/>
                  </div>
                  <h3 className="font-bold text-xl mb-3">Barista Ahli</h3>
                  <p className="text-slate-500 text-sm">Disajikan oleh barista terlatih yang mengerti seni menyeduh kopi dengan hati.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition duration-300">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                     <Heart size={32}/>
                  </div>
                  <h3 className="font-bold text-xl mb-3">Tempat Nyaman</h3>
                  <p className="text-slate-500 text-sm">Suasana interior yang cozy, cocok untuk bekerja (WFC) atau sekadar nongkrong.</p>
               </div>
            </div>
         </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-blue-700 text-white pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
             <h2 className="text-4xl font-black mb-4">TML.</h2>
             <p className="text-blue-200 mb-8">Terima kasih telah menjadi bagian dari perjalanan kami.</p>
             <div className="text-xs text-blue-300 border-t border-blue-600 pt-8">
                &copy; 2025 Temala Coffee.
             </div>
          </div>
      </footer>

      {/* KERANJANG MELAYANG */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-[999]">
          <Link href="/cart" className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold">
            <ShoppingBag size={20} />
            <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center -ml-1">{cartCount}</span>
            <span>Lihat Keranjang</span>
          </Link>
        </div>
      )}

    </div>
  )
}