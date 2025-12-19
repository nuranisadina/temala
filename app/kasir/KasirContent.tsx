// app/kasir/KasirContent.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, ClipboardList, LogOut, Coffee as LogoIcon, Menu, Bell, User } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface KasirContentProps {
    children: React.ReactNode
}

export default function KasirContent({ children }: KasirContentProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const menuItems = [
        { name: 'POS System', href: '/kasir', icon: Store },
        { name: 'Laporan', href: '/kasir/reports', icon: ClipboardList },
    ]

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
            {/* === TOP HEADER BAR === */}
            <header className={`fixed top-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-30 flex items-center justify-between px-6 shadow-sm transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}>
                {/* Left: Hamburger Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <Menu size={22} />
                </button>

                {/* Right: User Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                            <User size={18} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hidden md:block">Kasir</span>
                    </div>
                </div>
            </header>

            {/* === SIDEBAR === */}
            <aside
                className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex flex-col fixed h-full z-20 shadow-2xl transition-all duration-300 ease-in-out`}
            >
                {/* Sidebar Header (Logo Only) */}
                <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-5 gap-3'} border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800`}>
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                        <LogoIcon size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in duration-300">
                            <h1 className="font-black text-lg tracking-tight leading-none text-slate-800 dark:text-white">TEMALA.</h1>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kasir Panel</p>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-2 space-y-1.5 overflow-y-auto scrollbar-hide mt-3">
                    {!isCollapsed && <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase px-4 mb-2 tracking-wider animate-in fade-in">Aplikasi</div>}
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl transition-all font-bold text-sm group relative ${isActive
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                title={isCollapsed ? item.name : ''}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {!isCollapsed && <span className="ml-3 truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}

                                {/* Tooltip for Collapsed State */}
                                {isCollapsed && (
                                    <div className="absolute left-16 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-3'} w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-sm font-bold border border-red-500/20`}
                        title="Keluar"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* === MAIN CONTENT AREA === */}
            <main className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
