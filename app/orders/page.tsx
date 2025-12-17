// app/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, History, Clock, CheckCircle, XCircle, Wallet, Loader2, Package, Utensils, MapPin } from 'lucide-react'

// --- TIPE DATA ---
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

// PASTIKAN NAMA FUNGSI INI BENAR
export default function MyOrdersPage() { 
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  // 1. Cek Login & Fetch Data
  useEffect(() => {
    if (status === 'loading') return
    
    // Wajib Login
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const fetchMyOrders = async () => {
      setLoading(true)
      // Ambil ID user yang login
      // @ts-ignore
      const userId = session?.user?.id 
      if (!userId) {
          setLoading(false)
          return
      }

      try {
        // Asumsi API /api/orders bisa menerima query 'user_id' untuk filter
        const res = await fetch(`/api/orders?user_id=${userId}`) 
        const data = await res.json()
        
        if(Array.isArray(data)) {
            // Urutkan dari yang terbaru (ID terbesar)
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
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-orange-700 bg-orange-100 flex items-center gap-1"><Clock size={12}/> Menunggu Pembayaran</span>
      case 'Paid':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-100 flex items-center gap-1"><Package size={12}/> Sedang Diproses</span>
      case 'Completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-green-700 bg-green-100 flex items-center gap-1"><CheckCircle size={12}/> Selesai</span>
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-red-700 bg-red-100 flex items-center gap-1"><XCircle size={12}/> Dibatalkan</span>
      default:
        return null;
    }
  }
  
  if (status === 'loading' || loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={32}/>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-slate-100">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-700">
          <ArrowLeft size={20}/>
        </Link>
        <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2"><History size={20}/> Riwayat Pesanan Saya</h1>
      </div>

      <div className="max-w-xl mx-auto p-4">
        {myOrders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="bg-slate-200 p-6 rounded-full mb-4">
                <Package size={48} className="text-slate-400"/>
            </div>
            <h2 className="text-xl font-bold text-slate-600">Belum Ada Pesanan</h2>
            <p className="text-slate-400 mb-6">Ayo pesan kopi favoritmu sekarang!</p>
            <Link href="/menu" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg">
              Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
                
                {/* Header Pesanan */}
                <div className="flex justify-between items-start border-b border-dashed border-slate-100 pb-3 mb-3">
                    <div>
                        <p className="text-xs text-slate-400 font-bold">Order ID: <span className="font-mono text-slate-700">#{order.id}</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    {getStatusBadge(order.status)}
                </div>

                {/* Detail Pesanan */}
                <div className="text-sm space-y-2">
                    {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-slate-700">
                            <span className="font-medium line-clamp-1">{item.quantity}x {item.menu.name}</span>
                            <span className="font-bold text-xs">Rp {(Number(item.subtotal)).toLocaleString('id-ID')}</span>
                        </div>
                    ))}
                    {order.orderItems.length > 3 && (
                        <p className="text-xs text-slate-400 italic mt-1">+{order.orderItems.length - 3} item lainnya</p>
                    )}
                </div>

                {/* Ringkasan & Info */}
                <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                    <div className="flex justify-between font-bold text-base">
                        <span>Total Bayar:</span>
                        <span className="text-blue-600">Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Utensils size={14}/> {order.type_order}</span>
                        {order.table_number && order.table_number !== '-' && (
                            <span className="flex items-center gap-1"><MapPin size={14}/> Meja {order.table_number}</span>
                        )}
                        <span className="flex items-center gap-1"><Wallet size={14}/> {order.payment_method || 'Tunai'}</span>
                    </div>
                    
                    {/* Tombol Aksi (Misal: Batalkan jika status masih Pending) */}
                    {order.status === 'Pending' && (
                        <button 
                            onClick={() => alert("Fitur batal belum aktif. Hubungi kasir!")}
                            className="w-full text-center py-2 mt-3 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        >
                            Batalkan Pesanan
                        </button>
                    )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}