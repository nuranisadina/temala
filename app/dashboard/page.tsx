// app/dashboard/page.tsx
'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Plus, Edit, Trash2, Coffee, Image as ImageIcon, X, Loader2, UploadCloud } from 'lucide-react'
import Image from 'next/image'

export default function DashboardProducts() {
  const [menus, setMenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'coffee',
    price: '',
    stock: '',
    image: ''
  })

  useEffect(() => { fetchMenus() }, [])

  // Bersihkan preview
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
        // Filter: Hanya tampilkan produk (bukan promo/event)
        setMenus(data.filter((item: any) => !['promo', 'event'].includes(item.category)))
        setLoading(false)
    } catch (e) { setLoading(false) }
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
          return data.success ? data.url : null
      } catch (e) { return null }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let finalImageUrl = formData.image
    if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile)
        if (uploadedUrl) finalImageUrl = uploadedUrl
        else {
            alert("Gagal upload gambar. Pastikan folder public/uploads ada.")
            setIsSubmitting(false)
            return
        }
    }

    const payload = { 
        ...formData, 
        price: Number(formData.price), 
        stock: Number(formData.stock),
        image: finalImageUrl
    }

    try {
        const method = isEditing && currentId ? 'PUT' : 'POST'
        const body = isEditing && currentId ? { id: currentId, ...payload } : payload
        const res = await fetch('/api/menus', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        
        if (!res.ok) throw new Error('Gagal simpan DB')
        
        setIsModalOpen(false)
        setFormData({ name: '', category: 'coffee', price: '', stock: '', image: '' }) // Reset Manual
        setSelectedFile(null)
        setPreviewUrl(null)
        fetchMenus()
    } catch (error) { alert('Gagal menyimpan data') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    if(!confirm('Hapus menu ini?')) return
    await fetch(`/api/menus?id=${id}`, { method: 'DELETE' })
    fetchMenus()
  }

  const openEdit = (item: any) => {
      setIsEditing(true)
      setCurrentId(item.id)
      setFormData({ name: item.name, category: item.category, price: item.price, stock: item.stock, image: item.image || '' })
      if(item.image) setPreviewUrl(item.image)
      setIsModalOpen(true)
  }

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Memuat Menu...</div>

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase">Manajemen Menu</h2>
              <p className="text-slate-500 text-sm mt-1">Atur daftar makanan & minuman.</p>
          </div>
          <button onClick={() => { setIsEditing(false); setFormData({ name: '', category: 'coffee', price: '', stock: '', image: '' }); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition">
              <Plus size={20}/> Tambah Menu
          </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase">Produk</th>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase">Kategori</th>
                      <th className="p-5 text-xs font-bold text-slate-500 uppercase">Harga</th>
                      <th className="p-5 text-center text-xs font-bold text-slate-500 uppercase">Aksi</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {menus.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-5 flex items-center gap-4">
                              <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border relative">
                                  {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover"/> : <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon/></div>}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-800">{item.name}</p>
                                  <p className="text-xs text-slate-400">Stok: {item.stock}</p>
                              </div>
                          </td>
                          <td className="p-5"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-100">{item.category}</span></td>
                          <td className="p-5 font-bold text-slate-600">Rp {item.price.toLocaleString()}</td>
                          <td className="p-5 text-center">
                              <div className="flex justify-center gap-2">
                                  <button onClick={() => openEdit(item)} className="p-2 bg-white border border-slate-200 text-yellow-600 rounded-lg hover:bg-yellow-50"><Edit size={18}/></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={18}/></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditing ? 'Edit Menu' : 'Tambah Menu'}</h3>
                    <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting}><X/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Produk</label>
                        <input required type="text" className="w-full border rounded-lg p-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                            <select className="w-full border rounded-lg p-3 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="coffee">Coffee</option>
                                <option value="non-coffee">Non Coffee</option>
                                <option value="food">Food</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Harga</label>
                            <input required type="number" className="w-full border rounded-lg p-3" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Stok</label>
                        <input required type="number" className="w-full border rounded-lg p-3" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}/>
                    </div>
                    
                    {/* INPUT GAMBAR */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1">Gambar Produk</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 transition bg-slate-50 relative cursor-pointer group">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                            {previewUrl ? (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                     <Image src={previewUrl} alt="Preview" fill className="object-contain"/>
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-xs font-bold">Ganti Gambar</div>
                                </div>
                            ) : (
                                <div className="py-4 text-slate-400">
                                    <UploadCloud className="mx-auto mb-2"/>
                                    <span className="text-xs">Klik Upload Gambar</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex justify-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin"/> : null}
                        {isSubmitting ? 'Menyimpan...' : 'SIMPAN'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}