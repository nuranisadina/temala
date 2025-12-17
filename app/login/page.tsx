'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react' 
import { Coffee, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Proses Login menggunakan NextAuth Credentials
      const res = await signIn('credentials', {
        redirect: false, // Kita handle redirect manual berdasarkan role
        email,
        password,
      })

      if (res?.error) {
        setError("Email atau password salah!")
        setLoading(false)
        return
      }

      // 2. Ambil sesi terbaru untuk validasi role
      const session = await getSession()
      
      // Ambil role dari session (memastikan data role sudah dikirim dari API Auth)
      // @ts-ignore
      const rawRole = session?.user?.role || ''
      const role = rawRole.toLowerCase() // Ubah ke huruf kecil untuk perbandingan aman
      
      console.log("LOGIN SUKSES! Role terdeteksi:", rawRole)

      // 3. PENGALIHAN PAKSA (Hard Redirect)
      // window.location.replace digunakan untuk membuang history login dan menembus cache
      if (role === 'admin') {
         // ADMIN -> Ke Halaman Manajemen Menu
         window.location.replace('/dashboard') 
      } else if (role === 'kasir') {
         // KASIR -> Ke Halaman POS/Kasir
         window.location.replace('/kasir') 
      } else {
         // PELANGGAN -> Ke Beranda Utama
         window.location.replace('/')
      }

    } catch (err) {
      console.error("Login Error:", err)
      setError("Terjadi kesalahan sistem.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="text-center mb-8">
             <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Coffee size={32} />
             </div>
             <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Login Temala</h1>
             <p className="text-slate-500 text-sm">Masuk untuk mengelola pesanan</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-bold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Email Address</label>
               <input 
                 type="email" 
                 required 
                 placeholder="admin@temala.com" 
                 value={email} 
                 onChange={e => setEmail(e.target.value)} 
                 className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-slate-50/50 transition" 
               />
             </div>
             
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Password</label>
               <input 
                 type="password" 
                 required 
                 placeholder="••••••••" 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-slate-50/50 transition" 
               />
             </div>

             <button 
               disabled={loading} 
               type="submit"
               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 disabled:opacity-70 mt-2"
             >
                {loading ? <Loader2 className="animate-spin"/> : <>Masuk Sekarang <ArrowRight size={18}/></>}
             </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            Belum punya akun? <Link href="/register" className="text-blue-600 font-bold hover:underline">Daftar Sekarang</Link>
          </div>
       </div>
    </div>
  )
}