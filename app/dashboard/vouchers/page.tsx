'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag, Percent, DollarSign, Calendar, X, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE', // PERCENTAGE | FIXED
        discount: 0,
        min_purchase: 0,
        max_discount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        usage_limit: 100,
        is_active: true
    })

    useEffect(() => {
        fetchVouchers()
    }, [])

    const fetchVouchers = async () => {
        try {
            const res = await fetch('/api/vouchers')
            const data = await res.json()
            if (Array.isArray(data)) setVouchers(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = isEditing && currentId ? `/api/vouchers/${currentId}` : '/api/vouchers'
            const method = isEditing && currentId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Gagal menyimpan voucher')

            setIsModalOpen(false)
            resetForm()
            fetchVouchers()

        } catch (error: any) {
            alert(`GAGAL: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus voucher ini?')) return
        await fetch(`/api/vouchers/${id}`, { method: 'DELETE' })
        fetchVouchers()
    }

    const openEdit = (item: any) => {
        setIsEditing(true)
        setCurrentId(item.id)
        setFormData({
            code: item.code,
            type: item.type,
            discount: item.discount,
            min_purchase: item.min_purchase,
            max_discount: item.max_discount || 0,
            start_date: new Date(item.start_date).toISOString().split('T')[0],
            end_date: new Date(item.end_date).toISOString().split('T')[0],
            usage_limit: item.usage_limit || 0,
            is_active: item.is_active
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'PERCENTAGE',
            discount: 0,
            min_purchase: 0,
            max_discount: 0,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            usage_limit: 100,
            is_active: true
        })
        setIsEditing(false)
        setCurrentId(null)
    }

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Memuat Data Voucher...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Voucher Diskon</h2>
                    <p className="text-slate-400 text-sm mt-1">Kelola kode promo dan diskon untuk pelanggan.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true) }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} /> Buat Voucher
                </button>
            </div>

            {/* LIST VOUCHER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((v) => (
                    <div key={v.id} className={`relative p-6 rounded-2xl border ${v.is_active ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-900/20 border-slate-800/50 opacity-75'} shadow-xl overflow-hidden group`}>
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 ${v.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {v.is_active ? <><CheckCircle size={10} /> Aktif</> : <><XCircle size={10} /> Nonaktif</>}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Tag size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">{v.code}</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase">{v.type === 'PERCENTAGE' ? 'Diskon Persen' : 'Potongan Harga'}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Besar Diskon</span>
                                <span className="font-bold text-emerald-400">
                                    {v.type === 'PERCENTAGE' ? `${v.discount}%` : `Rp ${v.discount.toLocaleString('id-ID')}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Min. Belanja</span>
                                <span className="font-bold text-slate-300">Rp {v.min_purchase.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Berlaku Hingga</span>
                                <span className="font-bold text-slate-300">{new Date(v.end_date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Kuota</span>
                                <span className="font-bold text-slate-300">{v.used_count} / {v.usage_limit}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => openEdit(v)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition">Edit</button>
                            <button onClick={() => handleDelete(v.id)} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase">
                                {isEditing ? 'Edit Voucher' : 'Buat Voucher Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kode Voucher</label>
                                    <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-black text-white placeholder:text-slate-600 uppercase tracking-wider"
                                        placeholder="CONTOH: DISKON10"
                                        value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipe Diskon</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="PERCENTAGE">Persentase (%)</option>
                                        <option value="FIXED">Nominal (Rp)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nilai Diskon</label>
                                    <div className="relative">
                                        <input required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                            value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
                                        <div className="absolute right-3 top-2.5 text-slate-500 font-bold">
                                            {formData.type === 'PERCENTAGE' ? '%' : 'Rp'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Min. Belanja</label>
                                    <input required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                        value={formData.min_purchase} onChange={e => setFormData({ ...formData, min_purchase: Number(e.target.value) })} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Maks. Potongan</label>
                                    <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                        placeholder="Opsional"
                                        disabled={formData.type === 'FIXED'}
                                        value={formData.max_discount} onChange={e => setFormData({ ...formData, max_discount: Number(e.target.value) })} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mulai Berlaku</label>
                                    <input required type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                        value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Berakhir Pada</label>
                                    <input required type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                        value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kuota Penggunaan</label>
                                    <input required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-white"
                                        value={formData.usage_limit} onChange={e => setFormData({ ...formData, usage_limit: Number(e.target.value) })} />
                                </div>

                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                            checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                        <span className="text-sm font-bold text-white">Status Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-500 transition flex justify-center items-center gap-2 text-sm uppercase tracking-wide shadow-lg mt-4">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? 'Menyimpan...' : 'SIMPAN VOUCHER'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
