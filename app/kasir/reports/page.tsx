// app/kasir/reports/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Printer, X, CheckCircle, Clock, History, Wallet, CreditCard,
    Trash2, RefreshCw, ImageIcon, Eye, XCircle
} from 'lucide-react'

// --- TIPE DATA ---
interface MenuData {
    name: string,
    price: number
}

interface OrderItem {
    id: number
    menu: MenuData
    quantity: number
    subtotal: number
}

interface Payment {
    id: number
    method: string
    amount: number
    status: string
    payment_proof?: string
    verified_at?: string
    verified_by?: string
}

interface Order {
    id: number
    customer_name: string
    customer_phone?: string
    table_number?: string
    type_order: string
    total_price: number
    status: 'Pending' | 'Paid' | 'Served' | 'Completed' | 'Cancelled'
    created_at: string
    payment: Payment
    orderItems: OrderItem[]
}

// --- KOMPONEN STRUK ---
const getReceiptHTML = (order: Order) => {
    return `
        <div style="font-family: monospace; font-size: 12px; line-height: 1.4; padding: 15px; width: 80mm;">
            <div style="text-align: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #333;">
                <div style="font-size: 18px; font-weight: bold; text-transform: uppercase;">TEMALA.</div>
                <div style="font-size: 10px;">COFFEE & MORE</div>
                <div style="font-size: 10px; color: #666;">Jl. Temala No. 1, Pekanbaru</div>
            </div>
            <div style="font-size: 10px; display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Pelanggan: ${order.customer_name}</div>
                <div>Bayar: ${order.payment?.method || 'CASH'}</div>
            </div>
            <div style="font-size: 10px; display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div>Tgl: ${new Date(order.created_at).toLocaleDateString('id-ID')}</div>
                <div>Waktu: ${new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
            ${order.orderItems.map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 12px; line-height: 1.4;">
                    <span style="max-width: 60%;">${item.quantity}x ${item.menu.name}</span>
                    <span style="font-weight: bold;">${Number(item.subtotal).toLocaleString('id-ID')}</span>
                </div>
            `).join('')}
            <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
            <div style="padding-top: 5px;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                    <span>TOTAL</span>
                    <span>Rp ${Number(order.total_price).toLocaleString('id-ID')}</span>
                </div>
            </div>
            ${order.status === 'Cancelled' ? `<div style="text-align: center; font-weight: bold; color: red; margin-top: 10px;">*** TRANSAKSI DIBATALKAN ***</div>` : ''}
            <div style="margin-top: 15px; font-size: 10px; color: #666; text-align: center;">
                -- Terima Kasih --<br/>
                Silakan Berkunjung Kembali
            </div>
        </div>
    `;
};

export default function KasirReportsPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [proofModalOpen, setProofModalOpen] = useState(false)
    const [selectedProof, setSelectedProof] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/orders', { cache: 'no-store' })
            const data = await res.json()
            if (Array.isArray(data)) {
                setOrders(data)
            }
        } catch (error) {
            console.error("Gagal ambil data order:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handlePrint = () => {
        if (!selectedOrder) return;
        const printContents = getReceiptHTML(selectedOrder);
        const originalContents = document.body.innerHTML;
        const printStyle = `
          <style>
              @media print {
                  @page { size: 80mm auto; margin: 0; }
                  body { font-family: monospace; margin: 0; padding: 0; }
              }
          </style>
        `;
        document.body.innerHTML = printStyle + printContents;
        window.print();
        setTimeout(() => {
            document.body.innerHTML = originalContents;
            setSelectedOrder(null);
        }, 50);
    };

    // Verifikasi Pembayaran
    const verifyPayment = async (paymentId: number, status: 'Success' | 'Failed') => {
        const action = status === 'Success' ? 'verifikasi' : 'tolak';
        if (!confirm(`Yakin ingin ${action} pembayaran ini?`)) return

        try {
            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    verified_by: 'Kasir' // Bisa diganti dengan nama kasir login
                })
            })

            if (res.ok) {
                fetchOrders()
                alert(status === 'Success' ? 'Pembayaran terverifikasi!' : 'Pembayaran ditolak')
            } else {
                alert("Gagal update status pembayaran")
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem")
        }
    }

    const updateStatus = async (id: number, newStatus: string) => {
        const action = newStatus === 'Completed' ? 'selesaikan' : 'batalkan';
        if (!confirm(`Yakin ingin mem-${action} pesanan #${id}?`)) return

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                fetchOrders()
            } else {
                alert("Gagal update status pesanan")
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem")
        }
    }

    const deleteOrder = async (id: number) => {
        if (!confirm(`HAPUS PERMANEN pesanan #${id}?`)) return

        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchOrders()
            } else {
                alert("Gagal menghapus data.")
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus.")
        }
    }

    const activeOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Pending' || o.status === 'Served')
    const historyOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled')
    const displayOrders = activeTab === 'active' ? activeOrders : historyOrders

    const validOrders = orders.filter(o => o.status === 'Completed')
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_price), 0)
    const totalCash = validOrders.filter(o => o.payment?.method === 'Cash').reduce((sum, o) => sum + Number(o.total_price), 0)
    const totalQRIS = validOrders.filter(o => o.payment?.method === 'QRIS' || o.payment?.method === 'Online').reduce((sum, o) => sum + Number(o.total_price), 0)

    // Hitung pesanan yang butuh verifikasi
    const needVerification = orders.filter(o => o.status === 'Paid' && o.payment?.payment_proof && o.payment?.status === 'Pending').length

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Laporan & Kasir</h1>
                    <p className="text-slate-400 text-sm mt-1">Pantau pesanan aktif dan verifikasi pembayaran.</p>
                </div>
                <button onClick={fetchOrders} className="bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition shadow-lg flex items-center gap-2">
                    <RefreshCw size={16} /> Refresh Data
                </button>
            </div>

            {/* REKAP KEUANGAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between hover:shadow-blue-900/10 transition-all group">
                    <div>
                        <p className="text-xs text-slate-500 font-black uppercase mb-2 tracking-widest">Total Pendapatan</p>
                        <p className="text-2xl font-black text-white">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform"><Clock size={28} /></div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between hover:shadow-emerald-900/10 transition-all group">
                    <div>
                        <p className="text-xs text-emerald-500 font-black uppercase mb-2 tracking-widest">Tunai (Cash)</p>
                        <p className="text-2xl font-black text-emerald-400">Rp {totalCash.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform"><Wallet size={28} /></div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between hover:shadow-indigo-900/10 transition-all group">
                    <div>
                        <p className="text-xs text-indigo-400 font-black uppercase mb-2 tracking-widest">Non-Tunai (QRIS)</p>
                        <p className="text-2xl font-black text-indigo-400">Rp {totalQRIS.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:scale-110 transition-transform"><CreditCard size={28} /></div>
                </div>
            </div>

            {/* TAB */}
            <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
                <button onClick={() => setActiveTab('active')}
                    className={`px-6 py-2.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Clock size={16} /> Pesanan Aktif
                    <span className={`px-2 py-0.5 rounded-lg text-xs ml-1 ${activeTab === 'active' ? 'bg-blue-500/30 text-white' : 'bg-slate-700 text-slate-400'}`}>{activeOrders.length}</span>
                    {needVerification > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white rounded-lg text-xs animate-pulse">🔔 {needVerification}</span>
                    )}
                </button>
                <button onClick={() => setActiveTab('history')}
                    className={`px-6 py-2.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <History size={16} /> Riwayat
                    <span className={`px-2 py-0.5 rounded-lg text-xs ml-1 ${activeTab === 'history' ? 'bg-blue-500/30 text-white' : 'bg-slate-700 text-slate-400'}`}>{historyOrders.length}</span>
                </button>
            </div>

            {/* TABEL */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-xs">Order</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-xs">Pelanggan</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-xs">Status</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-xs">Bukti</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-xs">Total</th>
                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-xs text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-20 font-bold text-slate-500 animate-pulse">Memuat data...</td></tr>
                        ) : displayOrders.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-20"><div className="flex flex-col items-center text-slate-500"><History size={40} className="mb-3 opacity-40" /><p className="font-bold">Belum ada data</p></div></td></tr>
                        ) : (
                            displayOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg text-xs border border-slate-700">#{order.id}</span>
                                        <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-white">{order.customer_name}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase mt-1 inline-block ${order.type_order === 'Dine In' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {order.type_order}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'Cancelled' ? (
                                            <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2.5 py-1 rounded-lg">Dibatalkan</span>
                                        ) : order.status === 'Completed' ? (
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit"><CheckCircle size={12} /> Lunas</span>
                                        ) : order.status === 'Served' ? (
                                            <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit"><CheckCircle size={12} /> Disajikan</span>
                                        ) : order.status === 'Paid' ? (
                                            <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit"><Clock size={12} /> Diproses</span>
                                        ) : (
                                            <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg animate-pulse flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">Via: {order.payment?.method || 'Cash'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.payment?.payment_proof ? (
                                            <button
                                                onClick={() => { setSelectedProof(order.payment.payment_proof!); setProofModalOpen(true); }}
                                                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all"
                                            >
                                                <ImageIcon size={14} /> Lihat Bukti
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-black text-white">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition bg-slate-800" title="Cetak"><Printer size={18} /></button>

                                            {activeTab === 'active' && (
                                                <>
                                                    {/* Status: PENDING - Pesanan Baru */}
                                                    {order.status === 'Pending' && !order.payment?.payment_proof && (
                                                        <>
                                                            <button onClick={() => updateStatus(order.id, 'Cancelled')} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-slate-700 transition bg-slate-800" title="Batal"><XCircle size={18} /></button>
                                                            <button onClick={() => updateStatus(order.id, 'Paid')} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg" title="Proses"><Clock size={16} /> Proses</button>
                                                        </>
                                                    )}

                                                    {/* Status: PAID dengan Bukti - Butuh Verifikasi */}
                                                    {order.payment?.payment_proof && order.payment?.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => verifyPayment(order.payment.id, 'Failed')} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-slate-700 transition bg-slate-800" title="Tolak"><XCircle size={18} /></button>
                                                            <button onClick={() => verifyPayment(order.payment.id, 'Success')} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg" title="Verifikasi"><CheckCircle size={16} /> Verifikasi</button>
                                                        </>
                                                    )}

                                                    {/* Status: PAID/Diproses - Siap disajikan */}
                                                    {(order.status === 'Paid' && (!order.payment?.payment_proof || order.payment?.status === 'Success')) && (
                                                        <>
                                                            <button onClick={() => updateStatus(order.id, 'Cancelled')} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-slate-700 transition bg-slate-800" title="Batal"><X size={18} /></button>
                                                            <button onClick={() => updateStatus(order.id, 'Served')} className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-500 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg"><CheckCircle size={16} /> Sajikan</button>
                                                        </>
                                                    )}

                                                    {/* Status: SERVED - Sudah disajikan, menunggu pembayaran */}
                                                    {order.status === 'Served' && (
                                                        <>
                                                            <button onClick={() => updateStatus(order.id, 'Completed')} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg"><CheckCircle size={16} /> Bayar</button>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {activeTab === 'history' && (
                                                <button onClick={() => deleteOrder(order.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-slate-700 transition bg-slate-800" title="Hapus"><Trash2 size={18} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CETAK STRUK */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-800">
                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white">Order #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-8 bg-white text-sm">
                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>TEMALA.</div>
                                <div style={{ fontSize: '10px' }}>COFFEE & MORE</div>
                            </div>
                            <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                            <div style={{ fontSize: '10px' }}>Pelanggan: {selectedOrder.customer_name}</div>
                            <div style={{ fontSize: '10px' }}>Bayar: {selectedOrder.payment?.method || 'CASH'}</div>
                            <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                            {selectedOrder.orderItems.map((item: OrderItem) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                    <span>{item.quantity}x {item.menu.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>{Number(item.subtotal).toLocaleString('id-ID')}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                                <span>TOTAL</span>
                                <span>Rp {Number(selectedOrder.total_price).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800 border-t border-slate-700">
                            <button onClick={handlePrint} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition shadow-lg">
                                <Printer size={18} /> CETAK STRUK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL LIHAT BUKTI PEMBAYARAN */}
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
