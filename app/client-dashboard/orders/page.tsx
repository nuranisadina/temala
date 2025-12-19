'use client'

import { ShoppingBag, ArrowRight, Package, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ClientOrdersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Pesanan Saya</h1>
                    <p className="text-slate-400 font-medium">Pantau status pesanan aktif Anda di sini.</p>
                </div>
                <Link href="/menu" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                    Buat Pesanan Baru <ArrowRight size={18} />
                </Link>
            </div>

            {/* Orders List / Empty State */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 md:p-16 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-700 shadow-inner border border-slate-800">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Belum Ada Pesanan Aktif</h3>
                        <p className="text-slate-500 font-medium">Sepertinya Anda belum memesan apapun hari ini. Yuk, jelajahi menu spesial kami!</p>
                    </div>
                    <div className="pt-4">
                        <Link
                            href="/menu"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-blue-900/40 transition-all shadow-xl active:scale-95"
                        >
                            Jelajahi Menu
                        </Link>
                    </div>
                </div>
            </div>

            {/* Order Process Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase tracking-wide">Pending</p>
                        <p className="text-xs text-slate-500 mt-1">Pesanan Anda sedang menunggu konfirmasi kasir.</p>
                    </div>
                </div>
                <div className="bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase tracking-wide">Diproses</p>
                        <p className="text-xs text-slate-500 mt-1">Barista kami sedang menyiapkan pesanan terbaik untuk Anda.</p>
                    </div>
                </div>
                <div className="bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase tracking-wide">Selesai</p>
                        <p className="text-xs text-slate-500 mt-1">Pesanan siap diambil atau sedang diantar ke meja Anda.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
