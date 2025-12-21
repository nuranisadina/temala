'use client'

import { useState, useEffect } from 'react'
import { Download, Calendar, FileText, TrendingUp } from 'lucide-react'

interface Order {
    id: number
    created_at: string
    total_price: number
    status: string
    payment?: { method: string }
    customer_name: string
}

export default function ReportsPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [month, setMonth] = useState(new Date().getMonth())
    const [year, setYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (Array.isArray(data)) setOrders(data)
        } catch (error) {
            console.error("Gagal ambil data:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(o => {
        const d = new Date(o.created_at)
        return d.getMonth() === month && d.getFullYear() === year && o.status === 'Completed'
    })

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_price), 0)

    const downloadCSV = () => {
        const headers = ['Order ID', 'Tanggal', 'Pelanggan', 'Metode Bayar', 'Total', 'Status']
        const rows = filteredOrders.map(o => [
            o.id,
            new Date(o.created_at).toLocaleDateString('id-ID'),
            `"${o.customer_name}"`,
            o.payment?.method || 'Cash',
            o.total_price,
            o.status
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `laporan_penjualan_${month + 1}_${year}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Laporan Penjualan</h1>
                    <p className="text-slate-400 text-sm mt-1">Export data transaksi bulanan ke format CSV/Excel.</p>
                </div>
            </div>

            {/* Filter & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pilih Periode</label>
                    <div className="flex gap-2">
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="bg-slate-800 text-white rounded-lg px-3 py-2 text-sm w-full border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-slate-800 text-white rounded-lg px-3 py-2 text-sm w-full border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-black uppercase mb-2">Total Pendapatan</p>
                        <p className="text-2xl font-black text-emerald-400">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-slate-500 mt-1">{filteredOrders.length} Transaksi Selesai</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><TrendingUp size={28} /></div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-center">
                    <button
                        onClick={downloadCSV}
                        disabled={filteredOrders.length === 0}
                        className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-blue-500/30 hover:border-blue-500"
                    >
                        <Download size={32} />
                        <span className="font-bold">Download Laporan CSV</span>
                    </button>
                </div>
            </div>

            {/* Table Preview */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                    <FileText size={18} className="text-slate-400" />
                    <h3 className="font-bold text-white text-sm">Preview Data</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/80 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">ID</th>
                                <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">Tanggal</th>
                                <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">Pelanggan</th>
                                <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">Metode</th>
                                <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-500">Tidak ada data transaksi selesai pada periode ini.</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-mono text-slate-400">#{order.id}</td>
                                        <td className="px-6 py-4 text-white">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 text-white font-bold">{order.customer_name}</td>
                                        <td className="px-6 py-4 text-slate-300">{order.payment?.method || 'Cash'}</td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold text-right">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
