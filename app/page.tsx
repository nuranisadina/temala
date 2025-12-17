'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' 
import { useRouter } from 'next/navigation' // <-- Tambahan untuk redirect
import { useSession, signOut } from 'next-auth/react'
import { Coffee, Plus, MapPin, Instagram, Facebook, Phone, Menu as MenuIcon, X, LogOut, LayoutDashboard, Monitor, HelpCircle, ChevronDown, User, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'

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

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter() // <-- Inisialisasi router
  
  // @ts-ignore
  const userRole = session?.user?.role 

  const [menus, setMenus] = useState<Menu[]>([])
  const [promos, setPromos] = useState<Menu[]>([])
  const [events, setEvents] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('coffee')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false) 

  // --- LOGIKA AUTO-REDIRECT (MENCEGAH ADMIN TERJEBAK DI BERANDA) ---
  useEffect(() => {
    if (status === 'authenticated' && userRole) {
      // Kita ubah ke lowercase agar perbandingan lebih aman (Admin/admin)
      const role = userRole.toString().toLowerCase();
      
      if (role === 'admin') {
        router.replace('/dashboard');
      } else if (role === 'kasir') {
        router.replace('/kasir');
      }
    }
  }, [status, userRole, router]);

  // --- FETCH DATA ---
  useEffect(() => {
    fetch('/api/menus')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
            setMenus(data)
            setPromos(data.filter((item: Menu) => item.category === 'promo'))
            setEvents(data.filter((item: Menu) => item.category === 'event'))
        }
        setLoading(false)
      })
      .catch(err => setLoading(false))
  }, [])

  // --- CART FUNCTION ---
  const addToCart = (menu: Menu) => {
    try {
      const currentCart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]')
      const idx = currentCart.findIndex((item) => item.id === menu.id)

      if (idx > -1) currentCart[idx].quantity += 1
      else currentCart.push({ id: menu.id, name: menu.name, price: Number(menu.price), image: menu.image, quantity: 1 })

      localStorage.setItem('cart', JSON.stringify(currentCart))
      alert(`${menu.name} masuk keranjang! Cek di halaman Menu.`)
    } catch (error) {
      console.error(error)
    }
  }

  const filteredMenus = menus.filter(m => m.category === activeCategory)

  // --- FUNGSI SCROLL HALUS UNTUK NAVBAR ---
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault(); 
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); 
    }
  };

  // --- LOADING OVERLAY SAAT REDIRECT ---
  // Jika sudah login sebagai Admin/Kasir, tampilkan loader agar tidak melihat beranda pelanggan
  if (status === 'authenticated' && (userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'kasir')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse">Mengalihkan ke Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 bg-white scroll-smooth">
      
      {/* === NAVBAR === */}
      <nav className="bg-blue-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* 1. Logo */}
            <div className="flex items-center gap-2">
                <a href="#" onClick={(e) => scrollToSection(e, 'home')} className="text-2xl font-black tracking-tighter cursor-pointer">
                    TML.
                </a>
            </div>

            {/* 2. Menu Link (SCROLL KE BAWAH) */}
            <div className="hidden md:flex gap-6 text-sm font-bold items-center">
                <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-blue-200 transition cursor-pointer">Beranda</a>
                <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-blue-200 transition cursor-pointer">Tentang Kami</a>
                <a href="#menu" onClick={(e) => scrollToSection(e, 'menu')} className="hover:text-blue-200 transition cursor-pointer">Menu</a>
                <a href="#promo" onClick={(e) => scrollToSection(e, 'promo')} className="hover:text-blue-200 transition cursor-pointer">Promo</a>
                <a href="#event" onClick={(e) => scrollToSection(e, 'event')} className="hover:text-blue-200 transition cursor-pointer">Event</a>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-blue-200 transition cursor-pointer">FAQ</a>
                <a href="#location" onClick={(e) => scrollToSection(e, 'location')} className="hover:text-blue-200 transition cursor-pointer">Lokasi</a>
            </div>

            {/* 3. Auth Section */}
            <div className="hidden md:flex gap-4 items-center">
                {status === 'authenticated' ? (
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)} 
                            className="flex items-center gap-2 bg-blue-800/50 hover:bg-blue-800 px-3 py-1.5 rounded-full transition border border-blue-500"
                        >
                            <div className="w-8 h-8 bg-white text-blue-700 rounded-full flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <span className="text-sm font-bold pr-1">{session?.user?.name}</span>
                            <ChevronDown size={14} className={`transition ${isProfileOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 text-slate-800 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50 rounded-t-xl">
                                    Halo, {userRole || 'Pelanggan'}
                                </div>
                                <div className="p-1 space-y-1">
                                    {userRole === 'Admin' && (
                                        <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-700 text-sm font-bold rounded-lg transition">
                                            <LayoutDashboard size={16}/> Dashboard
                                        </Link>
                                    )}
                                    {userRole === 'Kasir' && (
                                        <Link href="/pos" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-700 text-sm font-bold rounded-lg transition">
                                            <Monitor size={16}/> POS Kasir
                                        </Link>
                                    )}
                                </div>
                                <div className="border-t border-slate-100 mt-1 pt-1 p-1">
                                    <button 
                                        onClick={() => signOut()} 
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2 rounded-lg transition"
                                    >
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

             {/* Mobile Menu Toggle */}
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
                {isMenuOpen ? <X/> : <MenuIcon/>}
             </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
            <div className="md:hidden bg-blue-800 p-4 space-y-2 border-t border-blue-600">
                <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="block py-2 text-blue-100 hover:text-white font-bold">Beranda</a>
                <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="block py-2 text-blue-100 hover:text-white font-bold">Tentang Kami</a>
                <a href="#menu" onClick={(e) => scrollToSection(e, 'menu')} className="block py-2 text-blue-100 hover:text-white font-bold">Menu</a>
                <a href="#promo" onClick={(e) => scrollToSection(e, 'promo')} className="block py-2 text-blue-100 hover:text-white font-bold">Promo</a>
                <a href="#event" onClick={(e) => scrollToSection(e, 'event')} className="block py-2 text-blue-100 hover:text-white font-bold">Event</a>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="block py-2 text-blue-100 hover:text-white font-bold">FAQ</a>
                <a href="#location" onClick={(e) => scrollToSection(e, 'location')} className="block py-2 text-blue-100 hover:text-white font-bold">Lokasi</a>
                
                <div className="border-t border-blue-600 pt-4 mt-2">
                    {status === 'authenticated' ? (
                         <div className="flex flex-col gap-3">
                            <span className="text-xs text-blue-300 font-bold">Halo, {session?.user?.name}</span>
                            <button onClick={() => signOut()} className="text-center text-red-300 py-2 font-bold hover:text-white">Keluar</button>
                         </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/login" className="block text-center border border-white py-2 rounded font-bold text-white">Log In</Link>
                            <Link href="/register" className="block text-center bg-white text-blue-700 py-2 rounded font-bold">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        )}
      </nav>

      {/* ID: HOME (Untuk Scroll ke Atas) */}
      <div id="home"></div>

      {/* === HERO SECTION (TENTANG KAMI) === */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-16 md:py-24 scroll-mt-28">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-tight">
              TEMALA COFFEE
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed text-justify">
              Kedai Kopi Temala merupakan brand kopi modern yang menghadirkan cita rasa otentik. 
              Mengusung konsep "Freshly Brewed for Every Moment". Kami menyajikan racikan dari 100% biji kopi terbaik Indonesia.
            </p>
            <div className="pt-2">
              <Link href="/about" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-lg inline-flex items-center gap-2">
                Lihat Selengkapnya <ArrowRight size={18}/>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="relative h-[350px] md:h-[450px] w-full rounded-tr-[50px] rounded-bl-[50px] overflow-hidden shadow-2xl border-4 border-white">
                <Image 
                    src="/uploads/LATAR.JPG" 
                    alt="Latar Belakang Interior Temala Coffee"
                    fill 
                    style={{ objectFit: 'cover' }}
                    priority 
                />
            </div>
          </div>
        </div>
      </section>

      {/* === MENU PREVIEW SECTION === */}
      <section id="menu" className="bg-slate-50 py-16 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-2">MENU</h2>
                <p className="text-slate-500 text-lg">Nikmati kelezatan coffee & more</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-10 justify-center md:justify-start">
            {['coffee', 'non-coffee', 'food', 'snack'].map((cat) => (
                <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-2 rounded-full font-bold uppercase tracking-wide transition-all border ${
                    activeCategory === cat 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                    : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'
                }`}
                >
                {cat.replace('-', ' ')}
                </button>
            ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? <p className="col-span-4 text-center text-slate-400">Memuat menu...</p> : filteredMenus.slice(0, 8).map((menu) => (
                <div key={menu.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col h-full group">
                <div className="relative h-40 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                    {menu.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Coffee size={32}/></div>
                    )}
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-1 text-slate-800 uppercase">{menu.name}</h3>
                
                <div className="mt-auto flex justify-between items-end pt-2">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Stok: {menu.stock}</p>
                        <p className="text-blue-700 font-bold text-lg">Rp {menu.price.toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={() => addToCart(menu)} 
                        disabled={menu.stock <= 0}
                        className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-md disabled:bg-slate-300"
                    >
                        <Plus size={20}/>
                    </button>
                </div>
                </div>
            ))}
            </div>
            
            <div className="text-center mt-12">
                <Link href="/menu" className="bg-blue-700 text-white px-10 py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-lg inline-flex items-center gap-2">
                    Lihat Semua Menu <ArrowRight size={18}/>
                </Link>
            </div>
        </div>
      </section>

      {/* === PROMO SECTION === */}
      <section id="promo" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-28">
        <h2 className="text-4xl font-black text-slate-900 mb-2">PROMO</h2>
        <p className="text-slate-500 mb-8">Penawaran terbaik minggu ini!</p>
        
        {promos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {promos.map((promo) => (
                    <div 
                        key={promo.id} 
                        onClick={() => addToCart(promo)}
                        className="w-full h-[300px] rounded-3xl overflow-hidden relative shadow-2xl cursor-pointer group hover:scale-[1.02] transition duration-300"
                    >
                        {promo.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={promo.image} alt={promo.name} className="w-full h-full object-cover"/>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-orange-800 flex flex-col items-center justify-center text-white p-6 text-center">
                                <Coffee size={64} className="mb-4 opacity-80"/>
                                <h3 className="text-3xl font-black mb-4 uppercase">{promo.name}</h3>
                            </div>
                        )}
                        <div className="absolute bottom-6 right-6 bg-red-600 text-white px-6 py-2 text-xl font-black rounded-lg shadow-xl -rotate-2 group-hover:rotate-0 transition">
                            HANYA Rp {promo.price.toLocaleString()}!
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="w-full h-[300px] rounded-3xl overflow-hidden relative shadow-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                <p>Belum ada promo aktif.</p>
            </div>
        )}
      </section>

      {/* === EVENT SECTION === */}
      <section id="event" className="max-w-7xl mx-auto px-6 py-8 mb-12 scroll-mt-28">
         <h2 className="text-4xl font-black text-slate-900 mb-2">EVENT</h2>
         <p className="text-slate-500 mb-8">Keseruan di Temala!</p>
         
         {events.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                 {events.map((event) => (
                     <div key={event.id} className="w-full h-[250px] bg-slate-900 rounded-3xl overflow-hidden relative flex items-center justify-center shadow-xl group cursor-pointer">
                        {event.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={event.image} alt={event.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition"/>
                        ) : (
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
                        )}
                        <div className="relative z-10 text-center">
                            <h3 className="text-5xl md:text-7xl font-black text-white tracking-widest drop-shadow-lg uppercase">{event.name}</h3>
                            <p className="absolute -bottom-10 left-0 right-0 text-slate-300 font-bold tracking-wider bg-black/50 px-4 py-1 rounded-full">
                                {event.description}
                            </p>
                        </div>
                     </div>
                 ))}
             </div>
         ) : (
             <div className="w-full h-[250px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 border border-dashed border-slate-300">
                Belum ada event mendatang.
             </div>
         )}
      </section>

      {/* === FAQ === */}
      <section id="faq" className="bg-slate-50 py-16 scroll-mt-28">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-8">FAQ</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-left space-y-4">
                <div className="border-b pb-4">
                    <h4 className="font-bold flex items-center gap-2"><HelpCircle size={18} className="text-blue-600"/> Jam berapa Temala buka?</h4>
                    <p className="text-slate-500 mt-1 pl-7">Kami buka setiap hari dari jam 08.00 pagi sampai 23.00 malam.</p>
                </div>
                <div>
                    <h4 className="font-bold flex items-center gap-2"><HelpCircle size={18} className="text-blue-600"/> Apakah ada WiFi?</h4>
                    <p className="text-slate-500 mt-1 pl-7">Tentu! Kami menyediakan WiFi kencang gratis untuk pelanggan.</p>
                </div>
            </div>
         </div>
      </section>

      {/* === LOKASI === */}
      <section id="location" className="py-16 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-8">LOKASI</h2>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-[300px] bg-white rounded-3xl flex items-center justify-center border border-slate-200 shadow-sm mx-auto max-w-4xl hover:shadow-xl hover:border-blue-300 transition group cursor-pointer"
            >
                <div className="text-center text-slate-400 group-hover:text-blue-600 transition">
                    <MapPin size={48} className="mx-auto mb-2 text-red-500 group-hover:scale-110 transition"/>
                    <p className="font-bold text-slate-800">Google Maps Area</p>
                    <p className="text-sm">Jl. Temala No. 1, Pekanbaru</p>
                </div>
            </a>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-blue-700 text-white pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
               <h2 className="text-5xl font-black mb-2 tracking-tighter">TML.</h2>
               <p className="text-blue-100 text-sm opacity-80">coffee & more</p>
            </div>
            <div>
               <h4 className="font-bold text-lg mb-4 text-blue-100">Informasi</h4>
               <ul className="space-y-2 text-sm opacity-80">
                  <li><a href="#" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-white hover:underline cursor-pointer">Beranda</a></li>
                  <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white hover:underline cursor-pointer">Tentang Kami</a></li>
                  <li><Link href="/menu" className="hover:text-white hover:underline">Menu</Link></li>
                  <li><a href="#promo" onClick={(e) => scrollToSection(e, 'promo')} className="hover:text-white hover:underline cursor-pointer">Promo</a></li>
                  <li><a href="#event" onClick={(e) => scrollToSection(e, 'event')} className="hover:text-white hover:underline cursor-pointer">Event</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-lg mb-4 text-blue-100">Kontak</h4>
               <p className="text-sm opacity-80 mb-4">Jl. Temala No. 1, Pekanbaru</p>
               <div className="flex gap-4">
                  <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white hover:text-blue-700 transition"><Instagram size={20}/></a>
                  <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white hover:text-blue-700 transition"><Facebook size={20}/></a>
                  <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white hover:text-blue-700 transition"><Phone size={20}/></a>
               </div>
            </div>
         </div>
         <div className="text-center text-blue-300 text-xs border-t border-blue-600 pt-8 mx-6">
            © 2025 Temala Coffee. All rights reserved.
         </div>
      </footer>
    </div>
  )
}