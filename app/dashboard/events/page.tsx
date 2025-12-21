'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Plus, Edit, Trash2, Calendar, Image as ImageIcon, X, Loader2, Clock, UploadCloud, MapPin } from 'lucide-react'
import Image from 'next/image'

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- STATE UPLOAD ---
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        content: '', // Waktu & Deskripsi Acara
        image: ''
    })

    // 1. Fetch Data
    useEffect(() => {
        fetchEvents()
    }, [])

    // Cleanup Preview
    useEffect(() => {
        if (!isModalOpen && previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
            setSelectedFile(null)
        }
    }, [isModalOpen])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events')
            const data = await res.json()
            if (Array.isArray(data)) setEvents(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // --- LOGIKA UPLOAD ---
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

    // 2. Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // 1. Upload Gambar Dulu
            let finalImageUrl = formData.image
            if (selectedFile) {
                const uploadedUrl = await uploadImage(selectedFile)
                if (!uploadedUrl) {
                    setIsSubmitting(false)
                    return
                }
                finalImageUrl = uploadedUrl
            }

            // 2. Kirim Data ke Database
            const payload = {
                title: formData.title,
                content: formData.content,
                image: finalImageUrl
            }

            const url = isEditing && currentId ? `/api/events/${currentId}` : '/api/events'
            const method = isEditing && currentId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Gagal menyimpan ke database')

            setIsModalOpen(false)
            resetForm()
            fetchEvents()

        } catch (error: any) {
            alert(`GAGAL: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 3. Handle Delete
    const handleDelete = async (id: number) => {
        if (!confirm('Hapus event ini?')) return
        await fetch(`/api/events/${id}`, { method: 'DELETE' })
        fetchEvents()
    }

    // Helper Form
    const openEdit = (item: any) => {
        setIsEditing(true)
        setCurrentId(item.id)
        setFormData({
            title: item.title,
            content: item.content || '',
            image: item.image || ''
        })
        if (item.image) setPreviewUrl(item.image)
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({ title: '', content: '', image: '' })
        setPreviewUrl(null)
        setSelectedFile(null)
        setIsEditing(false)
        setCurrentId(null)
    }

    if (loading) return (
        <div className="p-10 text-center text-slate-400 font-bold">
            <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
            Memuat Data Event...
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER PAGE */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Manajemen Event</h2>
                    <p className="text-slate-500 text-sm mt-1">Atur jadwal acara, live music, atau workshop (Gratis & Terbuka).</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true) }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} /> Tambah Event
                </button>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                {events.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-blue-50 p-6 rounded-full mb-4 border border-blue-100"><Calendar size={40} className="text-blue-400" /></div>
                        <p className="font-bold text-slate-500">Belum ada event mendatang.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Poster</th>
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Nama Event</th>
                                <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Waktu & Deskripsi</th>
                                <th className="p-5 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {events.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/50 transition group">
                                    <td className="p-5 w-24">
                                        <div className="h-24 w-16 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200 shadow-sm group-hover:border-blue-200 transition">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                                            ) : <div className="absolute inset-0 flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition">{item.title}</p>
                                        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block border border-purple-200">GRATIS</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-start gap-2 text-slate-600 font-medium text-sm">
                                            <Clock size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <span className="line-clamp-2">{item.content || 'Waktu belum diatur'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 font-medium text-xs mt-2 ml-1">
                                            <MapPin size={14} /> Temala Coffee
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEdit(item)} className="p-2 bg-white border border-slate-200 text-amber-500 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition shadow-sm" title="Edit"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 transition shadow-sm" title="Hapus"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase">
                                <Calendar size={20} className="text-blue-500" />
                                {isEditing ? 'Edit Event' : 'Tambah Event Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">

                            {/* Input Nama Event */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nama Event / Acara</label>
                                <input required type="text" className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-bold text-slate-800 placeholder:text-slate-300"
                                    placeholder="Contoh: LIVE MUSIC MALAM MINGGU"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            {/* Input Waktu */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Waktu & Deskripsi</label>
                                <div className="relative">
                                    <Clock size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <textarea required className="w-full bg-white border-2 border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition font-medium text-slate-600 placeholder:text-slate-300 min-h-[100px]"
                                        placeholder="Contoh: Sabtu, 20 Agustus | 19.00 WIB. Dimeriahkan oleh Band Lokal."
                                        value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                                </div>
                            </div>

                            {/* Input Poster Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Upload Poster Event</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-400 transition bg-slate-50 relative cursor-pointer group">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                            <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                                            <div className="absolute inset-0 bg-blue-500/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition font-bold text-xs">Ganti Gambar</div>
                                        </div>
                                    ) : (
                                        <div className="py-6">
                                            <UploadCloud size={24} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-500">Klik Pilih Poster</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Format Portrait Disarankan</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition flex justify-center items-center gap-2 text-sm uppercase tracking-wide shadow-lg shadow-blue-500/30 mt-2">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? 'Mengupload...' : 'SIMPAN EVENT'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}