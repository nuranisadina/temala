'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { History, Calendar, Search, Filter, ArrowUpRight, CheckCircle, XCircle, Clock, Package, Loader2, Coffee } from 'lucide-react'

interface Order {
    id: number
    created_at: string
    total_price: number
    status: string
    orderItems: any[]
}

export default function ClientHistoryPage() {
    const { data: session, status } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (status === 'authenticated') {
            fetchHistory()
        } else if (status === 'unauthenticated') {
            setLoading(false)
        }
    }, [status])

    const fetchHistory = async () => {
        try {
            // @ts-ignore
            const userId = session?.user?.id
            if (!userId) return

            const res = await fetch(`/api/orders?user_id=${userId}`)
            const data = await res.json()

            if (Array.isArray(data)) {
                // Filter hanya yang selesai atau dibatalkan untuk riwayat (opsional, tapi biasanya riwayat itu yang sudah lewat)
                // Tapi user mungkin ingin lihat semua history termasuk yang pending di sini juga.
                // Kita tampilkan semua saja tapi diurutkan terbaru.
                const sorted = data.sort((a: any, b: any) => b.id - a.id)
                setOrders(sorted)
            }
        } catch (error) {
            console.error("Gagal ambil history:", error)
        } finally {
            setLoading(false)
        }
    }

    // Hitung Statistik
    const totalSpent = orders
        .filter(o => o.status === 'Completed' || o.status === 'Paid')
        .reduce((acc, curr) => acc + Number(curr.total_price), 0)

    const totalVisits = orders.filter(o => o.status === 'Completed').length

    // Filter Pencarian
    const filteredOrders = orders.filter(o =>
        o.id.toString().includes(search) ||
        o.status.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return <span className="text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-2 w-fit"><Clock size={12} /> Menunggu</span>
            case 'Paid': return <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-2 w-fit"><Package size={12} /> Proses</span>
            case 'Completed': return <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2 w-fit"><CheckCircle size={12} /> Selesai</span>
            case 'Cancelled': return <span className="text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-2 w-fit"><XCircle size={12} /> Batal</span>
            default: return <span className="text-slate-500">{status}</span>
        }
    }

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] animate-pulse"></div>
            <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl animate-bounce">
                    <Coffee className="text-blue-500" size={32} />
                </div>
                <p className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Memuat Riwayat...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Riwayat Transaksi</h1>
                    <p className="text-slate-400 font-medium">Daftar semua pesanan yang telah Anda buat.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ID / Status..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* History Table / Empty State */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-16 md:p-24 text-center">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-700 shadow-inner border border-slate-800">
                                <History size={48} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Belum Ada Riwayat</h3>
                                <p className="text-slate-500 font-medium">Transaksi Anda akan muncul di sini.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="p-6">ID Pesanan</th>
                                    <th className="p-6">Tanggal</th>
                                    <th className="p-6">Total</th>
                                    <th className="p-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-6 font-bold text-white">#{order.id}</td>
                                        <td className="p-6 text-slate-400 text-sm">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            <div className="text-xs text-slate-600">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="p-6 font-black text-blue-400">
                                            Rp {Number(order.total_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-6">
                                            {getStatusBadge(order.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Calendar size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Transaksi Selesai</p>
                    <h4 className="text-3xl font-black text-white tracking-tight">{totalVisits} <span className="text-sm font-medium text-slate-500 uppercase">Kali</span></h4>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <History size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pengeluaran</p>
                    <h4 className="text-3xl font-black text-white tracking-tight">Rp {totalSpent.toLocaleString('id-ID')}</h4>
                </div>
            </div>
        </div>
    )
}
