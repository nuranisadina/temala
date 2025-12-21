// app/client-dashboard/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    Trash2, Plus, Minus, Loader2, Coffee, User, Phone, MapPin,
    Utensils, ShoppingBag, X, QrCode, Banknote, Wallet, ArrowRight,
    CheckCircle2, Upload, ImageIcon, ShoppingCart
} from 'lucide-react'

interface CartItem {
    id: number
    name: string
    price: number
    image?: string
    quantity: number
}

export default function ClientCartPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [paymentProof, setPaymentProof] = useState<string | null>(null)
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)

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
        window.dispatchEvent(new Event('cartUpdated'))
    }

    const removeItem = (id: number) => {
        const newCart = cart.filter(item => item.id !== id)
        setCart(newCart)
        localStorage.setItem('cart', JSON.stringify(newCart))
        window.dispatchEvent(new Event('cartUpdated'))
    }

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Harap upload file gambar (JPG, PNG, dll)')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            setPaymentProofPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)

        setIsUploading(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            })

            if (res.ok) {
                const data = await res.json()
                setPaymentProof(data.url)
            } else {
                throw new Error('Upload gagal')
            }
        } catch (error) {
            alert('Gagal mengupload bukti pembayaran')
            setPaymentProofPreview(null)
        } finally {
            setIsUploading(false)
        }
    }

    const removePaymentProof = () => {
        setPaymentProof(null)
        setPaymentProofPreview(null)
    }

    const processOrder = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.paymentMethod === 'QRIS' && !paymentProof) {
            alert('Silakan upload bukti pembayaran terlebih dahulu!')
            return
        }

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
                    type_order: formData.type === 'Dine-in' ? 'Dine In' : 'Take Away',
                    payment_method: formData.paymentMethod,
                    payment_proof: paymentProof,
                    total_price: totalAmount,
                    status: 'Pending'
                })
            })
            if (res.ok) {
                localStorage.removeItem('cart')
                setCart([])
                setIsModalOpen(false)
                setPaymentProof(null)
                setPaymentProofPreview(null)
                window.dispatchEvent(new Event('cartUpdated'))
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                    <Coffee size={28} className="text-blue-500" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-6 animate-pulse">Memuat Keranjang...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Keranjang Saya</h1>
                    <p className="text-slate-400 text-sm mt-1">Review pesanan Anda sebelum checkout</p>
                </div>
                {cart.length > 0 && (
                    <Link href="/client-dashboard/menu" className="text-blue-500 text-sm font-bold hover:underline flex items-center gap-2">
                        <Plus size={16} /> Tambah Menu Lain
                    </Link>
                )}
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-800">
                    <ShoppingCart size={64} className="mx-auto text-slate-800 mb-4" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Keranjang Kosong</h2>
                    <p className="text-slate-500 mb-6">Yuk, tambahkan menu favorit Anda!</p>
                    <Link href="/client-dashboard/menu" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition inline-flex items-center gap-2">
                        <Coffee size={18} /> Lihat Menu
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 flex gap-4 items-center group hover:border-blue-500/30 transition-all">
                                <div className="w-20 h-20 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
                                    {item.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-800"><Coffee size={24} /></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{item.name}</h3>
                                    <p className="text-blue-500 font-black text-lg mt-1">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg p-1 border border-slate-800">
                                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-all"><Minus size={14} strokeWidth={3} /></button>
                                        <span className="font-black text-sm w-6 text-center text-white">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-blue-500 transition-all"><Plus size={14} strokeWidth={3} /></button>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-all">
                                        <Trash2 size={12} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 h-fit sticky top-24">
                        <h3 className="font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                            <ShoppingBag size={20} className="text-blue-500" /> Ringkasan
                        </h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <span>Total Item</span>
                                <span className="text-slate-300">{cart.reduce((a, b) => a + b.quantity, 0)} item</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <span>Pajak & Layanan</span>
                                <span className="text-emerald-500">Termasuk</span>
                            </div>
                            <div className="h-px bg-slate-800 my-4"></div>
                            <div className="flex justify-between items-end">
                                <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Total</span>
                                <span className="font-black text-2xl text-white tracking-tighter">Rp {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-900/40 hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                        >
                            <Wallet size={18} /> Checkout
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                        <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-white flex items-center gap-3 uppercase tracking-tight"><Utensils size={24} className="text-blue-500" /> Checkout</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={processOrder} className="p-6 space-y-6 overflow-y-auto">
                            {/* Customer Info */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Informasi Pelanggan</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama *</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input required type="text" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-bold text-white text-sm"
                                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No. Meja *</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input required type="text" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-bold text-white text-sm"
                                                placeholder="Cth: 05" value={formData.tableNumber} onChange={e => setFormData({ ...formData, tableNumber: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No. HP</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input type="tel" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-bold text-white text-sm"
                                            placeholder="0812..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Order Type */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Jenis Pesanan</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'Dine-in' })}
                                        className={`p-4 rounded-xl border font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${formData.type === 'Dine-in' ? 'border-blue-600 bg-blue-600/10 text-white' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                                        <Utensils size={20} /> Dine In
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'Takeaway' })}
                                        className={`p-4 rounded-xl border font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${formData.type === 'Takeaway' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                                        <ShoppingBag size={20} /> Take Away
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Metode Pembayaran</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'QRIS' })}
                                        className={`p-4 rounded-xl border font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'QRIS' ? 'border-blue-600 bg-blue-600/10 text-white' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                                        <QrCode size={20} /> QRIS
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                                        className={`p-4 rounded-xl border font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                                        <Banknote size={20} /> Tunai
                                    </button>
                                </div>
                            </div>

                            {/* Upload Payment Proof (QRIS only) */}
                            {formData.paymentMethod === 'QRIS' && (
                                <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bukti Pembayaran *</div>

                                    {/* QR Display */}
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                        <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg mb-3">
                                            <QrCode size={100} className="text-slate-400 mx-auto" />
                                        </div>
                                        <p className="text-slate-400 text-xs font-bold">Scan & Bayar</p>
                                        <p className="text-white font-black text-lg mt-1">Rp {totalAmount.toLocaleString()}</p>
                                    </div>

                                    {/* Upload */}
                                    {paymentProofPreview ? (
                                        <div className="relative">
                                            <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden border border-emerald-500/50">
                                                <img src={paymentProofPreview} alt="Bukti" className="w-full h-full object-contain" />
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                                                        <Loader2 className="animate-spin text-blue-500" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <button type="button" onClick={removePaymentProof} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={14} /></button>
                                            {paymentProof && (
                                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Terupload
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-950/50 border border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all group">
                                            <div className="p-3 bg-slate-800 rounded-xl mb-2 group-hover:bg-blue-600 transition-colors">
                                                <Upload size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 group-hover:text-white">Upload bukti</p>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleUploadProof} />
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting || (formData.paymentMethod === 'QRIS' && !paymentProof)}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-900/40 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                {isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
                            </button>

                            {formData.paymentMethod === 'QRIS' && !paymentProof && (
                                <p className="text-center text-amber-500 text-xs font-bold">* Upload bukti pembayaran untuk melanjutkan</p>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
