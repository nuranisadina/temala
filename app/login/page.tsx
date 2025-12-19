'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { Coffee, ArrowRight, Loader2, Eye, EyeOff, Mail, Lock, Home } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/50 p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full shadow-lg shadow-slate-200/50 text-slate-700 hover:bg-white hover:shadow-xl transition-all group"
      >
        <Home size={18} className="group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm">Kembali ke Beranda</span>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          {/* Logo removed */}
          <h1 className="text-3xl font-black text-slate-900 mb-1">Temala Coffee</h1>
          <p className="text-slate-600">Masuk untuk melanjutkan</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-white/50">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Selamat Datang</h2>
            <p className="text-slate-500 text-sm">Silakan masukkan kredensial Anda</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@temala.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 text-slate-800 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 text-slate-800 bg-white/50 backdrop-blur-sm transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-400/40 hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed mt-6 hover:scale-[1.02] active:scale-[0.98] transform"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-400 font-bold hover:text-blue-500 hover:underline transition">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-xs">
            © 2025 Temala Coffee. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}