// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
    LayoutDashboard, TrendingUp, Users, ShoppingBag,
    DollarSign, Clock, ArrowUpRight, ArrowDownRight, Package,
    Calendar, CheckCircle, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Tipe Data Sederhana
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

    // Stats
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [avgOrderValue, setAvgOrderValue] = useState(0)
    const [pendingOrders, setPendingOrders] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/orders')
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
    }, [])

    const processData = (data: Order[]) => {
        setOrders(data)

        // 1. Total Revenue (Hanya yang Completed/Paid)
        const validOrders = data.filter(o => ['Paid', 'Completed'].includes(o.status))
        const revenue = validOrders.reduce((acc, curr) => acc + Number(curr.total_price), 0)
        setTotalRevenue(revenue)

        // 2. Total Orders
        setTotalOrders(data.length)

        // 3. Rata-rata Nilai Order
        setAvgOrderValue(validOrders.length > 0 ? revenue / validOrders.length : 0)

        // 4. Pending
        setPendingOrders(data.filter(o => o.status === 'Pending').length)
    }

    if (loading) return <div className="p-8 text-center font-bold text-slate-500">Memuat Dashboard...</div>

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Ringkasan performa bisnis hari ini.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Tanggal</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pendapatan</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                        <TrendingUp size={14} /> +12.5% <span className="text-slate-400 font-normal ml-1">dari minggu lalu</span>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pesanan</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalOrders} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Trx</span></h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                </div>

                {/* Pending Orders */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pesanan Pending</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingOrders} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Antrian</span></h3>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-2">
                        Butuh tindakan segera
                    </div>
                </div>

                {/* Avg Value */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rata-rata Order</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Rp {Math.round(avgOrderValue).toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Users size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders - Takes 2 Cols */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2"><Clock size={20} className="text-slate-400" /> Pesanan Terbaru</h3>
                        <Link href="/dashboard/reports" className="text-sm font-bold text-blue-600 hover:text-blue-700">Lihat Semua</Link>
                    </div>

                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 text-xs">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pelanggan Umum</p>
                                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleTimeString()} • {order.payment?.method || 'CASH'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Rp {Number(order.total_price).toLocaleString()}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${order.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                                        order.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                            order.status === 'Paid' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-center text-slate-400 py-4">Belum ada transaksi.</p>}
                    </div>
                </div>

                {/* Quick Actions / Mini Stats - 1 Col */}
                <div className="space-y-6">
                    {/* Visual Chart Placeholder */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
                        <h3 className="font-bold text-lg mb-1">Target Hari Ini</h3>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-black">85%</span>
                            <span className="text-blue-200 mb-1.5 font-bold">Tercapai</span>
                        </div>
                        <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <p className="text-xs text-blue-200 opacity-80">Rp 1.5jt lagi untuk capai target harian.</p>
                    </div>

                    {/* Top Products Placeholder */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-slate-400" /> Produk Terlaris</h3>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs">{i}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-700">Kopi Susu Gula Aren</p>
                                        <p className="text-xs text-slate-400">120 Terjual</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}