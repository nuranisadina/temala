'use client'

import { useSession } from 'next-auth/react'
import { User, Mail, Shield, Settings, Camera, Edit3, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function ClientProfilePage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Profil Saya</h1>
                    <p className="text-slate-400 font-medium">Kelola informasi akun dan preferensi Anda.</p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl font-black text-sm transition-all border border-red-500/20 active:scale-95"
                >
                    <LogOut size={18} /> Keluar Akun
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-blue-800 -z-10"></div>

                        <div className="relative inline-block mt-8">
                            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 shadow-2xl overflow-hidden">
                                <span className="text-white font-black text-5xl uppercase">
                                    {session?.user?.name?.charAt(0)}
                                </span>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all border-2 border-slate-900">
                                <Camera size={18} />
                            </button>
                        </div>

                        <div className="mt-6 space-y-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{session?.user?.name}</h3>
                            <p className="text-slate-500 font-bold text-sm">{session?.user?.email}</p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <div className="flex justify-around">
                                <div className="text-center">
                                    <p className="text-xl font-black text-white">0</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pesanan</p>
                                </div>
                                <div className="w-px h-8 bg-slate-800"></div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-white">Aktif</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Keamanan</h4>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-950/50 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-blue-500" />
                                <span className="text-sm font-black text-white uppercase tracking-wide">Ganti Password</span>
                            </div>
                            <Settings size={16} className="text-slate-600 group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                            <h3 className="font-black text-xl text-white flex items-center gap-3 uppercase tracking-tight">
                                <User size={24} className="text-blue-500" />
                                Informasi Akun
                            </h3>
                            <button className="flex items-center gap-2 text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-all">
                                <Edit3 size={16} /> Edit Profil
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <User size={12} /> Nama Lengkap
                                    </label>
                                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-bold">
                                        {session?.user?.name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Mail size={12} /> Alamat Email
                                    </label>
                                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-bold">
                                        {session?.user?.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Shield size={12} /> Role Akses
                                    </label>
                                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Pelanggan
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Shield size={12} /> Status Akun
                                    </label>
                                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Terverifikasi
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-800/50">
                                <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                        <Settings size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-tight">Lengkapi Data Diri</h4>
                                        <p className="text-slate-500 text-sm mt-1">Lengkapi alamat dan nomor telepon untuk memudahkan proses pengantaran pesanan Anda.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
