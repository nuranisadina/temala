'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Printer, CheckCircle, Clock, History, ShoppingCart,
  Plus, Minus, Search, Loader2, Store
} from 'lucide-react'

interface Menu {
  id: number
  name: string
  price: number
  category: string
}

interface CartItem extends Menu {
  quantity: number
}

interface OrderItem {
  id: number
  menu: { name: string; price: number }
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  customer_name: string
  table_number?: string
  type_order: string
  total_price: number
  status: 'Pending' | 'Paid' | 'Completed' | 'Cancelled'
  created_at: string
  orderItems: OrderItem[]
}

export default function KasirPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'incoming' | 'history' | 'pos'>('incoming')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [orderRes, menuRes] = await Promise.all([
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/menus')
      ])
      const orderData = await orderRes.json()
      const menuData = await menuRes.json()
      if (Array.isArray(orderData)) setOrders(orderData)
      if (Array.isArray(menuData)) setMenus(menuData)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const addToCart = (item: Menu) => {
    const existing = cart.find(i => i.id === item.id)
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQty = (id: number, delta: number) => {
    setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  }

  const removeFromCart = (id: number) => setCart(cart.filter(i => i.id !== id))
  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckoutManual = async () => {
    if (!customerName || cart.length === 0) return alert("Isi nama dan pilih menu!")
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customerName,
        type_order: 'Dine In',
        total_price: totalCartPrice,
        status: 'Completed',
        items: cart.map(i => ({ menu_id: i.id, quantity: i.quantity, subtotal: i.price * i.quantity }))
      })
    })
    if (res.ok) {
      alert("Transaksi Berhasil!")
      setCart([])
      setCustomerName('')
      fetchData()
    }
  }

  const incomingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Paid')
  const historyOrders = orders.filter(o => o.status === 'Completed')

  const completeOrder = async (id: number) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    })
    if (res.ok) fetchData()
  }

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="font-family:monospace; width:80mm; padding:10px;">
            <h2 style="text-align:center;">TEMALA COFFEE</h2>
            <hr />
            <p>Nota: #${order.id} | ${new Date(order.created_at).toLocaleTimeString()}</p>
            <p>Pelanggan: ${order.customer_name}</p>
            <hr />
            ${order.orderItems.map(item => `
              <div style="display:flex; justify-content:space-between;">
                <span>${item.quantity}x ${item.menu.name}</span>
                <span>${item.subtotal.toLocaleString()}</span>
              </div>
            `).join('')}
            <hr />
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
              <span>TOTAL</span>
              <span>Rp ${order.total_price.toLocaleString()}</span>
            </div>
            <script>window.onload = () => {window.print(); window.close(); }</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Point of Sale</h1>
          <p className="text-slate-400 font-medium">Kelola pesanan masuk dan transaksi kasir.</p>
        </div>

        <div className="flex bg-slate-900/50 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-800 shadow-2xl">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'incoming' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Clock size={16} /> Pesanan Masuk <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'incoming' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-500'}`}>{incomingOrders.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'pos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Store size={16} /> Input POS
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History size={16} /> Riwayat
          </button>
        </div>
      </div>

      <div className="min-h-[60vh]">
        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
              <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse">Sinkronisasi Data...</p>
            </div>
          </div>
        ) : activeTab === 'pos' ? (
          /* ================= POS SYSTEM ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)]">
            {/* Daftar Produk */}
            <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 flex flex-col overflow-hidden">
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Cari menu favorit pelanggan..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border-2 border-slate-800 rounded-2xl outline-none focus:border-blue-500 text-white transition-all placeholder:text-slate-600 font-bold"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {menus.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => addToCart(menu)}
                    className="p-5 bg-slate-950/30 border border-slate-800 rounded-2xl text-left hover:border-blue-500/50 hover:bg-slate-800/50 transition-all flex flex-col justify-between h-32 group relative overflow-hidden"
                  >
                    <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShoppingCart size={60} />
                    </div>
                    <span className="font-black text-sm text-slate-200 uppercase tracking-wide line-clamp-2 relative z-10 group-hover:text-white transition-colors">{menu.name}</span>
                    <span className="text-blue-500 font-black text-lg relative z-10">Rp {menu.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keranjang POS */}
            <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <h2 className="font-black text-white flex items-center gap-3 uppercase tracking-tight text-lg"><ShoppingCart size={22} className="text-blue-500" /> Keranjang</h2>
              </div>
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Pelanggan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800 group">
                      <div className="flex-1">
                        <p className="text-xs font-black text-white uppercase tracking-wide">{item.name}</p>
                        <p className="text-[10px] font-black text-blue-500 mt-1">Rp {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Minus size={14} strokeWidth={3} /></button>
                        <span className="text-xs font-black text-white min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Plus size={14} strokeWidth={3} /></button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="text-center py-12 opacity-20">
                      <ShoppingCart size={48} className="mx-auto mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest">Kosong</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 border-t border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-black text-slate-500 uppercase tracking-widest text-xs">Total Bayar</span>
                  <span className="font-black text-3xl text-white tracking-tighter">Rp {totalCartPrice.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckoutManual}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-30 disabled:grayscale"
                >
                  PROSES TRANSAKSI
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'incoming' ? (
          /* ================= MONITORING PESANAN ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {incomingOrders.length === 0 ? (
              <div className="col-span-full text-center py-32 bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-800">
                <Clock size={64} className="mx-auto mb-4 text-slate-800" />
                <p className="text-slate-600 font-black uppercase tracking-[0.3em]">Menunggu Pesanan Baru...</p>
              </div>
            ) : incomingOrders.map(order => (
              <div key={order.id} className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl border-t-8 border-t-blue-600 p-8 flex flex-col group hover:scale-[1.02] transition-all duration-300">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-slate-950 text-[10px] font-black text-slate-400 rounded-lg border border-slate-800 uppercase tracking-widest">Order #{order.id}</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1 line-clamp-1">{order.customer_name}</h3>
                  <p className="text-xs text-blue-500 font-black uppercase tracking-widest mb-6">{order.type_order} • Meja {order.table_number || '-'}</p>

                  <div className="space-y-3 border-y border-slate-800/50 py-6 mb-6">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wide"><span className="text-blue-500 font-black mr-2">{item.quantity}x</span> {item.menu.name}</span>
                        <span className="font-black text-white text-sm">Rp {item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handlePrint(order)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-slate-700"><Printer size={16} /> Struk</button>
                  <button onClick={() => completeOrder(order.id)} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"><CheckCircle size={16} /> SELESAI</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ================= RIWAYAT PENJUALAN ================= */
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Pesanan</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu Transaksi</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Pelanggan</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Bayar</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {historyOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-6 font-black text-slate-400 group-hover:text-blue-500 transition-colors">#{order.id}</td>
                      <td className="p-6 text-sm font-bold text-slate-500">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="p-6 font-black text-white uppercase tracking-wide">{order.customer_name}</td>
                      <td className="p-6 text-right font-black text-emerald-500 text-lg">Rp {order.total_price.toLocaleString()}</td>
                      <td className="p-6 text-center">
                        <button onClick={() => handlePrint(order)} className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all"><Printer size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {historyOrders.length === 0 && (
              <div className="text-center py-24 opacity-20">
                <History size={64} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-[0.3em]">Belum Ada Riwayat</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}