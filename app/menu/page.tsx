// app/menu/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  Search, ShoppingCart, Coffee, Plus, User, LogOut, 
  LayoutDashboard, Monitor, ChevronDown, Menu as MenuIcon, X, 
  ShoppingBag, Star, Flame, Utensils, CupSoda, ChefHat 
} from 'lucide-react'
import Image from 'next/image'

// --- TIPE DATA ---
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

export default function MenuPage() {
  const { data: session, status } = useSession()
  // @ts-ignore
  const userRole = session?.user?.role 

  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // 1. FETCH DATA & CART
  useEffect(() => {
    fetch('/api/menus')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setMenus(data)
        setLoading(false)
      })
      .catch(err => setLoading(false))

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
  }, [])

  // 2. FUNGSI KERANJANG
  const addToCart = (menu: Menu) => {
    const currentCart = [...cart]
    const idx = currentCart.findIndex(item => item.id === menu.id)

    if (idx > -1) {
      currentCart[idx].quantity += 1
    } else {
      currentCart.push({ 
        id: menu.id, 
        name: menu.name, 
        price: Number(menu.price), 
        image: menu.image, 
        quantity: 1 
      })
    }

    setCart(currentCart)
    localStorage.setItem('cart', JSON.stringify(currentCart))
    alert(`${menu.name} masuk keranjang!`)
  }

  // Hitung Total untuk Floating Bar
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // 3. FILTER MENU (Promo Masuk, Event Dibuang)
  const filteredMenus = menus.filter(menu => {
    // Logic Kategori:
    // Jika 'All', tampilkan semua KECUALI event
    // Jika kategori dipilih, tampilkan kategori itu saja
    const matchCat = activeCategory === 'All' 
        ? menu.category !== 'event' 
        : menu.category === activeCategory

    const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchCat && matchSearch
  })

  // List Kategori Sidebar
  const categories = [
    { id: 'All', label: 'All Menu', icon: <Utensils size={18}/> },
    { id: 'promo', label: 'Promo Spesial', icon: <Flame size={18} className="text-red-500"/> }, // PROMO ADA DISINI
    { id: 'coffee', label: 'Coffee', icon: <Coffee size={18}/> },
    { id: 'non-coffee', label: 'Non-Coffee', icon: <CupSoda size={18}/> },
    { id: 'signature', label: 'Signature', icon: <Star size={18} className="text-yellow-500"/> },
    { id: 'food', label: 'Food', icon: <Utensils size={18}/> },
    { id: 'snack', label: 'Snack', icon: <ChefHat size={18}/> },
  ]

  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen pb-24">
      
      {/* === NAVBAR === */}
      <nav className="bg-blue-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tighter">TML.</h1>
            </Link>

            {/* Menu Link */}
            <div className="hidden md:flex gap-6 text-sm font-bold items-center">
                <Link href="/" className="hover:text-blue-200 transition">Beranda</Link>
                <Link href="/#about" className="hover:text-blue-200 transition">Tentang Kami</Link>
                <Link href="/menu" className="text-blue-200 underline underline-offset-4">Menu</Link>
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
                            <ChevronDown size={14} className={`transition ${isProfileOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 text-slate-800 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50 rounded-t-xl">Halo, {userRole || 'Pelanggan'}</div>
                                <div className="p-1 space-y-1">
                                    {userRole === 'Admin' && <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-700 text-sm font-bold rounded-lg transition"><LayoutDashboard size={16}/> Dashboard</Link>}
                                    {userRole === 'Kasir' && <Link href="/pos" className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-700 text-sm font-bold rounded-lg transition"><Monitor size={16}/> POS Kasir</Link>}
                                    {(userRole === 'Pelanggan' || !userRole) && <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 text-orange-700 text-sm font-bold rounded-lg transition"><ShoppingBag size={16}/> Pesanan Saya</Link>}
                                </div>
                                <div className="border-t border-slate-100 mt-1 pt-1 p-1">
                                    <button onClick={() => signOut()} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2 rounded-lg transition">
                                        <LogOut size={16}/> Keluar
                                    </button>
                                </div>
                            </div>
                        )}
                     </div>
                ) : (
                    <>
                        <Link href="/login" className="text-white font-bold text-sm hover:text-blue-200 transition">Log In</Link>
                        <Link href="/register" className="bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-100 transition shadow-lg shadow-blue-900/20">Register</Link>
                    </>
                )}
            </div>
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden"><MenuIcon/></button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
            <div className="md:hidden bg-blue-800 p-4 space-y-2 border-t border-blue-600">
                <Link href="/" className="block py-2 text-blue-100 hover:text-white font-bold">Beranda</Link>
                <Link href="/#about" className="block py-2 text-blue-100 hover:text-white font-bold">Tentang Kami</Link>
                <Link href="/menu" className="block py-2 text-white font-bold bg-blue-900/50 px-2 rounded">Menu</Link>
                <Link href="/#promo" className="block py-2 text-blue-100 hover:text-white font-bold">Promo</Link>
                <Link href="/#event" className="block py-2 text-blue-100 hover:text-white font-bold">Event</Link>
                <Link href="/#faq" className="block py-2 text-blue-100 hover:text-white font-bold">FAQ</Link>
            </div>
        )}
      </nav>

      {/* === HERO BANNER: OUR MENU === */}
      <div className="relative w-full h-64 bg-slate-900 overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 bg-black opacity-60"></div> 
         {/* Gambar Background Kopi (Ganti src jika ada) */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1956&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
         
         <h1 className="relative z-10 text-5xl md:text-7xl font-black text-white tracking-[0.2em] uppercase drop-shadow-2xl text-center">
            OUR MENU
         </h1>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-4 py-10">
         
         {/* Search Bar */}
         <div className="flex justify-end mb-8">
            <div className="relative w-full md:w-96">
                <input 
                    type="text" 
                    placeholder="Cari menu favoritmu..." 
                    className="w-full border border-slate-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-1.5 top-1.5 bg-blue-700 text-white p-1.5 rounded-full hover:bg-blue-800 transition">
                    <Search size={16}/>
                </button>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* === 1. SIDEBAR KATEGORI (KIRI) === */}
            <div className="w-full lg:w-1/5 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide shrink-0 sticky top-24 z-10">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm whitespace-nowrap ${
                            activeCategory === cat.id 
                            ? 'bg-[#4b3621] border-[#4b3621] text-white shadow-lg' // Warna Coklat Kopi Aktif
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* === 2. GRID PRODUK (KANAN) === */}
            <div className="flex-1 w-full">
                <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase flex items-center gap-2">
                    <span className="text-blue-600"># {activeCategory === 'All' ? 'Semua Menu' : activeCategory}</span>
                </h2>

                {loading ? <div className="text-center py-20 text-slate-400 font-bold">Sedang memuat menu lezat...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredMenus.map(menu => (
                            <div key={menu.id} className="bg-blue-900 rounded-2xl p-4 flex flex-col shadow-xl hover:shadow-2xl hover:scale-[1.02] transition duration-300 group border border-blue-800">
                                
                                {/* Gambar Produk (Rounded Box) */}
                                <div className="relative w-full h-48 bg-white rounded-xl overflow-hidden mb-4 shadow-inner border-2 border-blue-800">
                                    {menu.image ? (
                                        <Image src={menu.image} alt={menu.name} fill className="object-cover group-hover:scale-110 transition duration-500"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Coffee size={40}/></div>
                                    )}
                                    {/* Label Promo (Jika kategori promo) */}
                                    {menu.category === 'promo' && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-pulse">
                                            PROMO
                                        </div>
                                    )}
                                </div>

                                {/* Info Produk */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-white leading-tight uppercase tracking-wide">{menu.name}</h3>
                                    </div>
                                    
                                    <p className="text-blue-200 text-xs line-clamp-2 mb-4 leading-relaxed font-light">
                                        {menu.description || "Rasakan kenikmatan menu spesial dari Temala Coffee."}
                                    </p>

                                    {/* Harga & Tombol */}
                                    <div className="mt-auto pt-3 border-t border-blue-800/50 flex justify-between items-center">
                                        <div>
                                            <p className="text-yellow-400 font-black text-xl tracking-tight">
                                                Rp {Number(menu.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => addToCart(menu)}
                                            disabled={menu.stock <= 0}
                                            className="bg-white text-blue-900 w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-blue-900 transition shadow-lg disabled:bg-slate-500 disabled:text-slate-300"
                                        >
                                            {menu.stock > 0 ? <Plus size={20} strokeWidth={3}/> : <X size={20}/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {filteredMenus.length === 0 && !loading && (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Coffee size={48} className="mx-auto text-slate-300 mb-2"/>
                        <p className="text-slate-500 font-bold">Yah, menu tidak ditemukan :(</p>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* === FLOATING CART BAR === */}
      {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center animate-in slide-in-from-bottom-5">
              <Link href="/cart" className="bg-blue-800 text-white w-full max-w-4xl rounded-full px-6 py-3 shadow-2xl flex justify-between items-center hover:bg-blue-900 transition border-2 border-blue-500/50">
                  <div className="flex flex-col leading-none">
                      <span className="font-bold text-lg">{totalItems} item di keranjang</span>
                      <span className="text-xs text-blue-200">Klik untuk bayar</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="font-black text-xl text-yellow-400">Rp {totalPrice.toLocaleString()}</span>
                      <div className="bg-white text-blue-800 p-2 rounded-full shadow-lg">
                          <ShoppingCart size={20}/>
                      </div>
                  </div>
              </Link>
          </div>
      )}
    </div>
  )
}