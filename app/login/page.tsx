'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { ArrowRight, Loader2, Eye, EyeOff, Mail, Lock, Home, Coffee, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Email atau password salah!")
        setLoading(false)
        return
      }

      const session = await getSession()

      // @ts-ignore
      const rawRole = session?.user?.role || ''
      const role = rawRole.toLowerCase()

      console.log("LOGIN SUKSES! Role terdeteksi:", rawRole)

      if (role === 'admin') {
        window.location.replace('/dashboard')
      } else if (role === 'kasir') {
        window.location.replace('/kasir')
      } else if (role === 'pelanggan') {
        window.location.replace('/client-dashboard')
      } else {
        window.location.replace('/')
      }

    } catch (err) {
      console.error("Login Error:", err)
      setError("Terjadi kesalahan sistem.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- LEFT SIDE: IMAGE & BRANDING --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop"
          alt="Coffee Shop Atmosphere"
          fill
          className="object-cover brightness-50 scale-105 hover:scale-110 transition-transform duration-[10s] ease-linear"
          priority
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all duration-300">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">TEMALA.</span>
          </Link>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
              Nikmati Kopi Terbaik <br />
              <span className="text-blue-400">Setiap Hari.</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Masuk ke akun Anda untuk mengelola pesanan, melihat promo terbaru, dan menikmati layanan eksklusif dari Temala Coffee.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <CheckCircle2 size={18} className="text-blue-400" />
                <span>Biji Kopi Pilihan</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <CheckCircle2 size={18} className="text-blue-400" />
                <span>Pelayanan Cepat</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <CheckCircle2 size={18} className="text-blue-400" />
                <span>Suasana Nyaman</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <CheckCircle2 size={18} className="text-blue-400" />
                <span>Promo Eksklusif</span>
              </div>
            </div>
          </div>

          <div className="text-slate-500 text-sm font-medium">
            © 2025 Temala Coffee. All rights reserved.
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-black text-slate-900 tracking-tighter">TEMALA.</span>
          </Link>
        </div>

        {/* Back to Home (Desktop) */}
        <Link
          href="/"
          className="hidden lg:flex absolute top-8 right-8 items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <Home size={16} />
          <span>Beranda</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang Kembali</h1>
            <p className="text-slate-500 font-medium">Silakan masuk untuk melanjutkan akses Anda.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@temala.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition-all duration-300 placeholder:text-slate-400 font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Lupa Password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800 transition-all duration-300 placeholder:text-slate-400 font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-sm font-bold text-slate-600 cursor-pointer">Ingat Saya</label>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transform"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>MEMPROSES...</span>
                </>
              ) : (
                <>
                  <span>MASUK SEKARANG</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-slate-500 font-medium">
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden mt-12 text-slate-400 text-xs font-medium">
          © 2025 Temala Coffee. All rights reserved.
        </div>
      </div>
    </div>
  )
}