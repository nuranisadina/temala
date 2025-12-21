// app/dashboard/promos/page.tsx
'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Plus, Edit, Trash2, Tag, Image as ImageIcon, X, Loader2, UploadCloud } from 'lucide-react'
import Image from 'next/image'

export default function PromosPage() {
    const [promos, setPromos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- STATE UPLOAD ---
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: ''
    })

    useEffect(() => { fetchPromos() }, [])

    useEffect(() => {
        if (!isModalOpen && previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
            setSelectedFile(null)
        }
    }, [isModalOpen])

    const fetchPromos = async () => {
        try {
            const res = await fetch('/api/menus')
            const data = await res.json()
            setPromos(data.filter((item: any) => item.category === 'promo'))
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
            const data = await res.json()
            return data.success ? data.url : null
        } catch (e) { return null }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // 1. UPLOAD GAMBAR DULU
        let finalImageUrl = formData.image
        if (selectedFile) {
            const uploadedUrl = await uploadImage(selectedFile)
            if (uploadedUrl) finalImageUrl = uploadedUrl
            else {
                alert("Gagal upload gambar. Cek apakah folder 'public/uploads' ada?")
                setIsSubmitting(false)
                return
            }
        }

        const payload = {
            name: formData.name,
            category: 'promo',
            price: Number(formData.price),
            stock: 999,
            image: finalImageUrl,
            description: 'Promo Spesial'
        }

        try {
            const method = isEditing && currentId ? 'PUT' : 'POST'
            const body = isEditing && currentId ? { id: currentId, ...payload } : payload

            const res = await fetch('/api/menus', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Gagal menyimpan ke database')
            }

            setIsModalOpen(false)
            setFormData({ name: '', price: '', image: '' })
            setSelectedFile(null)
            setPreviewUrl(null)
            fetchPromos()
        } catch (error: any) {
            alert(error.message || 'Terjadi kesalahan sistem')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus promo ini?')) return
        await fetch(`/api/menus?id=${id}`, { method: 'DELETE' })
        fetchPromos()
    }

    const openEdit = (item: any) => {
        setIsEditing(true)
        setCurrentId(item.id)
        setFormData({ name: item.name, price: item.price, image: item.image || '' })
        if (item.image) setPreviewUrl(item.image)
        setIsModalOpen(true)
    }

    if (loading) return (
        <div className="p-10 text-center font-bold text-slate-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
            Memuat Promo...
        </div>
    )

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Manajemen Promo</h2>
                    <p className="text-slate-500 text-sm mt-1">Upload banner promo untuk halaman depan.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(false); setFormData({ name: '', price: '', image: '' }); setIsModalOpen(true); }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                >
                    <Plus size={20} /> Tambah Promo
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                {promos.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-blue-50 p-6 rounded-full mb-4 border border-blue-100">
                            <Tag size={40} className="text-blue-400" />
                        </div>
                        <p className="font-bold text-slate-600">Belum ada promo aktif.</p>
                        <p className="text-sm text-slate-400 mt-1">Klik tombol "Tambah Promo" untuk membuat promo baru</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Banner</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Judul</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Harga</th>
                                <th className="p-5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {promos.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-5 w-48">
                                        <div className="h-24 w-40 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 shadow-sm">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5 font-bold text-slate-800">{item.name}</td>
                                    <td className="p-5 font-bold text-blue-600">Rp {item.price.toLocaleString()}</td>
                                    <td className="p-5 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="p-2.5 bg-white border border-slate-200 text-amber-500 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2.5 bg-white border border-slate-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                <Tag size={20} className="text-blue-500" />
                                {isEditing ? 'Edit Promo' : 'Tambah Promo Baru'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Judul Promo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="Nama promo..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Harga Promo (Rp)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-blue-600 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Banner Promo</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-all bg-slate-50 relative cursor-pointer group">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-blue-500/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all font-bold text-xs">
                                                <UploadCloud size={20} className="mr-2" /> Ganti Banner
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-6 text-slate-400">
                                            <UploadCloud size={32} className="mx-auto mb-3 text-slate-300" />
                                            <p className="text-sm font-bold">Klik untuk upload banner</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG (Maks. 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:from-blue-600 hover:to-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Promo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}