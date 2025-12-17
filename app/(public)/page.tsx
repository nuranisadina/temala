// app/(public)/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Coffee, Plus, ShoppingBag } from 'lucide-react'

// 1. Definisikan Tipe Data (Biar TypeScript tidak cerewet)
interface Menu {
  id: number
  name: string
  category: string
  price: number
  image?: string | null
  stock: number
  description?: string
}

interface CartItem {
  id: number
  name: string
  price: number
  image?: string | null
  quantity: number
}

export default function HomePage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('coffee')
  const [cartCount, setCartCount] = useState(0) 

  // 2. Fetch Data & Cek LocalStorage
  useEffect(() => {
    // Ambil Menu dari API
    fetch('/api/menus')
      .then(res => res.json())
      .then(data => {
        setMenus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Gagal ambil menu:", err)
        setLoading(false)
      })

    // Ambil Data Keranjang (Dengan Safety Try-Catch)
    try {
      const savedCartString = localStorage.getItem('cart')
      if (savedCartString) {
        const savedCart: CartItem[] = JSON.parse(savedCartString)
        const totalItems = savedCart.reduce((acc, item) => acc + item.quantity, 0)
        setCartCount(totalItems)
      }
    } catch (e) {
      console.error("Error parsing cart:", e)
      localStorage.removeItem('cart') // Reset jika data korup
    }
  }, [])

  // Filter menu berdasarkan kategori aktif
  const filteredMenus = menus.filter(m => m.category === activeCategory)

  // 3. Fungsi Tambah ke Keranjang
  const addToCart = (menu: Menu) => {
    try {
      // Ambil data lama
      const currentCart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingIndex = currentCart.findIndex((item) => item.id === menu.id)

      if (existingIndex > -1) {
        // Jika menu sudah ada, tambah quantity
        currentCart[existingIndex].quantity += 1
      } else {
        // Jika belum, masukkan item baru
        currentCart.push({ 
          id: menu.id,
          name: menu.name,
          price: Number(menu.price), // Pastikan Number
          image: menu.image,
          quantity: 1 
        })
      }

      // Simpan kembali ke LocalStorage
      localStorage.setItem('cart', JSON.stringify(currentCart))
      
      // Update Badge di UI
      setCartCount(prev => prev + 1)
      
      // Opsional: Ganti alert dengan sesuatu yang lebih halus nanti (seperti Toast)
      alert(`${menu.name} berhasil masuk keranjang!`)
    } catch (error) {
      console.error("Gagal update keranjang", error)
      alert("Gagal menambahkan ke keranjang")
    }
  }

  return (
    <div className="space-y-20 pb-24"> 
      
      {/* 1. HERO SECTION */}
      <section id="about" className="max-w-6xl mx-auto px-4 pt-12">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              TEMALA COFFEE
            </h1>
            <p className="text-slate-600 leading-relaxed text-justify">
              Kedai Kopi Temala merupakan brand kopi modern yang menghadirkan cita rasa otentik.
              Mengusung konsep "Freshly Brewed for Every Moment". Kami menyajikan racikan dari 100% biji kopi terbaik.
            </p>
            <button className="bg-blue-700 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-200">
              Lihat Selengkapnya
            </button>
          </div>
          
          <div className="flex-1 w-full h-[350px] relative bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
             {/* Placeholder Image atau Gambar Asli Hero */}
             <div className="flex items-center justify-center h-full text-slate-400 font-bold bg-slate-50 flex-col">
                <Coffee size={64} className="mb-4 opacity-20"/>
                <span>FOTO INTERIOR / SUASANA</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. MENU CATEGORIES & ITEMS */}
      <section id="menu" className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900">MENU KAMI</h2>
          <p className="text-slate-500">Pilih kategori kesukaanmu</p>
        </div>

        {/* Tombol Kategori */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
          {['coffee', 'non-coffee', 'food', 'snack'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold uppercase transition-all ${
                activeCategory === cat 
                ? 'bg-blue-700 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
             <p className="col-span-full text-center py-12 text-slate-400">Sedang mengambil menu...</p>
          ) : filteredMenus.length === 0 ? (
             <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">Belum ada menu di kategori ini.</p>
             </div>
          ) : (
            filteredMenus.map((menu) => (
              <div key={menu.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition group h-full flex flex-col">
                <div className="relative w-full h-40 bg-slate-100 rounded-lg mb-3 overflow-hidden">
                  {menu.image ? (
                    <Image 
                        src={menu.image} 
                        alt={menu.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <Coffee size={32} />
                    </div>
                  )}
                  {menu.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm z-10">HABIS</div>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-800 text-base line-clamp-1">{menu.name}</h3>
                <div className="flex justify-between items-end mt-auto pt-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Stok: {menu.stock}</p>
                    <span className="text-blue-700 font-bold text-lg">
                      Rp {new Intl.NumberFormat('id-ID').format(menu.price)}
                    </span>
                  </div>
                  <button 
                    onClick={() => addToCart(menu)}
                    disabled={menu.stock <= 0}
                    className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Tambah ke Keranjang"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. PROMO SECTION */}
      <section id="promo" className="max-w-6xl mx-auto px-4">
        <div className="w-full h-64 bg-gradient-to-r from-amber-700 to-orange-600 rounded-2xl flex items-center justify-center text-white relative overflow-hidden shadow-xl">
           <div className="text-center z-10 p-6">
             <h3 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-md">PROMO SPESIAL!</h3>
             <div className="bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-xl inline-block">
                <h4 className="text-xl font-bold mb-1">2 SUSU PANDAN</h4>
                <span className="bg-red-600 text-white px-4 py-1 text-2xl font-black rounded shadow-sm">HANYA 30K!</span>
             </div>
           </div>
        </div>
      </section>

      {/* 4. EVENT & LOCATION */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
         <div id="event">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">EVENT TERBARU</h2>
            <div className="w-full h-64 bg-slate-900 rounded-2xl flex items-center justify-center text-white relative overflow-hidden shadow-lg group cursor-pointer">
               <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/40 transition"></div>
               <h3 className="text-4xl font-black tracking-widest z-10">LIVE MUSIC</h3>
               <p className="absolute bottom-4 text-slate-300 text-sm">Setiap Sabtu Malam</p>
            </div>
         </div>

         <div id="location">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">LOKASI KAMI</h2>
            <div className="w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
               <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full inline-flex mb-3 text-blue-600">
                     <ArrowRight size={32} className="-rotate-45"/>
                  </div>
                  <p className="font-bold text-slate-700">Jl. Temala No. 1, Pekanbaru</p>
                  <p className="text-sm text-slate-500">Buka Setiap Hari: 08.00 - 22.00</p>
               </div>
            </div>
         </div>
      </section>

      {/* 5. TOMBOL KERANJANG MELAYANG */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-[50]">
          <Link 
            href="/cart" 
            className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-xl flex items-center gap-3 font-bold hover:bg-blue-700 hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4"
          >
            <ShoppingBag size={20} />
            Lihat Keranjang ({cartCount})
          </Link>
        </div>
      )}

    </div>
  )
}