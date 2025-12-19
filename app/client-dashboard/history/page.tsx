'use client'

import { History, Calendar, Search, Filter, ArrowUpRight } from 'lucide-react'

export default function ClientHistoryPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Riwayat Transaksi</h1>
                    <p className="text-slate-400 font-medium">Daftar semua pesanan yang telah Anda selesaikan.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                        <Filter size={20} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* History Table / Empty State */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-16 md:p-24 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-700 shadow-inner border border-slate-800">
                            <History size={48} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Belum Ada Riwayat</h3>
                            <p className="text-slate-500 font-medium">Transaksi yang telah selesai akan muncul di sini secara otomatis.</p>
                        </div>
                    </div>
                </div>

                {/* Table Header Placeholder (Hidden if empty, but good for structure) */}
                <div className="hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="p-6">ID Pesanan</th>
                                <th className="p-6">Tanggal</th>
                                <th className="p-6">Menu</th>
                                <th className="p-6 text-right">Total</th>
                                <th className="p-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {/* Data will go here */}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-slate-800 shadow-xl group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <Calendar size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Kunjungan</p>
                    <h4 className="text-3xl font-black text-white tracking-tight">0 <span className="text-sm font-medium text-slate-500 uppercase">Kali</span></h4>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-slate-800 shadow-xl group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                            <History size={24} />
                        </div>
                        <ArrowUpRight size={20} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pengeluaran</p>
                    <h4 className="text-3xl font-black text-white tracking-tight">Rp 0</h4>
                </div>
            </div>
        </div>
    )
}
