// app/dashboard/menus/page.tsx
'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, X, Loader2, UploadCloud, Coffee, MapPin } from 'lucide-react'
import Image from 'next/image'

export default function MenusPage() {
    const [menus, setMenus] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        category: 'coffee',
        price: '',
        stock: '',
        description: '',
        image: ''
    })

    useEffect(() => {
        fetchMenus()
    }, [])

    useEffect(() => {
        if (!isModalOpen && previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
            setSelectedFile(null)
        }
    }, [isModalOpen])

    const fetchMenus = async () => {
        try {
            const res = await fetch('/api/menus')
            const data = await res.json()
            const menuData = data.filter((item: any) => !['promo', 'event'].includes(item.category))
            setMenus(menuData)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
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
            if (!data.success) throw new Error(data.message)
            return data.url
        } catch (e: any) {
            alert(`Gagal Upload Gambar: ${e.message}`)
            return null
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            let finalImageUrl = formData.image
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile)
                if (!uploadedUrl) {
                    setIsSubmitting(false)
                    return
                }
                finalImageUrl = uploadedUrl
            }
            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                image: finalImageUrl
            }
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
            resetForm()
            fetchMenus()
        } catch (error: any) {
            alert(`GAGAL: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus menu ini?')) return
        await fetch(`/api/menus?id=${id}`, { method: 'DELETE' })
        fetchMenus()
    }

    const openEdit = (item: any) => {
        setIsEditing(true)
        setCurrentId(item.id)
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            stock: item.stock,
            description: item.description || '',
            image: item.image || ''
        })
        if (item.image) setPreviewUrl(item.image)
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({ name: '', category: 'coffee', price: '', stock: '', description: '', image: '' })
        setPreviewUrl(null)
        setSelectedFile(null)
        setIsEditing(false)
        setCurrentId(null)
    }

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="relative flex flex-col items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse-ring"></div>

                <div className="relative w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                    <Coffee size={28} className="text-blue-500" strokeWidth={2.5} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-steam"></div>
                        <div className="w-1 h-4 bg-blue-400/20 rounded-full animate-steam [animation-delay:0.5s]"></div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Memuat Menu Temala...</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER PAGE */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Manajemen Menu</h2>
                    <p className="text-slate-400 font-medium">Kelola daftar makanan & minuman Temala Coffee.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true) }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} strokeWidth={3} /> Tambah Menu
                </button>
            </div>

            {/* TABLE AREA */}
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                {menus.length === 0 ? (
                    <div className="p-32 text-center flex flex-col items-center justify-center text-slate-600">
                        <div className="bg-slate-950/50 p-8 rounded-full mb-6 border border-slate-800 shadow-inner"><Coffee size={48} /></div>
                        <p className="font-black uppercase tracking-[0.2em]">Belum ada menu terdaftar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800">
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Foto</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Informasi Produk</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Harga Jual</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {menus.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-6 w-32">
                                            <div className="h-20 w-20 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-inner group-hover:border-blue-500/30 transition-colors">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : <div className="absolute inset-0 flex items-center justify-center text-slate-700"><ImageIcon size={24} /></div>}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-white text-lg uppercase tracking-wide group-hover:text-blue-400 transition-colors">{item.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Stok Tersedia: <span className="text-slate-300">{item.stock}</span></p>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-slate-950/50 text-slate-400 border-slate-800 group-hover:border-slate-700 transition-colors">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-emerald-500 text-xl tracking-tight">
                                            Rp {item.price.toLocaleString()}
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => openEdit(item)} className="p-3 bg-slate-800/50 border border-slate-700 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-lg" title="Edit"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-3 bg-slate-800/50 border border-slate-700 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg" title="Hapus"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="bg-slate-950/50 px-8 py-6 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                                <Coffee size={24} className="text-blue-500" />
                                {isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Produk</label>
                                <input required type="text" className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700"
                                    placeholder="Contoh: Kopi Susu Gula Aren"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                    <select className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500 transition-all font-bold text-white appearance-none"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="coffee">Coffee</option>
                                        <option value="non-coffee">Non Coffee</option>
                                        <option value="food">Food</option>
                                        <option value="snack">Snack</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stok Awal</label>
                                    <input required type="number" className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500 transition-all font-bold text-white"
                                        placeholder="100"
                                        value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Harga Jual (Rp)</label>
                                <input required type="number" className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500 transition-all font-black text-emerald-500 text-xl"
                                    placeholder="0"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deskripsi Produk</label>
                                <textarea className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500 transition-all resize-none h-24 text-sm font-medium text-slate-300 placeholder:text-slate-700"
                                    placeholder="Jelaskan keunikan rasa produk ini..."
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Foto Produk</label>
                                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500 transition-all bg-slate-950/30 relative cursor-pointer group overflow-hidden">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-40 rounded-xl overflow-hidden">
                                            <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                                            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all font-black text-xs uppercase tracking-widest">Ganti Gambar</div>
                                        </div>
                                    ) : (
                                        <div className="py-4 space-y-3">
                                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-600 group-hover:text-blue-500 transition-colors"><UploadCloud size={24} /></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Klik Pilih Foto</p>
                                                <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">Format PNG/JPG (Max 2MB)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 text-sm shadow-xl shadow-blue-900/40 active:scale-95 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                                {isSubmitting ? 'MENGUPLOAD DATA...' : 'SIMPAN PERUBAHAN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}