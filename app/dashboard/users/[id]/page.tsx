// app/dashboard/users/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Shield, Calendar } from 'lucide-react'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Ambil ID dari URL
  const id = params.id 

  useEffect(() => {
    if (id) {
      fetchUserDetail()
    }
  }, [id])

  const fetchUserDetail = async () => {
    try {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error("User not found")
      const data = await res.json()
      setUser(data)
    } catch (error) {
      alert("Gagal mengambil data user")
      router.push('/dashboard/users') // Kembali jika error
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Memuat profil...</div>
  if (!user) return <div className="p-8">User tidak ditemukan</div>

  return (
    <div>
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Kembali ke Daftar User
      </button>

      {/* Kartu Profil */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <User size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <span className={`mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {user.role}
          </span>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="text-slate-400" />
              <span className="text-slate-600">Email Login</span>
            </div>
            <span className="font-medium text-slate-900">{user.email}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="text-slate-400" />
              <span className="text-slate-600">Hak Akses</span>
            </div>
            <span className="font-medium text-slate-900">{user.role}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="text-slate-400" />
              <span className="text-slate-600">Tanggal Bergabung</span>
            </div>
            <span className="font-medium text-slate-900">
              {new Date(user.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}