// app/dashboard/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, User, Shield, Phone, Search, Loader2 } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  
  // State Form: Default role kita set ke 'Pelanggan'
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role_name: 'Pelanggan' 
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) return alert("Wajib diisi!")

    setSubmitting(true)
    try {
      // Kita kirim 'role_name' (Admin/Kasir/Pelanggan) ke backend
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        alert("User berhasil ditambahkan!")
        setShowModal(false)
        setFormData({ name: '', email: '', password: '', phone: '', role_name: 'Pelanggan' }) // Reset form
        fetchUsers() // Refresh tabel
      } else {
        const err = await res.json()
        alert(err.error || "Gagal menambah user")
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, roleName: string) => {
    if (roleName === 'Admin') return alert("DILARANG MENGHAPUS ADMIN!")
    if (!confirm("Hapus user ini beserta datanya?")) return

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchUsers()
      } else {
        alert("Gagal menghapus")
      }
    } catch (e) { alert("Error sistem") }
  }

  // Filter User berdasarkan pencarian
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
           <p className="text-slate-500 text-sm">Kelola Admin, Kasir & Pelanggan</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative max-w-sm">
         <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
         <input 
            type="text" 
            placeholder="Cari nama user..." 
            className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
         />
      </div>

      {/* Tabel Users */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100">
             <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
             ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Tidak ada user ditemukan.</td></tr>
             ) : filteredUsers.map(user => (
               <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
                        <User size={20}/>
                    </div>
                    {user.name}
                 </td>
                 <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{user.email}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Phone size={12}/> {user.phone || '-'}
                    </p>
                 </td>
                 <td className="px-6 py-4">
                    {/* Badge Role Warna-warni */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit border ${
                        user.role_name === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' : 
                        user.role_name === 'Kasir' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                    }`}>
                        <Shield size={12}/> {user.role_name}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id, user.role_name)} 
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Hapus User"
                    >
                      <Trash2 size={18}/>
                    </button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl scale-100">
              <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Tambah User Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nama Lengkap</label>
                    <input className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Login</label>
                    <input type="email" className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password</label>
                    <input type="password" className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">No. HP</label>
                    <input type="tel" className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
                 
                 {/* PILIHAN JABATAN (ROLE) */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Jabatan</label>
                    <select 
                        className="w-full border border-slate-300 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" 
                        value={formData.role_name} 
                        onChange={e => setFormData({...formData, role_name: e.target.value})}
                    >
                        <option value="Pelanggan">Pelanggan</option>
                        <option value="Kasir">Kasir</option> 
                        <option value="Admin">Admin</option>
                    </select>
                 </div>

                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Batal</button>
                    <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2">
                        {submitting && <Loader2 size={16} className="animate-spin"/>} Simpan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}