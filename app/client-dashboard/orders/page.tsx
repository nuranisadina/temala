'use client'

export default function ClientOrdersPage() {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Pesanan Saya</h2>
                <p className="text-slate-600 mt-1">Lihat semua pesanan yang pernah Anda buat</p>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Pesanan</h3>
                <p className="text-slate-600 mb-6">Anda belum memiliki pesanan. Yuk pesan sekarang!</p>
                <a
                    href="/menu"
                    className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                >
                    Lihat Menu
                </a>
            </div>
        </div>
    )
}
