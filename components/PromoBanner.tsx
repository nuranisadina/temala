// components/PromoBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { Tag, Copy, Check, Percent, Clock, Gift, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

interface Voucher {
    id: number
    code: string
    discount: number
    type: string // 'PERCENTAGE' or 'FIXED'
    min_purchase: number
    max_discount: number | null
    start_date: string
    end_date: string
    is_active: boolean
    usage_limit: number | null
    used_count: number
}

export default function PromoBanner() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [activeSlide, setActiveSlide] = useState(0)

    useEffect(() => {
        fetchVouchers()
    }, [])

    const fetchVouchers = async () => {
        try {
            const res = await fetch('/api/vouchers/active')
            const data = await res.json()
            if (Array.isArray(data)) {
                setVouchers(data)
            }
        } catch (error) {
            console.error('Failed to fetch vouchers:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code)
            setCopiedCode(code)
            setTimeout(() => setCopiedCode(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const formatDiscount = (voucher: Voucher) => {
        if (voucher.type === 'PERCENTAGE') {
            return `${voucher.discount}%`
        }
        return `Rp ${voucher.discount.toLocaleString()}`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate)
        const now = new Date()
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return diff
    }

    const getGradient = (index: number) => {
        const gradients = [
            'from-blue-600 via-blue-700 to-indigo-800',
            'from-purple-600 via-purple-700 to-pink-700',
            'from-emerald-600 via-teal-600 to-cyan-700',
            'from-orange-500 via-red-500 to-pink-600',
            'from-rose-500 via-pink-600 to-purple-700',
            'from-amber-500 via-orange-600 to-red-600',
        ]
        return gradients[index % gradients.length]
    }

    const nextSlide = () => {
        setActiveSlide((prev) => (prev + 1) % Math.ceil(vouchers.length / 2))
    }

    const prevSlide = () => {
        setActiveSlide((prev) => (prev - 1 + Math.ceil(vouchers.length / 2)) % Math.ceil(vouchers.length / 2))
    }

    if (loading) {
        return (
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Memuat Promo...</p>
                    </div>
                </div>
            </section>
        )
    }

    if (vouchers.length === 0) {
        return (
            <section id="promo" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-28">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        <Sparkles size={14} /> Promo & Voucher
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Penawaran Spesial</h2>
                    <p className="text-slate-500 text-lg">Gunakan kode voucher saat checkout untuk diskon menarik!</p>
                </div>
                <div className="bg-slate-100 rounded-3xl p-16 text-center border-2 border-dashed border-slate-300">
                    <Gift size={64} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">Belum ada promo aktif saat ini.</p>
                    <p className="text-slate-400 text-sm mt-2">Pantau terus untuk promo menarik!</p>
                </div>
            </section>
        )
    }

    return (
        <section id="promo" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white scroll-mt-28 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-200">
                        <Sparkles size={14} className="animate-pulse" /> Promo & Voucher
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Penawaran <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Spesial</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Gunakan kode voucher di bawah saat checkout untuk mendapatkan diskon eksklusif!
                    </p>
                </div>

                {/* Voucher Grid */}
                <div className="relative">
                    {vouchers.length > 2 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-slate-50 transition-all hover:scale-110 border border-slate-200"
                            >
                                <ChevronLeft size={24} className="text-slate-600" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-slate-50 transition-all hover:scale-110 border border-slate-200"
                            >
                                <ChevronRight size={24} className="text-slate-600" />
                            </button>
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {vouchers.slice(activeSlide * 2, activeSlide * 2 + 2).map((voucher, index) => {
                            const daysRemaining = getDaysRemaining(voucher.end_date)
                            const isUrgent = daysRemaining <= 3

                            return (
                                <div
                                    key={voucher.id}
                                    className={`relative bg-gradient-to-br ${getGradient(index + activeSlide * 2)} rounded-[2rem] p-8 text-white overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl`}
                                >
                                    {/* Decorative Elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                                    {/* Scissors Line */}
                                    <div className="absolute top-0 bottom-0 right-[140px] w-0.5 border-l-2 border-dashed border-white/20"></div>

                                    {/* Content */}
                                    <div className="relative z-10 flex justify-between gap-6">
                                        {/* Left Side - Info */}
                                        <div className="flex-1 space-y-4">
                                            {/* Urgent Badge */}
                                            {isUrgent && (
                                                <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                                    <Clock size={12} /> {daysRemaining} Hari Lagi!
                                                </span>
                                            )}

                                            {/* Discount Value */}
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl md:text-7xl font-black tracking-tighter">
                                                    {voucher.type === 'PERCENTAGE' ? voucher.discount : 'Rp'}
                                                </span>
                                                <span className="text-2xl font-bold opacity-80">
                                                    {voucher.type === 'PERCENTAGE' ? '%' : voucher.discount.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-white/80 text-sm font-bold">
                                                    {voucher.type === 'PERCENTAGE' ? 'Diskon' : 'Potongan'} untuk semua menu
                                                </p>

                                                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                                    {voucher.min_purchase > 0 && (
                                                        <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full">
                                                            Min. Rp {voucher.min_purchase.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {voucher.max_discount && (
                                                        <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full">
                                                            Maks. Rp {voucher.max_discount.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-white/60 text-xs flex items-center gap-1">
                                                    <Clock size={12} /> Berlaku hingga {formatDate(voucher.end_date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side - Code */}
                                        <div className="flex flex-col items-center justify-center min-w-[120px]">
                                            <div className="bg-white rounded-2xl p-4 shadow-xl transform rotate-3 hover:rotate-0 transition-all">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Kode Voucher</p>
                                                <p className="text-lg font-black text-slate-900 tracking-wider text-center mb-2">
                                                    {voucher.code}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(voucher.code)}
                                                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${copiedCode === voucher.code
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {copiedCode === voucher.code ? (
                                                        <>
                                                            <Check size={14} /> Tersalin!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={14} /> Salin
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Tag */}
                                    <div className="absolute -top-3 -left-3 bg-white text-slate-900 p-3 rounded-2xl shadow-lg transform -rotate-12">
                                        <Tag size={24} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination Dots */}
                    {vouchers.length > 2 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: Math.ceil(vouchers.length / 2) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSlide(i)}
                                    className={`w-3 h-3 rounded-full transition-all ${activeSlide === i
                                            ? 'bg-blue-600 w-8'
                                            : 'bg-slate-300 hover:bg-slate-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* How to Use */}
                <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                        <div className="md:col-span-1">
                            <h3 className="text-white font-black text-xl mb-2">Cara Menggunakan</h3>
                            <p className="text-slate-400 text-sm">3 langkah mudah untuk menikmati diskon</p>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">1</div>
                            <div>
                                <p className="font-bold">Salin Kode</p>
                                <p className="text-slate-400 text-sm">Klik tombol salin</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">2</div>
                            <div>
                                <p className="font-bold">Pilih Menu</p>
                                <p className="text-slate-400 text-sm">Tambah ke keranjang</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">3</div>
                            <div>
                                <p className="font-bold">Checkout</p>
                                <p className="text-slate-400 text-sm">Masukkan kode voucher</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
