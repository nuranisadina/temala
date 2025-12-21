// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
    TrendingUp, ShoppingBag,
    DollarSign, Clock, Users,
    ArrowUpRight, Package,
    CheckCircle, Calendar, LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'

interface Order {
    id: number
    total_price: number
    created_at: string
    status: string
    payment: { method: string }
    orderItems: any[]
}

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [avgOrderValue, setAvgOrderValue] = useState(0)
    const [pendingOrders, setPendingOrders] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/orders', { cache: 'no-store' })
                const data = await res.json()
                if (Array.isArray(data)) {
                    processData(data)
                }
            } catch (error) {
                console.error("Gagal ambil data dashboard", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
        // Auto-refresh setiap 15 detik
        const interval = setInterval(fetchData, 15000)
        return () => clearInterval(interval)
    }, [])

    const processData = (data: Order[]) => {
        setOrders(data)
        const completedOrders = data.filter(o => o.status === 'Completed')
        const revenue = completedOrders.reduce((acc, curr) => acc + Number(curr.total_price), 0)
        setTotalRevenue(revenue)
        setTotalOrders(data.length)
        setAvgOrderValue(completedOrders.length > 0 ? revenue / completedOrders.length : 0)
        // Hitung pesanan aktif (Pending + Paid/Diproses)
        setPendingOrders(data.filter(o => ['Pending', 'Paid', 'Served'].includes(o.status)).length)
    }

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>

            <div className="relative flex flex-col items-center">

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-400/30 rounded-full animate-pulse-ring"></div>

                <div className="relative w-16 h-16 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-200/50 flex items-center justify-center animate-float">
                    <LayoutDashboard size={28} className="text-blue-600" strokeWidth={2.5} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <div className="w-1 h-3 bg-blue-400/60 rounded-full animate-steam"></div>
                        <div className="w-1 h-4 bg-blue-300/40 rounded-full animate-steam [animation-delay:0.5s]"></div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Memuat Data Dashboard...</p>
                </div>
            </div>
        </div>

    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Dashboard Overview</h1>
                    <p className="text-slate-500 font-medium">Ringkasan performa bisnis Temala Coffee hari ini.</p>
                </div>
                <div className="text-left md:text-right bg-white p-4 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tanggal Hari Ini</p>
                    <p className="font-bold text-slate-800 text-lg">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-emerald-200/30 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pendapatan</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                            <DollarSign size={24} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 mt-4 relative z-10">
                        <TrendingUp size={14} /> +12.5% <span className="text-slate-400 font-bold ml-1 uppercase">dari minggu lalu</span>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-blue-200/30 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pesanan</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{totalOrders} <span className="text-xs font-medium text-slate-400 uppercase">Trx</span></h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Pending Orders */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-amber-200/30 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pesanan Pending</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{pendingOrders} <span className="text-xs font-medium text-slate-400 uppercase">Antrian</span></h3>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                            <Clock size={24} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="text-[10px] text-amber-600 font-black mt-4 uppercase tracking-wider relative z-10">
                        Butuh tindakan segera
                    </div>
                </div>

                {/* Avg Value */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-indigo-200/30 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rata-rata Order</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Rp {Math.round(avgOrderValue).toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                            <Users size={24} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders - Takes 2 Cols */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                            <Clock size={24} className="text-slate-400" />
                            Pesanan Terbaru
                        </h3>
                        <Link href="/dashboard/reports" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest border-b-2 border-blue-200 pb-1 transition-all">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center p-4 hover:bg-blue-50/50 rounded-2xl transition-all border border-transparent hover:border-blue-100 group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 text-xs border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-sm uppercase tracking-wide">Pelanggan Umum</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(order.created_at).toLocaleTimeString()} • {order.payment?.method || 'CASH'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800 text-sm">Rp {Number(order.total_price).toLocaleString()}</p>
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest mt-1 inline-block ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                                        order.status === 'Pending' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                            order.status === 'Paid' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-red-100 text-red-600 border border-red-200'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada transaksi hari ini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Mini Stats - 1 Col */}
                <div className="space-y-8">
                    {/* Visual Chart Placeholder */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="font-black text-xl mb-1 uppercase tracking-tighter">Target Hari Ini</h3>
                        <div className="flex items-end gap-2 mb-6">
                            <span className="text-5xl font-black tracking-tighter">85%</span>
                            <span className="text-blue-100 mb-2 font-black uppercase text-xs tracking-widest">Tercapai</span>
                        </div>
                        <div className="w-full bg-blue-700/40 rounded-full h-3 mb-3 p-0.5 border border-white/20">
                            <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: '85%' }}></div>
                        </div>
                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Rp 1.5jt lagi untuk capai target harian.</p>
                    </div>

                    {/* Top Products Placeholder */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
                        <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <TrendingUp size={20} className="text-slate-400" />
                            Produk Terlaris
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 text-xs border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">{i}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-wide">Kopi Susu Gula Aren</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">120 Terjual</p>
                                    </div>
                                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}