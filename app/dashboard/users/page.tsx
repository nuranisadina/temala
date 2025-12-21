// app/dashboard/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, User, Shield, Phone, Search, Loader2, Users } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola Admin, Kasir & Pelanggan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Cari nama user..."
          className="pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl w-full outline-none focus:border-blue-500 transition font-medium text-slate-700 bg-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabel Users */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nama</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Kontak</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Jabatan</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
                Memuat data...
              </td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-50 p-4 rounded-full mb-3 border border-blue-100">
                    <Users size={32} className="text-blue-400" />
                  </div>
                  <p className="text-slate-500 font-bold">Tidak ada user ditemukan.</p>
                </div>
              </td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-500 border border-blue-200 group-hover:border-blue-300 transition">
                    <User size={20} />
                  </div>
                  <span className="group-hover:text-blue-600 transition">{user.name}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-700">{user.email}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Phone size={12} /> {user.phone || '-'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {/* Badge Role Warna-warni */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit border ${user.role_name === 'Admin' ? 'bg-red-50 text-red-600 border-red-200' :
                    user.role_name === 'Kasir' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-green-50 text-green-600 border-green-200'
                    }`}>
                    <Shield size={12} /> {user.role_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(user.id, user.role_name)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition border border-transparent hover:border-red-200"
                    title="Hapus User"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                <User size={20} className="text-blue-500" />
                Tambah User Baru
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Nama Lengkap</label>
                <input className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition font-bold text-slate-800 placeholder:text-slate-300" required placeholder="Nama lengkap" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Email Login</label>
                <input type="email" className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition font-medium text-slate-700 placeholder:text-slate-300" required placeholder="email@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Password</label>
                <input type="password" className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition font-medium text-slate-700 placeholder:text-slate-300" required placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">No. HP</label>
                <input type="tel" className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition font-medium text-slate-700 placeholder:text-slate-300" placeholder="08xxx" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>

              {/* PILIHAN JABATAN (ROLE) */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Jabatan</label>
                <select
                  className="w-full border-2 border-slate-200 p-3 rounded-xl bg-white outline-none focus:border-blue-500 transition font-bold text-slate-700"
                  value={formData.role_name}
                  onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                >
                  <option value="Pelanggan">Pelanggan</option>
                  <option value="Kasir">Kasir</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition">Batal</button>
                <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 transition">
                  {submitting && <Loader2 size={16} className="animate-spin" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}