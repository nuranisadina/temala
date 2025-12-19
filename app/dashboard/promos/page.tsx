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
                // Tampilkan error detail dari server jika ada
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

    // Sisa kode render sama, pastikan bagian bawah ini ada:
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

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Memuat Promo...</div>

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase">Manajemen Promo</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload banner promo untuk halaman depan.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(false); setFormData({ name: '', price: '', image: '' }); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition"
                >
                    <Plus size={20} /> Tambah Promo
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {promos.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-100 p-6 rounded-full mb-4"><Tag size={40} /></div>
                        <p>Belum ada promo aktif.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Banner</th>
                                <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Judul</th>
                                <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Harga</th>
                                <th className="p-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {promos.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:bg-slate-900/50 transition">
                                    <td className="p-5 w-48">
                                        <div className="h-24 w-40 bg-slate-200 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-sm">
                                            {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-slate-400"><ImageIcon size={20} /></div>}
                                        </div>
                                    </td>
                                    <td className="p-5 font-bold text-slate-800">{item.name}</td>
                                    <td className="p-5 font-bold text-blue-600">Rp {item.price.toLocaleString()}</td>
                                    <td className="p-5 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEdit(item)} className="p-2 bg-white border border-slate-200 dark:border-slate-700 text-yellow-600 rounded-lg hover:bg-yellow-50"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-white border border-slate-200 dark:border-slate-700 text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase">{isEditing ? 'Edit Promo' : 'Tambah Promo Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Judul Promo</label>
                                <input required type="text" className="w-full border rounded-lg px-4 py-2.5 font-bold text-slate-700" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Harga Promo (Rp)</label>
                                <input required type="number" className="w-full border rounded-lg px-4 py-2.5 font-bold text-blue-600" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Banner Promo</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 transition bg-slate-50 dark:bg-slate-900/50 relative cursor-pointer group">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition font-bold text-xs">Ganti Banner</div>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-slate-400">
                                            <UploadCloud size={24} className="mx-auto mb-2" />
                                            <p className="text-xs font-bold">Klik Upload Banner</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? 'Menyimpan...' : 'SIMPAN PROMO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}