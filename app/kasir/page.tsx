// app/kasir/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Printer, CheckCircle, Clock, History, ShoppingCart, 
  Plus, Minus, Trash2, Search, X, Loader2, User, Store
} from 'lucide-react'

// --- TIPE DATA ---
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
  
  // State untuk Fitur POS
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // --- 1. FETCH DATA PESANAN & MENU ---
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
    const interval = setInterval(fetchData, 10000) // Auto-refresh setiap 10 detik
    return () => clearInterval(interval)
  }, [fetchData])

  // --- 2. LOGIKA POS (INPUT MANUAL) ---
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
        status: 'Completed', // Langsung selesai karena bayar di kasir
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

  // --- 3. LOGIKA MONITORING PESANAN ---
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

  // --- 4. FUNGSI CETAK STRUK ---
  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="font-family:monospace; width:80mm; padding:10px;">
            <h2 style="text-align:center;">TEMALA COFFEE</h2>
            <p style="text-align:center; font-size:10px;">Jl. Temala No. 1, Pekanbaru</p>
            <hr/>
            <p>Nota: #${order.id} | ${new Date(order.created_at).toLocaleTimeString()}</p>
            <p>Pelanggan: ${order.customer_name}</p>
            <hr/>
            ${order.orderItems.map(item => `
              <div style="display:flex; justify-content:space-between;">
                <span>${item.quantity}x ${item.menu.name}</span>
                <span>${item.subtotal.toLocaleString()}</span>
              </div>
            `).join('')}
            <hr/>
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
              <span>TOTAL</span>
              <span>Rp ${order.total_price.toLocaleString()}</span>
            </div>
            <p style="text-align:center; margin-top:20px;">Terima Kasih!</p>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      {/* HEADER NAV */}
      <header className="bg-blue-800 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter uppercase">TML. KASIR</h1>
        <div className="flex bg-blue-900/50 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'incoming' ? 'bg-white text-blue-800' : 'hover:bg-blue-800'}`}
          >
            Pesanan Masuk ({incomingOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'pos' ? 'bg-white text-blue-800' : 'hover:bg-blue-800'}`}
          >
            Input POS
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'history' ? 'bg-white text-blue-800' : 'hover:bg-blue-800'}`}
          >
            Riwayat
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
        ) : activeTab === 'pos' ? (
          /* ================= POS SYSTEM ================= */
          <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Daftar Produk */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 flex flex-col">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                <input 
                  type="text" placeholder="Cari menu kopi..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2">
                {menus.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(menu => (
                  <button 
                    key={menu.id} 
                    onClick={() => addToCart(menu)}
                    className="p-3 border rounded-xl text-left hover:bg-blue-50 transition border-slate-100 flex flex-col justify-between h-24"
                  >
                    <span className="font-bold text-sm text-slate-800 uppercase line-clamp-2">{menu.name}</span>
                    <span className="text-blue-600 font-black text-xs">Rp {menu.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keranjang POS */}
            <div className="w-full md:w-80 bg-white rounded-2xl shadow-xl flex flex-col">
              <div className="p-4 border-b bg-slate-50 rounded-t-2xl">
                <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase"><ShoppingCart size={18}/> Keranjang</h2>
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <input 
                  type="text" placeholder="Nama Pelanggan" 
                  value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700 uppercase">{item.name}</p>
                        <p className="text-[10px] text-blue-600">Rp {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-white border rounded"><Minus size={12}/></button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1 bg-white border rounded"><Plus size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50 rounded-b-2xl">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-slate-500 uppercase">Total</span>
                  <span className="font-black text-xl text-blue-700">Rp {totalCartPrice.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckoutManual}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:bg-slate-300"
                >
                  BAYAR SEKARANG
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'incoming' ? (
          /* ================= MONITORING PESANAN ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
            {incomingOrders.length === 0 ? (
              <div className="col-span-full text-center py-20 opacity-50"><Clock size={48} className="mx-auto mb-2"/> <p>Belum ada pesanan masuk...</p></div>
            ) : incomingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-md border-t-4 border-orange-500 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded">#{order.id}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase line-clamp-1">{order.customer_name}</h3>
                  <p className="text-xs text-blue-600 font-bold mb-4">{order.type_order} • Meja {order.table_number || '-'}</p>
                  <div className="space-y-2 border-y py-3 mb-4">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.quantity}x {item.menu.name}</span>
                        <span className="font-bold">Rp {item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handlePrint(order)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2"><Printer size={16}/> Struk</button>
                  <button onClick={() => completeOrder(order.id)} className="flex-[2] bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"><CheckCircle size={16}/> SELESAI</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ================= RIWAYAT PENJUALAN ================= */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
             <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">ID</th>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {historyOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold">#{order.id}</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-700">{order.customer_name}</td>
                    <td className="p-4 text-right font-black text-blue-700">Rp {order.total_price.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handlePrint(order)} className="text-slate-400 hover:text-blue-600"><Printer size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}