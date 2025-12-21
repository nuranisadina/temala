// app/client-dashboard/orders/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingBag, ArrowRight, Package, Clock, CheckCircle, Coffee, RefreshCw, XCircle, Eye, ImageIcon, X } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
    id: number
    menu: { name: string; price: number }
    quantity: number
    subtotal: number
}

interface Payment {
    id: number
    method: string
    status: string
    amount: number
    payment_proof?: string
}

interface Order {
    id: number
    customer_name: string
    customer_phone?: string
    table_number?: string
    type_order: string
    total_price: number
    status: string
    created_at: string
    payment?: Payment
    orderItems: OrderItem[]
}

export default function ClientOrdersPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [proofModalOpen, setProofModalOpen] = useState(false)
    const [selectedProof, setSelectedProof] = useState<string | null>(null)

    const fetchOrders = useCallback(async () => {
        if (!session?.user) return

        setLoading(true)
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
            console.error("Gagal mengambil data pesanan:", error)
        } finally {
            setLoading(false)
        }
    }, [session])

    useEffect(() => {
        fetchOrders()
        // Auto-refresh setiap 10 detik untuk sinkronisasi real-time
        const interval = setInterval(fetchOrders, 10000)
        return () => clearInterval(interval)
    }, [fetchOrders])

    // Filter pesanan aktif dan selesai
    const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Paid' || o.status === 'Served')
    const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled')

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-lg flex items-center gap-1"><Clock size={12} /> Menunggu</span>
            case 'Paid':
                return <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg flex items-center gap-1"><Package size={12} /> Diproses</span>
            case 'Served':
                return <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-lg flex items-center gap-1"><CheckCircle size={12} /> Disajikan</span>
            case 'Completed':
                return <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1"><CheckCircle size={12} /> Lunas</span>
            case 'Cancelled':
                return <span className="text-xs font-bold text-red-400 bg-red-500/20 px-3 py-1 rounded-lg flex items-center gap-1"><XCircle size={12} /> Dibatalkan</span>
            default:
                return <span className="text-xs font-bold text-slate-400 bg-slate-500/20 px-3 py-1 rounded-lg">{status}</span>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Pesanan Saya</h1>
                    <p className="text-slate-400 font-medium">Pantau status pesanan aktif Anda di sini.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchOrders} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
                        <RefreshCw size={18} />
                    </button>
                    <Link href="/client-dashboard/menu" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg">
                        Pesan Lagi <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                        <Coffee size={28} className="text-blue-500" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-6 animate-pulse">Memuat Pesanan...</p>
                </div>
            ) : (
                <>
                    {/* Pesanan Aktif */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" /> Pesanan Aktif
                            {activeOrders.length > 0 && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg">{activeOrders.length}</span>
                            )}
                        </h2>

                        {activeOrders.length === 0 ? (
                            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-12 text-center">
                                <ShoppingBag size={48} className="mx-auto text-slate-700 mb-4" />
                                <h3 className="font-bold text-white mb-2">Tidak Ada Pesanan Aktif</h3>
                                <p className="text-slate-500 text-sm mb-4">Yuk, pesan menu favorit Anda!</p>
                                <Link href="/client-dashboard/menu" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all">
                                    Lihat Menu
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeOrders.map(order => (
                                    <div key={order.id} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-5 hover:border-blue-500/50 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs text-slate-500 font-bold">Order #{order.id}</span>
                                                <p className="text-white font-bold mt-1">{order.customer_name}</p>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="space-y-2 mb-4 py-3 border-y border-slate-800">
                                            {order.orderItems?.slice(0, 3).map(item => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-slate-400">{item.quantity}x {item.menu?.name}</span>
                                                    <span className="text-white font-bold">Rp {Number(item.subtotal).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {order.orderItems?.length > 3 && (
                                                <p className="text-xs text-slate-500">+{order.orderItems.length - 3} item lainnya</p>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-xs text-slate-500">Total</span>
                                                <p className="text-white font-black text-lg">Rp {Number(order.total_price).toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {order.payment?.payment_proof && (
                                                    <button
                                                        onClick={() => { setSelectedProof(order.payment!.payment_proof!); setProofModalOpen(true); }}
                                                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                                                        title="Lihat Bukti"
                                                    >
                                                        <ImageIcon size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
                                                    title="Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 text-xs text-slate-500">
                                            {new Date(order.created_at).toLocaleString('id-ID')} • {order.type_order} • Via {order.payment?.method || 'Cash'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Riwayat Pesanan */}
                    {completedOrders.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <CheckCircle size={20} className="text-emerald-500" /> Riwayat Pesanan
                            </h2>

                            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-900/80 border-b border-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase">Order</th>
                                            <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase hidden md:table-cell">Tanggal</th>
                                            <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {completedOrders.slice(0, 10).map(order => (
                                            <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-white">#{order.id}</span>
                                                    <p className="text-xs text-slate-500 md:hidden">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-white">
                                                    Rp {Number(order.total_price).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Order Process Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/30 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase">Pending</p>
                        <p className="text-xs text-slate-500 mt-1">Menunggu konfirmasi kasir.</p>
                    </div>
                </div>
                <div className="bg-slate-900/30 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase">Diproses</p>
                        <p className="text-xs text-slate-500 mt-1">Barista sedang menyiapkan.</p>
                    </div>
                </div>
                <div className="bg-slate-900/30 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase">Disajikan</p>
                        <p className="text-xs text-slate-500 mt-1">Pesanan diantar ke meja.</p>
                    </div>
                </div>
                <div className="bg-slate-900/30 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white uppercase">Selesai</p>
                        <p className="text-xs text-slate-500 mt-1">Transaksi lunas / Selesai.</p>
                    </div>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-800">
                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white">Detail Order #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Status</span>
                                {getStatusBadge(selectedOrder.status)}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Pelanggan</span>
                                <span className="text-white font-bold">{selectedOrder.customer_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Tipe</span>
                                <span className="text-white font-bold">{selectedOrder.type_order}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Pembayaran</span>
                                <span className="text-white font-bold">{selectedOrder.payment?.method || 'Cash'}</span>
                            </div>
                            <div className="border-t border-slate-800 pt-4 space-y-2">
                                <p className="text-xs text-slate-500 font-bold uppercase">Item Pesanan</p>
                                {selectedOrder.orderItems?.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-slate-400">{item.quantity}x {item.menu?.name}</span>
                                        <span className="text-white font-bold">Rp {Number(item.subtotal).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                                <span className="text-white font-bold">TOTAL</span>
                                <span className="text-white font-black text-xl">Rp {Number(selectedOrder.total_price).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Proof Modal */}
            {proofModalOpen && selectedProof && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-800">
                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2"><ImageIcon size={20} /> Bukti Pembayaran</h3>
                            <button onClick={() => { setProofModalOpen(false); setSelectedProof(null); }} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-4">
                            <img src={selectedProof} alt="Bukti Pembayaran" className="w-full rounded-xl border border-slate-700" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
