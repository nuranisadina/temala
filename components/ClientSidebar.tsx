// components/ClientSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    ShoppingBag,
    User,
    History,
    LogOut,
    Home
} from 'lucide-react'

const menuItems = [
    { name: 'Dashboard', href: '/client-dashboard', icon: LayoutDashboard },
    { name: 'Pesanan Saya', href: '/client-dashboard/orders', icon: ShoppingBag },
    { name: 'Riwayat', href: '/client-dashboard/history', icon: History },
    { name: 'Profil', href: '/client-dashboard/profile', icon: User },
]

export default function ClientSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-10">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center px-6 border-b border-slate-100 bg-gradient-to-r from-purple-600 to-purple-700">
                <h2 className="text-white font-bold text-lg">Client Dashboard</h2>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-purple-50 text-purple-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={20} className={`mr-3 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                            {item.name}
                        </Link>
                    )
                })}

                {/* Divider */}
                <div className="my-4 border-t border-slate-200"></div>

                {/* Back to Home */}
                <Link
                    href="/"
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <Home size={20} className="mr-3 text-slate-400" />
                    Kembali ke Home
                </Link>
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
