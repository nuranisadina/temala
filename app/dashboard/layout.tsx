// app/dashboard/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Tambahkan ikon Tag (Promo) dan Calendar (Event)
import { LayoutDashboard, Coffee, Users, ClipboardList, LogOut, Coffee as LogoIcon, Tag, Calendar } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu & Produk', href: '/dashboard/menus', icon: Coffee },
    // --- TAMBAHAN MENU BARU ---
    { name: 'Promo Banner', href: '/dashboard/promos', icon: Tag },
    { name: 'Event & Acara', href: '/dashboard/events', icon: Calendar },
    // --------------------------
    { name: 'Pengguna', href: '/dashboard/users', icon: Users },
    { name: 'Laporan & Order', href: '/dashboard/reports', icon: ClipboardList },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <LogoIcon size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none">TEMALA.</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 mt-4 tracking-wider">Menu Utama</div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={18} strokeWidth={2.5} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-sm font-bold border border-red-500/20"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 ml-64 p-8 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  )
} 