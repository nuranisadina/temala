// app/kasir/reports/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Printer, X, CheckCircle, Clock, History, Phone, Wallet, CreditCard,
    Trash2, Search, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

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
    method: string
    amount: number
}

interface Order {
    id: number
    customer_name: string
    customer_phone?: string
    table_number?: string
    type_order: string
    total_price: number
    status: 'Pending' | 'Paid' | 'Completed' | 'Cancelled'
    created_at: string
    payment: Payment
    orderItems: OrderItem[]
}

// --- KOMPONEN STRUK KHUSUS (HTML MURNI UNTUK INJEKSI) ---
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

    // Tab: 'active' | 'history'
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

    // 1. Fetch Data
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

    // FUNGSI UTAMA CETAK STRUK - METODE MANIPULASI DOM (PALING AGRESIF)
    const handlePrint = () => {
        if (!selectedOrder) return;

        const printContents = getReceiptHTML(selectedOrder);
        const originalContents = document.body.innerHTML;

        // Sisipkan CSS print media agar format 80mm dijalankan
        const printStyle = `
          <style>
              @media print {
                  @page { 
                      size: 80mm auto;
                      margin: 0;
                  }
                  body {
                      font-family: monospace;
                      margin: 0;
                      padding: 0;
                  }
              }
          </style>
      `;

        // 1. Timpa body dengan konten struk
        document.body.innerHTML = printStyle + printContents;

        // 2. Panggil dialog print
        window.print();

        // 3. Setelah print selesai (atau dibatalkan), kembalikan body asli
        // Menggunakan setTimeout untuk memberi waktu dialog print muncul
        setTimeout(() => {
            document.body.innerHTML = originalContents;
            // Tutup modal setelah mengembalikan konten body
            setSelectedOrder(null);
        }, 50);
    };

    // 2. Update Status (Selesai / Batal)
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

    // 3. FUNGSI HAPUS PESANAN
    const deleteOrder = async (id: number) => {
        if (!confirm(`HAPUS PERMANEN pesanan #${id}? Data tidak bisa dikembalikan.`)) return

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

    // 4. Filter Data sesuai Tab
    const activeOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Pending')
    const historyOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled')
    const displayOrders = activeTab === 'active' ? activeOrders : historyOrders

    // 5. LOGIKA REKAP KEUANGAN
    const validOrders = orders.filter(o => o.status === 'Completed')
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_price), 0)

    const totalCash = validOrders
        .filter(o => o.payment?.method === 'Cash')
        .reduce((sum, o) => sum + Number(o.total_price), 0)

    const totalQRIS = validOrders
        .filter(o => o.payment?.method === 'QRIS' || o.payment?.method === 'Online')
        .reduce((sum, o) => sum + Number(o.total_price), 0)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 p-6">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Laporan & Kasir</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pantau pesanan aktif dan rekap pendapatan harian (Akses Kasir).</p>
                </div>
                <button onClick={fetchOrders} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
                    Refresh Data ⟳
                </button>
            </div>

            {/* REKAP KEUANGAN (CARD) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Total Omset */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1 tracking-wider">Total Pendapatan (Completed)</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Clock size={28} /></div>
                </div>

                {/* Total Tunai */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 font-bold uppercase mb-1 tracking-wider">Tunai (Cash)</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Rp {totalCash.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-emerald-600 dark:text-emerald-400"><Wallet size={28} /></div>
                </div>

                {/* Total QRIS */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-1 tracking-wider">Non-Tunai (QRIS/Online)</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Rp {totalQRIS.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl text-indigo-600 dark:text-indigo-400"><CreditCard size={28} /></div>
                </div>
            </div>

            {/* TAB NAVIGASI */}
            <div className="flex gap-1 mb-0 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'active'
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    <Clock size={18} /> Pesanan Aktif <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-1">{activeOrders.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'history'
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    <History size={18} /> Riwayat Pesanan <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">{historyOrders.length}</span>
                </button>
            </div>

            {/* TABEL PESANAN */}
            <div className="bg-white dark:bg-slate-800 rounded-b-xl shadow-sm border border-slate-200 dark:border-slate-700 border-t-0 overflow-hidden min-h-[400px]">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Order Info</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Pelanggan</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status / Bayar</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Total</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-20 font-bold text-slate-400 animate-pulse">Memuat data pesanan...</td></tr>
                        ) : displayOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-20 flex flex-col items-center justify-center text-slate-400">
                                    <History size={40} className="mb-2 opacity-50" />
                                    <p>Belum ada data di tab ini.</p>
                                </td>
                            </tr>
                        ) : (
                            displayOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">

                                    {/* KOLOM 1: ID & WAKTU */}
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">#{order.id}</span>
                                        <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </div>
                                    </td>

                                    {/* KOLOM 2: PELANGGAN */}
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-base">{order.customer_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${order.type_order === 'Dine In' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
                                                {order.type_order}
                                            </span>
                                            {order.table_number && order.table_number !== '-' && (
                                                <span className="text-xs text-slate-500 font-medium">• Meja {order.table_number}</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* KOLOM 3: STATUS & PEMBAYARAN */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1.5">
                                            {/* Status Badge */}
                                            {order.status === 'Cancelled' ? (
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">Dibatalkan</span>
                                            ) : order.status === 'Completed' ? (
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1"><CheckCircle size={12} /> Selesai</span>
                                            ) : order.status === 'Paid' ? (
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 animate-pulse">Sedang Diproses</span>
                                            ) : (
                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-500/20 animate-pulse">Menunggu Proses</span>
                                            )}

                                            {/* Payment Method */}
                                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                Via: {order.payment?.method || 'CASH'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* KOLOM 4: TOTAL HARGA */}
                                    <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-100 text-base">
                                        Rp {Number(order.total_price).toLocaleString('id-ID')}
                                    </td>

                                    {/* KOLOM 5: AKSI */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Tombol Cetak Struk */}
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg border border-slate-200 transition bg-white shadow-sm"
                                                title="Lihat Detail & Cetak"
                                            >
                                                <Printer size={18} />
                                            </button>

                                            {/* Tombol AKSI (Hanya di Tab Aktif) */}
                                            {activeTab === 'active' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'Cancelled')}
                                                        className="p-2 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg border border-slate-200 transition bg-white shadow-sm"
                                                        title="Batalkan Pesanan"
                                                    >
                                                        <X size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => updateStatus(order.id, 'Completed')}
                                                        className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md hover:shadow-emerald-200 transition transform hover:-translate-y-0.5"
                                                    >
                                                        <CheckCircle size={16} /> Selesai
                                                    </button>
                                                </>
                                            )}

                                            {/* Tombol HAPUS (Hanya di Tab History) */}
                                            {activeTab === 'history' && (
                                                <button
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg border border-slate-200 transition bg-white shadow-sm"
                                                    title="Hapus Data Permanen"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* === MODAL CETAK STRUK (POP-UP) === */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95">

                        {/* Header Modal */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Order #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="hover:bg-slate-200 p-1 rounded-full transition"><X size={20} className="text-slate-500" /></button>
                        </div>

                        {/* Area Struk untuk Preview dan dicopy oleh handlePrint */}
                        <div className="p-8 text-sm space-y-4 bg-white" id="receipt-content-area">

                            {/* Konten Struk Menggunakan Komponen Struk Khusus */}
                            <div id="receipt-print-target">
                                {/* Panggil fungsi ReceiptComponent di sini */}
                                {selectedOrder && (
                                    <div id="receipt-content-to-print">
                                        <div style={{ padding: '0', margin: '0' }}>
                                            <div className="header" style={{ marginBottom: '10px' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>TEMALA.</div>
                                                <div style={{ fontSize: '10px', textAlign: 'center' }}>COFFEE & MORE</div>
                                                <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>Jl. Temala No. 1, Pekanbaru</div>
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', margin: '5px 0', padding: '5px 0' }}></div>

                                            <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <div>Pelanggan: {selectedOrder.customer_name}</div>
                                                <div>Bayar: {selectedOrder.payment?.method || 'CASH'}</div>
                                            </div>
                                            <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                <div>Tgl: {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}</div>
                                                <div>Waktu: {new Date(selectedOrder.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', margin: '5px 0', padding: '5px 0' }}></div>

                                            {/* List Item Struk */}
                                            <div className="item-list">
                                                {selectedOrder.orderItems.map((item: OrderItem) => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', lineHeight: '1.4' }}>
                                                        <span style={{ maxWidth: '60%' }}>{item.quantity}x {item.menu.name}</span>
                                                        <span style={{ fontWeight: 'bold' }}>{Number(item.subtotal).toLocaleString('id-ID')}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ borderTop: '1px dashed #000', margin: '5px 0', padding: '5px 0' }}></div>

                                            <div className="total-section">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                                                    <span>TOTAL</span>
                                                    <span>Rp {Number(selectedOrder.total_price).toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>

                                            {selectedOrder.status === 'Cancelled' && (
                                                <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'red', marginTop: '10px' }}>
                                                    *** TRANSAKSI DIBATALKAN ***
                                                </div>
                                            )}

                                            <div className="footer" style={{ marginTop: '15px', fontSize: '10px', color: '#666', textAlign: 'center' }}>
                                                -- Terima Kasih --<br />
                                                Silakan Berkunjung Kembali
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Tombol Print */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handlePrint}
                                className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg text-sm uppercase tracking-wide"
                            >
                                <Printer size={18} /> CETAK STRUK
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}
