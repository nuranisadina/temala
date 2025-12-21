'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Coffee, Plus, MapPin, Instagram, Facebook, Phone, Menu as MenuIcon, X, LogOut, LayoutDashboard, Monitor, HelpCircle, ChevronDown, User, ShoppingBag, ArrowRight, Loader2, Calendar, ExternalLink, Navigation, CornerUpRight } from 'lucide-react'
import PromoBanner from '@/components/PromoBanner'

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

interface Event {
    id: number
    title: string
    content: string
    image?: string | null
}

export default function HomePage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // @ts-ignore
    const userRole = session?.user?.role

    const [menus, setMenus] = useState<Menu[]>([])
    const [promos, setPromos] = useState<Menu[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('coffee')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    // --- LOGIKA AUTO-REDIRECT ---
    useEffect(() => {
        if (status === 'authenticated' && userRole) {
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
        const fetchData = async () => {
            try {
                // 1. Fetch Menus
                const menuRes = await fetch('/api/menus')
                const menuData = await menuRes.json()
                if (Array.isArray(menuData)) {
                    setMenus(menuData)
                    setPromos(menuData.filter((item: Menu) => item.category === 'promo'))
                }

                // 2. Fetch Events (NEW)
                const eventRes = await fetch('/api/events')
                const eventData = await eventRes.json()
                if (Array.isArray(eventData)) {
                    setEvents(eventData)
                }
            } catch (err) {
                console.error("Gagal fetch data:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
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

    // --- FUNGSI SCROLL HALUS ---
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    // --- LOADING OVERLAY SAAT REDIRECT ---
    if (status === 'authenticated' && (userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'kasir')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="relative flex flex-col items-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-400/20 rounded-full animate-pulse-ring"></div>
                    <div className="relative w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                        <Coffee size={40} className="text-blue-400" strokeWidth={2.5} />
                    </div>
                    <div className="mt-12 text-center space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">TEMALA.</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-1">Mengalihkan ke Dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans text-slate-800 bg-white scroll-smooth">

            {/* === NAVBAR === */}
            <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Image src="/logo.png" alt="Temala Logo" width={32} height={32} className="rounded-lg" />
                        <span className="text-xl font-black tracking-tighter ml-3">TEMALA.</span>
                    </div>

                    <div className="hidden md:flex gap-6 text-sm font-bold items-center">
                        <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-blue-200 transition cursor-pointer">Beranda</a>
                        <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-blue-200 transition cursor-pointer">Tentang Kami</a>
                        <a href="#menu" onClick={(e) => scrollToSection(e, 'menu')} className="hover:text-blue-200 transition cursor-pointer">Menu</a>
                        <a href="#promo" onClick={(e) => scrollToSection(e, 'promo')} className="hover:text-blue-200 transition cursor-pointer">Promo</a>
                        <a href="#event" onClick={(e) => scrollToSection(e, 'event')} className="hover:text-blue-200 transition cursor-pointer">Event</a>
                        <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-blue-200 transition cursor-pointer">FAQ</a>
                        <a href="#location" onClick={(e) => scrollToSection(e, 'location')} className="hover:text-blue-200 transition cursor-pointer">Lokasi</a>
                    </div>

                    <div className="hidden md:flex gap-4 items-center">
                        {status === 'authenticated' ? (
                            <div className="relative">
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-blue-800/50 hover:bg-blue-800 px-3 py-1.5 rounded-full transition border border-blue-500">
                                    <div className="w-8 h-8 bg-white text-blue-500 rounded-full flex items-center justify-center"><User size={18} /></div>
                                    <span className="text-sm font-bold pr-1">{session?.user?.name}</span>
                                    <ChevronDown size={14} className={`transition ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 text-slate-800 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-2 border-b text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50 rounded-t-xl">Halo, {userRole || 'Pelanggan'}</div>
                                        <div className="p-1 space-y-1">
                                            {userRole === 'Admin' && <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-500 text-sm font-bold rounded-lg transition"><LayoutDashboard size={16} /> Dashboard</Link>}
                                            {userRole === 'Kasir' && <Link href="/pos" className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-700 text-sm font-bold rounded-lg transition"><Monitor size={16} /> POS Kasir</Link>}
                                            {userRole === 'Pelanggan' && <Link href="/client-dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-purple-700 text-sm font-bold rounded-lg transition"><LayoutDashboard size={16} /> Dashboard Saya</Link>}
                                        </div>
                                        <div className="border-t border-slate-100 mt-1 pt-1 p-1">
                                            <button onClick={() => signOut()} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2 rounded-lg transition"><LogOut size={16} /> Keluar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="text-white font-bold text-sm hover:text-blue-200 transition">Log In</Link>
                                <Link href="/register" className="bg-white text-blue-500 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-100 transition shadow-lg shadow-blue-900/20">Register</Link>
                            </>
                        )}
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
                        {isMenuOpen ? <X /> : <MenuIcon />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-slate-800 p-4 space-y-2 border-t border-slate-700">
                        <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="block py-2 text-slate-200 hover:text-white font-bold">Beranda</a>
                        <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="block py-2 text-slate-200 hover:text-white font-bold">Tentang Kami</a>
                        <a href="#menu" onClick={(e) => scrollToSection(e, 'menu')} className="block py-2 text-slate-200 hover:text-white font-bold">Menu</a>
                        <a href="#promo" onClick={(e) => scrollToSection(e, 'promo')} className="block py-2 text-slate-200 hover:text-white font-bold">Promo</a>
                        <a href="#event" onClick={(e) => scrollToSection(e, 'event')} className="block py-2 text-slate-200 hover:text-white font-bold">Event</a>
                        <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="block py-2 text-slate-200 hover:text-white font-bold">FAQ</a>
                        <a href="#location" onClick={(e) => scrollToSection(e, 'location')} className="block py-2 text-slate-200 hover:text-white font-bold">Lokasi</a>
                        <div className="border-t border-slate-700 pt-4 mt-2">
                            {status === 'authenticated' ? (
                                <div className="flex flex-col gap-3">
                                    <span className="text-xs text-slate-300 font-bold">Halo, {session?.user?.name}</span>
                                    <button onClick={() => signOut()} className="text-center text-red-400 py-2 font-bold hover:text-white">Keluar</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/login" className="block text-center border border-slate-300 py-2 rounded font-bold text-white hover:bg-slate-700 transition">Log In</Link>
                                    <Link href="/register" className="block text-center bg-white text-blue-500 py-2 rounded font-bold">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <div id="home"></div>

            {/* === HERO SECTION === */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/uploads/latar.JPG" alt="Temala Coffee Interior" fill sizes="100vw" style={{ objectFit: 'cover' }} priority className="brightness-50" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">TEMALA COFFEE</h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light max-w-3xl mx-auto">Freshly Brewed for Every Moment</p>
                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">Nikmati pengalaman kopi premium dengan suasana nyaman dan pelayanan terbaik di jantung kota Pekanbaru</p>
                    </div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"><ChevronDown className="text-white/60" size={32} /></div>
            </section>

            {/* === FEATURES SECTION === */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Mengapa Memilih Temala?</h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">Kami hadir dengan komitmen memberikan pengalaman terbaik untuk setiap momen Anda</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-105 transition duration-300">
                            <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-blue-400/20"><Coffee size={32} className="text-white" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Kopi Premium</h3>
                            <p className="text-slate-600 leading-relaxed">100% biji kopi pilihan terbaik Indonesia, diracik oleh barista berpengalaman untuk cita rasa sempurna</p>
                        </div>
                        <div className="group p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-105 transition duration-300">
                            <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-blue-400/20"><MapPin size={32} className="text-white" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Lokasi Strategis</h3>
                            <p className="text-slate-600 leading-relaxed">Berada di pusat kota dengan akses mudah, parkir luas, dan suasana yang nyaman untuk bekerja atau bersantai</p>
                        </div>
                        <div className="group p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-105 transition duration-300">
                            <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-blue-400/20"><User size={32} className="text-white" /></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Pelayanan Ramah</h3>
                            <p className="text-slate-600 leading-relaxed">Tim kami siap melayani dengan senyuman, memastikan setiap kunjungan Anda menjadi pengalaman berkesan</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* === ABOUT SECTION === */}
            <section id="about" className="py-20 bg-slate-50 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                                <Image src="/uploads/latar.JPG" alt="Interior Temala Coffee" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} className="hover:scale-105 transition duration-700" />
                            </div>
                        </div>
                        <div className="order-1 md:order-2 space-y-6">
                            <div>
                                <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">Tentang Kami</span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 mb-4">Cerita Temala Coffee</h2>
                            </div>
                            <p className="text-slate-600 text-lg leading-relaxed">Kedai Kopi Temala hadir sebagai brand kopi modern yang menghadirkan cita rasa otentik Indonesia. Mengusung konsep <strong>"Freshly Brewed for Every Moment"</strong>, kami berkomitmen menyajikan setiap cangkir dengan penuh dedikasi.</p>
                            <p className="text-slate-600 text-lg leading-relaxed">Dengan menggunakan 100% biji kopi pilihan terbaik dari berbagai daerah di Indonesia, kami menciptakan pengalaman minum kopi yang tak terlupakan di setiap kesempatan.</p>
                            <Link href="/about" className="inline-flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition shadow-lg hover:shadow-xl hover:scale-105 transform">Selengkapnya <ArrowRight size={18} /></Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* === MENU PREVIEW SECTION === */}
            <section id="menu" className="py-20 bg-white scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">Menu Kami</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 mb-4">Kelezatan dalam Setiap Sajian</h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">Pilihan lengkap dari kopi klasik hingga kreasi modern, plus aneka makanan pendamping</p>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-10 justify-center">
                        {['coffee', 'non-coffee', 'food', 'snack'].map((cat) => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-full font-bold uppercase tracking-wide transition-all text-sm ${activeCategory === cat ? 'bg-blue-400 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat.replace('-', ' ')}</button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {loading ? <p className="col-span-4 text-center text-slate-400">Memuat menu...</p> : filteredMenus.slice(0, 8).map((menu) => (
                            <div key={menu.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-2xl transition duration-300 border border-slate-100 flex flex-col h-full group">
                                <div className="relative h-40 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                                    {menu.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Coffee size={32} /></div>
                                    )}
                                </div>
                                <h3 className="font-bold text-base mb-1 line-clamp-1 text-slate-800 uppercase">{menu.name}</h3>
                                <div className="mt-auto flex justify-between items-end pt-2">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Stok: {menu.stock}</p>
                                        <p className="text-blue-600 font-black text-lg">Rp {menu.price.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => addToCart(menu)} disabled={menu.stock <= 0} className="bg-blue-400 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-500 hover:scale-110 transition shadow-md disabled:bg-slate-300"><Plus size={20} /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/menu" className="bg-blue-400 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform inline-flex items-center gap-2">Lihat Semua Menu <ArrowRight size={20} /></Link>
                    </div>
                </div>
            </section>

            {/* === PROMO SECTION === */}
            <PromoBanner />

            {/* === EVENT SECTION (SYNCHRONIZED) === */}
            <section id="event" className="max-w-7xl mx-auto px-6 py-8 mb-12 scroll-mt-28">
                <h2 className="text-4xl font-black text-slate-900 mb-2">EVENT</h2>
                <p className="text-slate-500 mb-8">Keseruan di Temala!</p>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {events.map((event) => (
                            <div key={event.id} className="w-full h-[300px] bg-slate-900 rounded-3xl overflow-hidden relative flex items-center justify-center shadow-xl group cursor-pointer hover:scale-[1.02] transition-all duration-500">
                                {event.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition duration-500" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-80"></div>
                                )}
                                <div className="relative z-10 text-center p-6 w-full">
                                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-widest drop-shadow-lg uppercase mb-2">{event.title}</h3>
                                    <div className="inline-block bg-blue-400/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30">
                                        <p className="text-white font-bold text-sm tracking-wider">
                                            {event.content || 'Segera Hadir'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-[250px] bg-slate-50 rounded-3xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                        <Calendar size={48} className="mb-4 text-slate-300" />
                        <p className="font-bold">Belum ada event mendatang.</p>
                    </div>
                )}
            </section>

            {/* === FAQ === */}
            <section id="faq" className="bg-slate-50 py-16 scroll-mt-28">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-8">FAQ</h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-left space-y-4">
                        <div className="border-b pb-4">
                            <h4 className="font-bold flex items-center gap-2"><HelpCircle size={18} className="text-blue-400" /> Jam berapa Temala buka?</h4>
                            <p className="text-slate-500 mt-1 pl-7">Kami buka setiap hari dari jam 08.00 pagi sampai 23.00 malam.</p>
                        </div>
                        <div>
                            <h4 className="font-bold flex items-center gap-2"><HelpCircle size={18} className="text-blue-400" /> Apakah ada WiFi?</h4>
                            <p className="text-slate-500 mt-1 pl-7">Tentu! Kami menyediakan WiFi kencang gratis untuk pelanggan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* === LOKASI === */}
            <section id="location" className="py-16 scroll-mt-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">LOKASI</h2>
                        <p className="text-slate-600 text-lg">Temukan kami di Perawang, Siak</p>
                    </div>
                    <div className="relative w-full h-[450px] bg-slate-100 rounded-2xl overflow-hidden shadow-lg mb-8 group">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.664186469836!2d101.6025!3d0.6555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMzknMTkuOCJOIDEwMcKwMzYnMDkuMCJF!5e0!3m2!1sen!2sid!4v1635730000000!5m2!1sen!2sid&q=MJC2+PC2,+Perawang,+Kec.+Tualang,+Kabupaten+Siak,+Riau+28685"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Lokasi Temala Coffee"
                        />

                        {/* Custom Overlay Card */}
                        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md max-w-[320px] z-10 fade-in border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Temala Coffee</h3>
                                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">MJC2+PC2, Perawang, Kec. Tualang, Kab. Siak, Riau 28685</p>
                                </div>
                                <a href="https://maps.app.goo.gl/H4orMV3G4rBHngdH7" target="_blank" className="flex flex-col items-center text-blue-500 hover:text-blue-600 ml-3 flex-shrink-0 group/icon">
                                    <div className="w-9 h-9 bg-white border border-blue-100 rounded-lg shadow-sm flex items-center justify-center mb-1 group-hover/icon:bg-blue-50 transition">
                                        <CornerUpRight size={20} className="text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-500">Rute</span>
                                </a>
                            </div>
                            <a href="https://maps.app.goo.gl/H4orMV3G4rBHngdH7" target="_blank" className="block mt-3 text-blue-500 text-xs font-bold hover:underline">Lihat peta lebih besar</a>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="flex items-center justify-center mb-3"><MapPin className="text-blue-400" size={28} /></div>
                                <h3 className="font-bold text-slate-900 mb-2">Alamat</h3>
                                <p className="text-slate-600 text-sm">MJC2+PC2, Perawang<br />Kec. Tualang, Kab. Siak, Riau 28685</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center mb-3"><Coffee className="text-blue-400" size={28} /></div>
                                <h3 className="font-bold text-slate-900 mb-2">Jam Operasional</h3>
                                <p className="text-slate-600 text-sm">Setiap Hari<br /><span className="font-bold text-blue-400">08:00 - 23:00 WIB</span></p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center mb-3"><Phone className="text-blue-400" size={28} /></div>
                                <h3 className="font-bold text-slate-900 mb-2">Kontak</h3>
                                <p className="text-slate-600 text-sm"><a href="tel:+6281234567890" className="hover:text-blue-400 transition">+62 812-3456-7890</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="bg-slate-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Image src="/logo.png" alt="Temala Logo" width={40} height={40} className="rounded-lg brightness-90" />
                            <span className="text-2xl font-black tracking-tighter">TEMALA.</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-4">Freshly Brewed for Every Moment</p>
                        <p className="text-slate-400 text-xs leading-relaxed">Kedai Kopi Temala hadir dengan komitmen menyajikan kopi premium terbaik Indonesia sejak 2023.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-slate-200">Menu</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-blue-400 hover:underline cursor-pointer transition">Beranda</a></li>
                            <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-blue-400 hover:underline cursor-pointer transition">Tentang Kami</a></li>
                            <li><Link href="/menu" className="hover:text-blue-400 hover:underline transition">Menu Kami</Link></li>
                            <li><a href="#promo" onClick={(e) => scrollToSection(e, 'promo')} className="hover:text-blue-400 hover:underline cursor-pointer transition">Promo</a></li>
                            <li><a href="#event" onClick={(e) => scrollToSection(e, 'event')} className="hover:text-blue-400 hover:underline cursor-pointer transition">Event</a></li>
                            <li><a href="#location" onClick={(e) => scrollToSection(e, 'location')} className="hover:text-blue-400 hover:underline cursor-pointer transition">Lokasi</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-slate-200">Kontak Kami</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-2"><MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /><span>MJC2+PC2, Perawang, Siak</span></li>
                            <li className="flex items-start gap-2"><Phone size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /><a href="tel:+6281234567890" className="hover:text-blue-400 transition">+62 812-3456-7890</a></li>
                            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><a href="mailto:info@temalacoffee.com" className="hover:text-blue-400 transition">info@temalacoffee.com</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-slate-200">Jam Buka</h4>
                        <div className="text-sm text-slate-400 mb-6"><p className="mb-1">Setiap Hari</p><p className="text-blue-400 font-bold">08:00 - 23:00 WIB</p></div>
                        <h4 className="font-bold text-sm mb-3 text-slate-200">Ikuti Kami</h4>
                        <div className="flex gap-3">
                            <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-blue-400 hover:text-white transition"><Instagram size={20} /></a>
                            <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-blue-400 hover:text-white transition"><Facebook size={20} /></a>
                            <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-blue-400 hover:text-white transition"><Phone size={20} /></a>
                        </div>
                    </div>
                </div>
                <div className="text-center text-slate-400 text-xs border-t border-slate-700 pt-8 mx-6"><p>© 2025 Temala Coffee. All rights reserved.</p></div>
            </footer>
        </div>
    )
}