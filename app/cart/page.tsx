// app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Minus, Loader2, Coffee, User, Phone, MapPin, Utensils, ShoppingBag, X, QrCode, Banknote, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: number
  image?: string
  quantity: number
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    tableNumber: '',
    phone: '',
    type: 'Dine-in',
    paymentMethod: 'QRIS'
  })

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) as CartItem[])
      } catch (e) {
        console.error("Gagal parsing cart", e)
        localStorage.removeItem('cart')
      }
    }
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, name: session.user?.name || '' }))
    }
    setLoading(false)
  }, [session])

  const updateQty = (id: number, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeItem = (id: number) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const handleOpenCheckout = () => {
    if (status === 'unauthenticated') {
      alert("Silakan Login terlebih dahulu untuk melakukan pemesanan!")
      router.push('/login')
      return
    }
    if (cart.length === 0) {
      alert("Keranjang belanja Anda kosong.")
      return
    }
    setIsModalOpen(true)
  }

  const processOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // @ts-ignore
    const userId = session?.user?.id ? Number(session.user.id) : null
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          user_id: userId,
          customer_name: formData.name,
          customer_phone: formData.phone || '-',
          table_number: formData.tableNumber || '-',
          type_order: formData.type,
          payment_method: formData.paymentMethod,
          total_price: totalAmount,
          status: 'Pending'
        })
      })
      if (res.ok) {
        localStorage.removeItem('cart')
        setCart([])
        setIsModalOpen(false)
        router.push('/client-dashboard/orders')
      } else {
        const err = await res.json()
        throw new Error(err.error || "Gagal membuat pesanan")
      }
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan sistem saat memproses pesanan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full animate-pulse-ring"></div>

        <div className="relative w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
          <Coffee size={40} className="text-blue-500" strokeWidth={2.5} />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-1.5 h-4 bg-blue-400/40 rounded-full animate-steam"></div>
            <div className="w-1.5 h-6 bg-blue-400/20 rounded-full animate-steam [animation-delay:0.5s]"></div>
          </div>
        </div>
        <div className="mt-12 text-center space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">TEMALA.</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-1">Menyiapkan Keranjang Anda</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-sans pb-32 selection:bg-blue-500/30">

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 sticky top-0 z-40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/menu" className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all text-white shadow-lg active:scale-90">
            <ArrowLeft size={20} strokeWidth={3} />
          </Link>
          <div>
            <h1 className="font-black text-2xl text-white uppercase tracking-tighter">Keranjang Saya</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temala Coffee Order</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest">
          <CheckCircle2 size={16} />
          Aman & Terenkripsi
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {cart.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-800">
            <div className="bg-slate-950/50 p-10 rounded-full mb-8 border border-slate-800 shadow-inner">
              <Coffee size={64} className="text-slate-700" strokeWidth={1} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Keranjang Kosong</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-xs">Wah, kamu belum memilih menu apapun nih. Yuk, jelajahi menu lezat kami!</p>
            <Link href="/menu" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all active:scale-95">
              Lihat Menu Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">

            {/* List Items */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-slate-800"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Daftar Pesanan</span>
                <div className="h-px flex-1 bg-slate-800"></div>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-800 flex gap-6 items-center group hover:border-blue-500/30 transition-all duration-500">
                  <div className="w-24 h-24 bg-slate-950 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-800"><Coffee size={32} /></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white uppercase tracking-tight text-lg group-hover:text-blue-400 transition-colors">{item.name}</h3>
                    <p className="text-blue-500 font-black text-lg tracking-tighter mt-1">Rp {item.price.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-4 bg-slate-950/50 rounded-xl p-1.5 border border-slate-800">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-all active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                      <span className="font-black text-sm w-6 text-center text-white">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-blue-500 transition-all active:scale-90"><Plus size={16} strokeWidth={3} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-all">
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

              <h3 className="font-black text-white mb-8 border-b border-slate-800 pb-6 flex items-center gap-3 uppercase tracking-tight text-xl">
                <ShoppingBag size={24} className="text-blue-500" /> Ringkasan Pembayaran
              </h3>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-slate-500 text-xs font-black uppercase tracking-widest">
                  <span>Total Item</span>
                  <span className="text-slate-300">{cart.reduce((a, b) => a + b.quantity, 0)} item</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs font-black uppercase tracking-widest">
                  <span>Pajak & Layanan</span>
                  <span className="text-emerald-500">Termasuk</span>
                </div>
                <div className="h-px bg-slate-800 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-slate-400 uppercase tracking-widest text-xs mb-1">Total Bayar</span>
                  <span className="font-black text-4xl text-white tracking-tighter">Rp {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition-all flex justify-center items-center gap-3 active:scale-[0.98]"
              >
                <Wallet size={20} /> PROSES PEMBAYARAN <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 max-h-[90vh] flex flex-col relative z-10">

            <div className="bg-slate-950/50 p-8 border-b border-slate-800 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-black text-xl text-white flex items-center gap-3 uppercase tracking-tight"><Utensils size={24} className="text-blue-500" /> Konfirmasi Pesanan</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={processOrder} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

              {/* Customer Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Informasi Pelanggan</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Pemesan</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input required type="text" className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700"
                      placeholder="Nama Lengkap Anda"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. Meja</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input required type="text" className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-black text-white placeholder:text-slate-700"
                        placeholder="Cth: 05"
                        value={formData.tableNumber}
                        onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. HP</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input type="tel" className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700"
                        placeholder="0812..."
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Type */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Jenis Pesanan</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({ ...formData, type: 'Dine-in' })}
                    className={`p-6 rounded-3xl border-2 font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 transition-all ${formData.type === 'Dine-in' ? 'border-blue-600 bg-blue-600/10 text-white shadow-lg shadow-blue-900/20' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                    <Utensils size={24} /> Makan di Tempat
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, type: 'Takeaway' })}
                    className={`p-6 rounded-3xl border-2 font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 transition-all ${formData.type === 'Takeaway' ? 'border-orange-500 bg-orange-500/10 text-white shadow-lg shadow-orange-900/20' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                    <ShoppingBag size={24} /> Bawa Pulang
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Metode Pembayaran</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'QRIS' })}
                    className={`p-6 rounded-3xl border-2 font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'QRIS' ? 'border-blue-600 bg-blue-600/10 text-white shadow-lg shadow-blue-900/20' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                    <QrCode size={24} /> QRIS (Scan)
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                    className={`p-6 rounded-3xl border-2 font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 transition-all ${formData.paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-900/20' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                    <Banknote size={24} /> Tunai / Kasir
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 sticky bottom-0 bg-slate-900 pb-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition-all disabled:opacity-50 flex justify-center items-center gap-3 active:scale-[0.98]">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                  {isSubmitting ? 'MEMPROSES PESANAN...' : 'KONFIRMASI & BAYAR'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}