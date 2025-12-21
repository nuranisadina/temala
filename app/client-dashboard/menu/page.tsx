// app/client-dashboard/menu/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
    Search, Coffee, Plus, X,
    Star, Flame, Utensils, CupSoda, ChefHat, ShoppingCart
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

export default function ClientMenuPage() {
    const [menus, setMenus] = useState<Menu[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])

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

        // Dispatch custom event for cart update
        window.dispatchEvent(new Event('cartUpdated'))

        // Show toast notification
        const toast = document.createElement('div')
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm z-50 animate-in slide-in-from-bottom-10 fade-in shadow-2xl flex items-center gap-2'
        toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${menu.name} ditambahkan!`
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 2000)
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
        { id: 'promo', label: 'Promo', icon: <Flame size={18} className="text-red-500" /> },
        { id: 'coffee', label: 'Coffee', icon: <Coffee size={18} /> },
        { id: 'non-coffee', label: 'Non-Coffee', icon: <CupSoda size={18} /> },
        { id: 'signature', label: 'Signature', icon: <Star size={18} className="text-yellow-500" /> },
        { id: 'food', label: 'Food', icon: <Utensils size={18} /> },
        { id: 'snack', label: 'Snack', icon: <ChefHat size={18} /> },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Menu Kami</h1>
                    <p className="text-slate-400 text-sm mt-1">Temukan menu favorit Anda dan tambahkan ke keranjang</p>
                </div>

                {/* Search */}
                <div className="w-full md:w-80 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari menu..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-slate-600 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest whitespace-nowrap ${activeCategory === cat.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40'
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                            }`}
                    >
                        <span className={activeCategory === cat.id ? 'text-white' : 'text-slate-600'}>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                        <Coffee size={28} className="text-blue-500" strokeWidth={2.5} />
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                            <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-steam"></div>
                            <div className="w-1 h-4 bg-blue-400/20 rounded-full animate-steam [animation-delay:0.5s]"></div>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-6 animate-pulse">Memuat Menu...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMenus.map(menu => (
                        <div key={menu.id} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 flex flex-col border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group">
                            {/* Image */}
                            <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-800">
                                {menu.image ? (
                                    <Image src={menu.image} alt={menu.name} fill className="object-cover group-hover:scale-110 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-800"><Coffee size={48} strokeWidth={1} /></div>
                                )}

                                {/* Category Badge */}
                                <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-slate-400 px-2 py-1 rounded-lg border border-slate-800 uppercase tracking-widest">
                                    {menu.category}
                                </span>

                                {/* Promo Badge */}
                                {menu.category === 'promo' && (
                                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-lg animate-pulse">
                                        PROMO
                                    </span>
                                )}

                                {/* Stock Badge */}
                                {menu.stock <= 0 && (
                                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                                        <span className="text-red-500 font-black uppercase tracking-widest text-sm">Habis</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-black text-lg text-white uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{menu.name}</h3>
                                <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                                    {menu.description || "Menu spesial dari Temala Coffee"}
                                </p>

                                <div className="mt-auto flex justify-between items-center">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Harga</span>
                                        <p className="text-white font-black text-xl tracking-tighter">
                                            Rp {Number(menu.price).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => addToCart(menu)}
                                        disabled={menu.stock <= 0}
                                        className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                        {menu.stock > 0 ? <Plus size={22} strokeWidth={3} /> : <X size={22} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredMenus.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-800">
                    <Coffee size={48} className="mx-auto text-slate-800 mb-4" />
                    <p className="text-slate-600 font-black uppercase tracking-widest">Menu Tidak Ditemukan</p>
                </div>
            )}

            {/* Floating Cart Bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center animate-in slide-in-from-bottom-10 duration-500">
                    <a href="/client-dashboard/cart" className="bg-blue-600 text-white w-full max-w-md rounded-2xl p-3 shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex justify-between items-center hover:bg-blue-700 transition-all border-2 border-blue-500/30 group">
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingCart size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">{totalItems} Item</span>
                                <span className="text-[10px] font-bold text-blue-200">Lihat Keranjang</span>
                            </div>
                        </div>
                        <span className="font-black text-xl tracking-tighter pr-2">Rp {totalPrice.toLocaleString()}</span>
                    </a>
                </div>
            )}
        </div>
    )
}
