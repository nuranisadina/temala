// app/(public)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Coffee } from 'lucide-react'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        role_name: 'Pelanggan'
      })
    })
    const data = await res.json()
    if (res.ok) {
      alert("Registrasi Berhasil! Silakan Login.")
      router.push('/login')
    } else {
      alert(data.error || "Gagal mendaftar")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden font-sans">
      {/* Left Panel - Branding & Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950/90 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
          alt="Temala Coffee"
          fill
          className="object-cover scale-110 animate-pulse-slow"
        />

        <div className="relative z-20 p-16 flex flex-col justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40">
              <Coffee className="text-white" size={28} strokeWidth={2.5} />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase">Temala.</span>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-6xl font-black text-white leading-tight tracking-tighter uppercase">
                Join the <br />
                <span className="text-blue-500">Coffee Culture.</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-md">
                Daftar sekarang dan nikmati kemudahan memesan kopi favorit Anda, kumpulkan poin, dan dapatkan promo eksklusif.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                "Pemesanan Cepat",
                "Promo Eksklusif",
                "Riwayat Pesanan",
                "Poin Reward"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 font-black text-xs uppercase tracking-widest">
                  <CheckCircle2 className="text-blue-500" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="text-slate-500 text-xs font-black uppercase tracking-widest">
            © 2025 Temala Coffee Experience. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-950 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Buat Akun Baru</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Mulai perjalanan kopi Anda bersama kami.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text" required
                  className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700"
                  placeholder="Masukkan Nama Anda"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alamat Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email" required
                  className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700"
                  placeholder="nama@email.com"
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password" required
                  className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-slate-700"
                  placeholder="••••••••"
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-[0.2em] flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : null}
              {loading ? 'MENDAFTARKAN...' : 'DAFTAR SEKARANG'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 font-bold text-sm">
              Sudah punya akun? <Link href="/login" className="text-blue-500 hover:text-blue-400 transition-colors">Login di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}