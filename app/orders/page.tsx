// app/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, History, Clock, CheckCircle, XCircle, Wallet, Loader2, Package, Utensils, MapPin, ArrowRight, ShoppingBag } from 'lucide-react'

interface OrderItem {
  id: number
  menu: { name: string, price: number }
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  customer_name: string
  total_price: number
  status: 'Pending' | 'Paid' | 'Completed' | 'Cancelled'
  type_order: string
  table_number?: string
  payment_method?: string
  created_at: string
  orderItems: OrderItem[]
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const fetchMyOrders = async () => {
      setLoading(true)
      // @ts-ignore
      const userId = session?.user?.id
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/orders?user_id=${userId}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          const sortedOrders = data.sort((a, b) => b.id - a.id);
          setMyOrders(sortedOrders)
        }
      } catch (error) {
        console.error("Gagal fetch orders:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyOrders()
  }, [status, session, router])

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"><Clock size={12} /> Menunggu Pembayaran</span>
      case 'Paid':
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/20 flex items-center gap-2"><Package size={12} /> Sedang Diproses</span>
      case 'Completed':
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"><CheckCircle size={12} /> Selesai</span>
      case 'Cancelled':
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 flex items-center gap-2"><XCircle size={12} /> Dibatalkan</span>
      default:
        return null;
    }
  }

  if (status === 'loading' || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full animate-pulse-ring"></div>

        <div className="relative w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
          <History size={40} className="text-blue-500" strokeWidth={2.5} />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-1.5 h-4 bg-blue-400/40 rounded-full animate-steam"></div>
            <div className="w-1.5 h-6 bg-blue-400/20 rounded-full animate-steam [animation-delay:0.5s]"></div>
          </div>
        </div>
        <div className="mt-12 text-center space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">TEMALA.</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-1">Memuat Riwayat Pesanan</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-sans pb-20 selection:bg-blue-500/30">

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 sticky top-0 z-40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all text-white shadow-lg active:scale-90">
            <ArrowLeft size={20} strokeWidth={3} />
          </Link>
          <div>
            <h1 className="font-black text-2xl text-white uppercase tracking-tighter flex items-center gap-3"><History size={24} className="text-blue-500" /> Riwayat Pesanan</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daftar transaksi Anda di Temala Coffee</p>
          </div>
        </div>
        <Link href="/menu" className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20">
          Pesan Lagi <ArrowRight size={14} />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {myOrders.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-800">
            <div className="bg-slate-950/50 p-10 rounded-full mb-8 border border-slate-800 shadow-inner">
              <Package size={64} className="text-slate-700" strokeWidth={1} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Belum Ada Pesanan</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-xs">Ayo pesan kopi favoritmu sekarang dan nikmati pengalaman terbaik!</p>
            <Link href="/menu" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all active:scale-95">
              Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl group hover:border-blue-500/30 transition-all duration-500">

                {/* Header Pesanan */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-6 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Order ID: <span className="text-white">#{order.id}</span></p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Detail Pesanan */}
                <div className="space-y-3 mb-8">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group/item">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-500 border border-slate-800 group-hover/item:border-blue-500/50 transition-colors">{item.quantity}x</span>
                        <span className="font-black text-white text-sm uppercase tracking-wide group-hover/item:text-blue-400 transition-colors">{item.menu.name}</span>
                      </div>
                      <span className="font-black text-slate-400 text-xs">Rp {(Number(item.subtotal)).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                {/* Ringkasan & Info */}
                <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-800/50 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pembayaran</span>
                    <span className="font-black text-2xl text-white tracking-tighter">Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="h-px bg-slate-800/50"></div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Utensils size={14} className="text-blue-500" /> {order.type_order}
                      </div>
                      {order.table_number && order.table_number !== '-' && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <MapPin size={14} className="text-emerald-500" /> Meja {order.table_number}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Wallet size={14} className="text-amber-500" /> {order.payment_method || 'Tunai'}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {order.status === 'Pending' && (
                  <button
                    onClick={() => alert("Fitur batal belum aktif. Hubungi kasir!")}
                    className="w-full py-4 mt-6 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20 active:scale-95"
                  >
                    Batalkan Pesanan
                  </button>
                )}
                {order.status === 'Completed' && (
                  <Link
                    href="/menu"
                    className="w-full py-4 mt-6 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingBag size={14} /> Pesan Lagi
                  </Link>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}