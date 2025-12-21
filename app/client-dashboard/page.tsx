// app/client-dashboard/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingBag, CheckCircle, Clock, Plus, ArrowRight, History, Coffee, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
    id: number
    menu: { name: string }
    quantity: number
    subtotal: number
}

interface Order {
    id: number
    customer_name: string
    type_order: string
    total_price: number
    status: string
    created_at: string
    orderItems: OrderItem[]
}

export default function ClientDashboardPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        if (!session?.user) return

        try {
            // @ts-ignore
            const userId = session?.user?.id
            const url = userId ? `/api/orders?user_id=${userId}` : '/api/orders'
            const res = await fetch(url, { cache: 'no-store' })
            const data = await res.json()
            if (Array.isArray(data)) {
                setOrders(data)
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error)
        } finally {
            setLoading(false)
        }
    }, [session])

    useEffect(() => {
        fetchOrders()
        // Auto-refresh setiap 15 detik
        const interval = setInterval(fetchOrders, 15000)
        return () => clearInterval(interval)
    }, [fetchOrders])

    // Hitung statistik
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'Completed').length
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Paid').length
    const recentOrders = orders.slice(0, 5)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">Pending</span>
            case 'Paid':
                return <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">Diproses</span>
            case 'Completed':
                return <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">Selesai</span>
            case 'Cancelled':
                return <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">Batal</span>
            default:
                return <span className="text-[10px] font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded-lg">{status}</span>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Dashboard</h1>
                    <p className="text-slate-400 font-medium">Selamat datang kembali, {session?.user?.name}!</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchOrders} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
                        <RefreshCw size={18} />
                    </button>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tanggal</p>
                        <p className="font-bold text-slate-300">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-blue-900/10 transition-all group">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingBag size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Pesanan</p>
                            <p className="text-3xl font-black text-white">{loading ? '...' : totalOrders} <span className="text-sm font-medium text-slate-500">Trx</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-emerald-900/10 transition-all group">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Pesanan Selesai</p>
                            <p className="text-3xl font-black text-white">{loading ? '...' : completedOrders} <span className="text-sm font-medium text-slate-500">Selesai</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-amber-900/10 transition-all group">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
                            <Clock size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Pesanan Aktif</p>
                            <p className="text-3xl font-black text-white">{loading ? '...' : pendingOrders} <span className="text-sm font-medium text-slate-500">Antrian</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity - Takes 2 Cols */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xl text-white flex items-center gap-3 uppercase tracking-tight">
                            <History size={24} className="text-blue-500" />
                            Aktivitas Terakhir
                        </h3>
                        <Link href="/client-dashboard/orders" className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-all">
                            Lihat Semua
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Coffee size={32} className="text-blue-500 animate-pulse" />
                            <p className="text-slate-500 text-sm mt-4">Memuat data...</p>
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 shadow-inner">
                                <ShoppingBag size={40} />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-lg">Belum ada aktivitas</p>
                                <p className="text-slate-500 text-sm max-w-[250px] mx-auto mt-1">Pesanan Anda akan muncul di sini setelah Anda melakukan transaksi.</p>
                            </div>
                            <Link href="/client-dashboard/menu" className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-black transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                                Pesan Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
                                            <ShoppingBag size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Order #{order.id}</p>
                                            <p className="text-xs text-slate-500">{order.orderItems?.length || 0} item • {order.type_order}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(order.status)}
                                        <p className="text-white font-bold mt-1">Rp {Number(order.total_price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions - 1 Col */}
                <div className="space-y-6">
                    {/* Promo Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="font-black text-2xl mb-2 tracking-tight">Promo Spesial!</h3>
                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">Dapatkan diskon hingga 50% untuk pembelian menu signature hari ini.</p>
                        <Link href="/client-dashboard/menu" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                            Cek Promo <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                        <h3 className="font-black text-lg text-white mb-4 uppercase tracking-tight">Aksi Cepat</h3>
                        <div className="space-y-3">
                            <Link href="/client-dashboard/menu" className="flex items-center gap-4 p-4 bg-slate-950/50 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">Buat Pesanan</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pilih menu favorit</p>
                                </div>
                            </Link>
                            <Link href="/client-dashboard/orders" className="flex items-center gap-4 p-4 bg-slate-950/50 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
                                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">Cek Pesanan</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lihat status order</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
