// app/menu/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
    Search, ShoppingCart, Coffee, Plus, User, LogOut,
    LayoutDashboard, Monitor, ChevronDown, Menu as MenuIcon, X,
    ShoppingBag, Star, Flame, Utensils, CupSoda, ChefHat, ArrowRight,
    Home, ClipboardList, Settings, Bell
} from 'lucide-react'
import Image from 'next/image'

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
    const userRole = session?.user?.role?.toLowerCase()

    const [menus, setMenus] = useState<Menu[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    useEffect(() => {
        fetch('/api/menus')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMenus(data)
                setLoading(false)
            })
            .catch(err => setLoading(false))

        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
        setCart(savedCart)
    }, [])

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

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const filteredMenus = menus.filter(menu => {
        const matchCat = activeCategory === 'All'
            ? menu.category !== 'event'
            : menu.category === activeCategory
        const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCat && matchSearch
    })

    const categories = [
        { id: 'All', label: 'All Menu', icon: <Utensils size={18} /> },
        { id: 'promo', label: 'Promo Spesial', icon: <Flame size={18} className="text-red-500" /> },
        { id: 'coffee', label: 'Coffee', icon: <Coffee size={18} /> },
        { id: 'non-coffee', label: 'Non-Coffee', icon: <CupSoda size={18} /> },
        { id: 'signature', label: 'Signature', icon: <Star size={18} className="text-yellow-500" /> },
        { id: 'food', label: 'Food', icon: <Utensils size={18} /> },
        { id: 'snack', label: 'Snack', icon: <ChefHat size={18} /> },
    ]

    // Determine dashboard link based on role
    const getDashboardLink = () => {
        if (userRole === 'admin') return '/dashboard'
        if (userRole === 'kasir') return '/kasir'
        return '/client-dashboard'
    }

    return (
        <div className="font-sans text-slate-200 bg-slate-950 min-h-screen pb-24 selection:bg-blue-500/30">

            {/* === NAVBAR === */}
            <nav className="bg-slate-900/80 backdrop-blur-xl text-white sticky top-0 z-50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link href={status === 'authenticated' ? getDashboardLink() : '/'} className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                            <Coffee size={24} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase">Temala.</span>
                    </Link>

                    {/* Navigation Links - Different for logged in users */}
                    {status === 'authenticated' ? (
                        // Dashboard-style Navigation for logged in users
                        <div className="hidden md:flex gap-6 text-xs font-black uppercase tracking-widest items-center">
                            <Link href={getDashboardLink()} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                <Home size={16} /> Dashboard
                            </Link>
                            <Link href="/menu" className="flex items-center gap-2 text-blue-500">
                                <Coffee size={16} /> Menu
                            </Link>
                            <Link href="/cart" className="flex items-center gap-2 hover:text-blue-400 transition-colors relative">
                                <ShoppingCart size={16} /> Keranjang
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
                                )}
                            </Link>
                            <Link href="/client-dashboard/orders" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                <ClipboardList size={16} /> Pesanan
                            </Link>
                        </div>
                    ) : (
                        // Landing page Navigation for guests
                        <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest items-center">
                            <Link href="/" className="hover:text-blue-400 transition-colors">Beranda</Link>
                            <Link href="/#about" className="hover:text-blue-400 transition-colors">Tentang</Link>
                            <Link href="/menu" className="text-blue-500">Menu</Link>
                            <Link href="/#promo" className="hover:text-blue-400 transition-colors">Promo</Link>
                            <Link href="/#faq" className="hover:text-blue-400 transition-colors">FAQ</Link>
                        </div>
                    )}

                    {/* Right Side - Profile/Auth */}
                    <div className="hidden md:flex gap-4 items-center">
                        {status === 'authenticated' ? (
                            <div className="relative">
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-2xl transition border border-slate-700 group">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg"><User size={16} /></div>
                                    <span className="text-xs font-black uppercase tracking-wide">{session?.user?.name}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl py-3 text-slate-300 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-5 py-3 border-b border-slate-800 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                            Role: {userRole || 'Pelanggan'}
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {userRole === 'admin' && (
                                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-sm font-bold rounded-2xl transition">
                                                    <LayoutDashboard size={18} className="text-blue-500" /> Dashboard Admin
                                                </Link>
                                            )}
                                            {userRole === 'kasir' && (
                                                <Link href="/kasir" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-sm font-bold rounded-2xl transition">
                                                    <Monitor size={18} className="text-emerald-500" /> Panel Kasir
                                                </Link>
                                            )}
                                            <Link href="/client-dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-sm font-bold rounded-2xl transition">
                                                <ShoppingBag size={18} className="text-amber-500" /> Dashboard Saya
                                            </Link>
                                            <Link href="/client-dashboard/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-sm font-bold rounded-2xl transition">
                                                <ClipboardList size={18} className="text-blue-500" /> Pesanan Saya
                                            </Link>
                                        </div>
                                        <div className="border-t border-slate-800 mt-2 pt-2 p-2">
                                            <button onClick={() => signOut()} className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm font-bold text-red-500 flex items-center gap-3 rounded-2xl transition">
                                                <LogOut size={18} /> Keluar Akun
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-xs font-black uppercase tracking-widest hover:text-blue-400 transition">Log In</Link>
                                <Link href="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-900/20">Register</Link>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-400"><MenuIcon /></button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900 p-6 space-y-4 border-t border-slate-800 animate-in slide-in-from-top-5">
                        {status === 'authenticated' ? (
                            // Dashboard links for logged in mobile users
                            <>
                                <Link href={getDashboardLink()} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400">
                                    <Home size={18} /> Dashboard
                                </Link>
                                <Link href="/menu" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-blue-500">
                                    <Coffee size={18} /> Menu
                                </Link>
                                <Link href="/cart" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400">
                                    <ShoppingCart size={18} /> Keranjang ({totalItems})
                                </Link>
                                <Link href="/client-dashboard/orders" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400">
                                    <ClipboardList size={18} /> Pesanan Saya
                                </Link>
                                <div className="pt-4 border-t border-slate-800">
                                    <button onClick={() => signOut()} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-red-500">
                                        <LogOut size={18} /> Keluar
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Landing page links for guests mobile
                            <>
                                <Link href="/" className="block text-sm font-black uppercase tracking-widest text-slate-400">Beranda</Link>
                                <Link href="/menu" className="block text-sm font-black uppercase tracking-widest text-blue-500">Menu</Link>
                                <Link href="/#promo" className="block text-sm font-black uppercase tracking-widest text-slate-400">Promo</Link>
                                <div className="pt-4 flex flex-col gap-3">
                                    <Link href="/login" className="w-full py-3 text-center border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest">Log In</Link>
                                    <Link href="/register" className="w-full py-3 text-center bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest">Register</Link>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* === HERO BANNER === */}
            <div className="relative w-full h-[40vh] bg-slate-900 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1956&auto=format&fit=crop')] bg-cover bg-center opacity-40 scale-110 animate-pulse-slow"></div>
                <div className="relative z-20 text-center space-y-4 px-6">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                        OUR MENU
                    </h1>
                    <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-xs md:text-sm">Temala Coffee Experience</p>
                </div>
            </div>

            {/* === MAIN CONTENT === */}
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Cari menu favoritmu..."
                            className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-[2rem] pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-slate-600 shadow-2xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* === SIDEBAR KATEGORI === */}
                    <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-6 lg:pb-0 scrollbar-hide shrink-0 sticky top-28 z-30">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest whitespace-nowrap ${activeCategory === cat.id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/40'
                                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                            >
                                <span className={activeCategory === cat.id ? 'text-white' : 'text-slate-600'}>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* === GRID PRODUK === */}
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px flex-1 bg-slate-800"></div>
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="text-blue-500">#</span> {activeCategory === 'All' ? 'Semua Menu' : activeCategory}
                            </h2>
                            <div className="h-px flex-1 bg-slate-800"></div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 overflow-hidden relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse"></div>

                                <div className="relative flex flex-col items-center">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse-ring"></div>

                                    <div className="relative w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                                        <Coffee size={28} className="text-blue-500" strokeWidth={2.5} />
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-steam"></div>
                                            <div className="w-1 h-4 bg-blue-400/20 rounded-full animate-steam [animation-delay:0.5s]"></div>
                                        </div>
                                    </div>
                                    <div className="mt-8 text-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Menyiapkan Menu Lezat...</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredMenus.map(menu => (
                                    <div key={menu.id} className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-5 flex flex-col border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all duration-500 group relative overflow-hidden">

                                        {/* Product Image */}
                                        <div className="relative w-full h-56 bg-slate-950 rounded-[2rem] overflow-hidden mb-6 shadow-inner border border-slate-800">
                                            {menu.image ? (
                                                <Image src={menu.image} alt={menu.name} fill className="object-cover group-hover:scale-110 transition duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-800"><Coffee size={64} strokeWidth={1} /></div>
                                            )}

                                            {/* Category Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-slate-400 px-3 py-1.5 rounded-full border border-slate-800 uppercase tracking-widest">
                                                    {menu.category}
                                                </span>
                                            </div>

                                            {/* Promo Badge */}
                                            {menu.category === 'promo' && (
                                                <div className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl animate-pulse uppercase tracking-widest">
                                                    Hot Deal
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 flex flex-col px-2">
                                            <h3 className="font-black text-xl text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{menu.name}</h3>
                                            <p className="text-slate-500 text-xs line-clamp-2 mb-6 leading-relaxed font-medium">
                                                {menu.description || "Rasakan kenikmatan menu spesial dari Temala Coffee yang dibuat dengan cinta."}
                                            </p>

                                            <div className="mt-auto flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Harga</span>
                                                    <p className="text-white font-black text-2xl tracking-tighter">
                                                        Rp {Number(menu.price).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(menu)}
                                                    disabled={menu.stock <= 0}
                                                    className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-90 disabled:opacity-20 disabled:grayscale group-hover:rotate-6"
                                                >
                                                    {menu.stock > 0 ? <Plus size={24} strokeWidth={3} /> : <X size={24} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredMenus.length === 0 && !loading && (
                            <div className="text-center py-32 bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-800">
                                <Coffee size={64} className="mx-auto text-slate-800 mb-4" />
                                <p className="text-slate-600 font-black uppercase tracking-[0.3em]">Menu Tidak Ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === FLOATING CART BAR === */}
            {totalItems > 0 && (
                <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center animate-in slide-in-from-bottom-10 duration-500">
                    <Link href="/cart" className="bg-blue-600 text-white w-full max-w-2xl rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex justify-between items-center hover:bg-blue-700 transition-all border-4 border-blue-500/30 group">
                        <div className="flex items-center gap-4 pl-6">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingCart size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">{totalItems} Item Terpilih</span>
                                <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Lanjut ke Pembayaran</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 pr-2">
                            <span className="font-black text-2xl tracking-tighter">Rp {totalPrice.toLocaleString()}</span>
                            <div className="bg-white text-blue-600 p-4 rounded-2xl shadow-lg group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    )
}