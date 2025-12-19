'use client'

export default function ClientHistoryPage() {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h2>
                <p className="text-slate-600 mt-1">Lihat semua transaksi yang telah selesai</p>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Riwayat</h3>
                <p className="text-slate-600">Riwayat transaksi Anda akan muncul di sini</p>
            </div>
        </div>
    )
}
