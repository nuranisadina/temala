'use client'

import { useSession } from 'next-auth/react'

export default function ClientProfilePage() {
    const { data: session } = useSession()

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Profil Saya</h2>
                <p className="text-slate-600 mt-1">Kelola informasi profil Anda</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-4xl">
                                {session?.user?.name?.charAt(0)}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{session?.user?.name}</h3>
                        <p className="text-sm text-slate-600 mb-4">{session?.user?.email}</p>
                        <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                            Pelanggan
                        </span>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Informasi Akun</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <span className="text-sm font-medium text-slate-600">Nama Lengkap</span>
                                <span className="text-sm font-bold text-slate-900">{session?.user?.name}</span>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <span className="text-sm font-medium text-slate-600">Email</span>
                                <span className="text-sm font-bold text-slate-900">{session?.user?.email}</span>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <span className="text-sm font-medium text-slate-600">Role</span>
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                    Pelanggan
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm font-medium text-slate-600">Status Akun</span>
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    Aktif
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <button className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition">
                                Edit Profil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
