// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Coffee, 
  Users, 
  FileText, 
  LogOut, 
  ShoppingBag 
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manajemen Menu', href: '/dashboard/menus', icon: Coffee }, 
  { name: 'Pesanan Masuk', href: '/dashboard/orders', icon: ShoppingBag }, 
  { name: 'Manajemen User', href: '/dashboard/users', icon: Users }, 
  { name: 'Laporan', href: '/dashboard/reports', icon: FileText }, 
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-10">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        <span className="text-lg font-bold text-slate-800">Temala Coffee</span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={`mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })} 
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Keluar
        </button>
      </div>
    </aside>
  )
}