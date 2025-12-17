// app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus, Minus, Loader2, Coffee, User, Phone, MapPin, Utensils, ShoppingBag, X, QrCode, Banknote, Wallet } from 'lucide-react'

// Tipe Data Cart Item
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
  
  // State Modal Checkout
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    tableNumber: '',
    phone: '',
    type: 'Dine-in',      // Default: Makan di Tempat
    paymentMethod: 'QRIS' // Default: QRIS
  })

  // 1. Load Keranjang & Auto-fill Nama
  useEffect(() => {
    // Ambil cart dari localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Gagal parsing cart", e)
        localStorage.removeItem('cart')
      }
    }

    // Auto-fill nama user jika login
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, name: session.user?.name || '' }))
    }
    
    setLoading(false)
  }, [session])

  // Fungsi Update Quantity
  const updateQty = (id: number, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        // Minimal qty adalah 1
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  // Fungsi Hapus Item
  const removeItem = (id: number) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  // Hitung Total Bayar
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // 2. Buka Modal Checkout
  const handleOpenCheckout = () => {
    // Wajib Login untuk Memesan
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

  // 3. PROSES ORDER KE API (Backend)
  const processOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Ambil ID User (jika ada)
    // @ts-ignore
    const userId = session?.user?.id ? Number(session.user.id) : null

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          user_id: userId,
          
          // Data Pelanggan
          customer_name: formData.name, 
          customer_phone: formData.phone || '-', 
          table_number: formData.tableNumber || '-',
          type_order: formData.type, 
          
          // Data Pembayaran
          payment_method: formData.paymentMethod, 
          total_price: totalAmount,
          
          // Status Awal
          status: 'Pending' 
        })
      })

      if (res.ok) {
        // Jika Sukses: Kosongkan keranjang, tutup modal, pindah halaman
        localStorage.removeItem('cart')
        setCart([])
        setIsModalOpen(false)
        router.push('/orders') // Arahkan ke halaman Riwayat Pesanan
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

  // Loading State
  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={32}/>
          <p className="text-slate-500 font-bold">Memuat Keranjang...</p>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* Header Halaman Cart */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-slate-100">
        <Link href="/menu" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-700">
          <ArrowLeft size={20}/>
        </Link>
        <h1 className="font-bold text-lg text-slate-800">Keranjang Saya</h1>
      </div>

      <div className="max-w-xl mx-auto p-4">
        {cart.length === 0 ? (
          // TAMPILAN JIKA KERANJANG KOSONG
          <div className="text-center py-20 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-slate-200 p-6 rounded-full mb-4">
                <Coffee size={48} className="text-slate-400"/>
            </div>
            <h2 className="text-xl font-bold text-slate-600 mb-1">Keranjang Kosong</h2>
            <p className="text-slate-400 mb-6 text-sm">Wah, kamu belum memilih menu apapun nih.</p>
            <Link href="/menu" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition transform hover:-translate-y-1">
              Lihat Menu
            </Link>
          </div>
        ) : (
          // TAMPILAN LIST ITEM DI KERANJANG
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* List Item Loop */}
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center">
                
                {/* Gambar Produk Kecil */}
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-200">
                   {item.image ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300"><Coffee size={24}/></div>
                   )}
                </div>

                {/* Info Produk */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 line-clamp-1 text-base mb-1">{item.name}</h3>
                  <p className="text-blue-600 font-bold text-sm">Rp {item.price.toLocaleString()}</p>
                </div>

                {/* Kontrol Quantity */}
                <div className="flex flex-col items-end gap-3">
                   <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-100 text-slate-600 transition"><Minus size={14}/></button>
                      <span className="font-bold text-sm w-4 text-center text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm hover:bg-slate-100 text-blue-600 transition"><Plus size={14}/></button>
                   </div>
                   <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 font-medium transition">
                      <Trash2 size={14}/> Hapus
                   </button>
                </div>
              </div>
            ))}

            {/* Ringkasan Pembayaran */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mt-6 sticky bottom-4">
               <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                   <ShoppingBag size={18} className="text-slate-400"/> Ringkasan Pembayaran
               </h3>
               
               <div className="flex justify-between mb-2 text-slate-500 text-sm">
                  <span>Total Item</span>
                  <span className="font-medium">{cart.reduce((a,b)=>a+b.quantity,0)} item</span>
               </div>
               
               <div className="flex justify-between mb-6 text-slate-800">
                  <span className="font-bold text-lg">Total Bayar</span>
                  <span className="font-black text-xl text-blue-700">Rp {totalAmount.toLocaleString()}</span>
               </div>
               
               <button 
                 onClick={handleOpenCheckout} 
                 className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.01] transition-all flex justify-center items-center gap-2"
               >
                 <Wallet size={20}/> PROSES PEMBAYARAN
               </button>
            </div>
          </div>
        )}
      </div>

      {/* === MODAL POPUP CHECKOUT === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Backdrop Click to Close (Optional) */}
            <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>

            <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto relative z-10">
                
                {/* Modal Header */}
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white sticky top-0 z-10 shadow-md">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Utensils size={20}/> Konfirmasi Pesanan</h3>
                    <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-1.5 rounded-full transition"><X size={24}/></button>
                </div>

                {/* Modal Form */}
                <form onSubmit={processOrder} className="p-6 space-y-6 bg-slate-50">
                    
                    {/* 1. INFORMASI PELANGGAN */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Informasi Pelanggan</h4>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Pemesan</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3 text-slate-400"/>
                                <input required type="text" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-slate-700 bg-slate-50 focus:bg-white"
                                    placeholder="Nama Anda"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">No. Meja</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3 text-slate-400"/>
                                    <input required type="text" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-slate-700 bg-slate-50 focus:bg-white"
                                        placeholder="Cth: 05"
                                        value={formData.tableNumber}
                                        onChange={e => setFormData({...formData, tableNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">No. HP (Opsional)</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-3 text-slate-400"/>
                                    <input type="tel" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-medium text-slate-700 bg-slate-50 focus:bg-white"
                                        placeholder="0812..."
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. JENIS PESANAN */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Jenis Pesanan</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setFormData({...formData, type: 'Dine-in'})}
                                className={`py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition ${formData.type === 'Dine-in' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}>
                                <Utensils size={20}/> Makan di Tempat
                            </button>
                            <button type="button" onClick={() => setFormData({...formData, type: 'Takeaway'})}
                                className={`py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition ${formData.type === 'Takeaway' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500 hover:border-orange-200 hover:bg-slate-50'}`}>
                                <ShoppingBag size={20}/> Bawa Pulang
                            </button>
                        </div>
                    </div>

                    {/* 3. METODE PEMBAYARAN */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Metode Pembayaran</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setFormData({...formData, paymentMethod: 'QRIS'})}
                                className={`py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition ${formData.paymentMethod === 'QRIS' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <QrCode size={20}/> QRIS (Scan)
                            </button>
                            
                            <button type="button" onClick={() => setFormData({...formData, paymentMethod: 'Cash'})}
                                className={`py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition ${formData.paymentMethod === 'Cash' ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <Banknote size={20}/> Tunai / Kasir
                            </button>
                        </div>

                        {/* Info Pembayaran */}
                        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm mt-2 ${formData.paymentMethod === 'QRIS' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                                {formData.paymentMethod === 'QRIS' ? <QrCode size={18}/> : <Banknote size={18}/>}
                            </div>
                            <div>
                                <p className="font-bold mb-1">
                                    {formData.paymentMethod === 'QRIS' ? 'Bayar Pakai QRIS' : 'Bayar Tunai'}
                                </p>
                                <p className="text-xs opacity-80 leading-relaxed">
                                    {formData.paymentMethod === 'QRIS' 
                                        ? 'Silakan scan stiker QRIS yang tersedia di meja atau kasir setelah pesanan dikonfirmasi.'
                                        : 'Silakan menuju kasir untuk melakukan pembayaran tunai setelah pesanan dibuat.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Submit Final */}
                    <div className="pt-2 sticky bottom-0 bg-slate-50 pb-2">
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.98]">
                            {isSubmitting ? <Loader2 className="animate-spin"/> : null}
                            {isSubmitting ? 'Memproses...' : 'KONFIRMASI PESANAN'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
      )}

    </div>
  )
}