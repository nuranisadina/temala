// app/client-dashboard/ClientDashboardContent.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    ShoppingBag,
    User,
    History,
    LogOut,
    Coffee as LogoIcon,
    Menu,
    Bell
} from 'lucide-react'
import Image from 'next/image'

const menuItems = [
    { name: 'Dashboard', href: '/client-dashboard', icon: LayoutDashboard },
    { name: 'Pesanan Saya', href: '/client-dashboard/orders', icon: ShoppingBag },
    { name: 'Riwayat', href: '/client-dashboard/history', icon: History },
    { name: 'Profil', href: '/client-dashboard/profile', icon: User },
]

export default function ClientDashboardContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>

                <div className="relative flex flex-col items-center">
                    {/* Pulsing Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full animate-pulse-ring"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse-ring [animation-delay:1s]"></div>

                    {/* Floating Coffee Icon */}
                    <div className="relative w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl flex items-center justify-center animate-float">
                        <LogoIcon size={40} className="text-blue-500" strokeWidth={2.5} />

                        {/* Steam Particles */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
                            <div className="w-1.5 h-4 bg-blue-400/40 rounded-full animate-steam"></div>
                            <div className="w-1.5 h-6 bg-blue-400/20 rounded-full animate-steam [animation-delay:0.5s]"></div>
                            <div className="w-1.5 h-3 bg-blue-400/30 rounded-full animate-steam [animation-delay:1.2s]"></div>
                        </div>
                    </div>

                    {/* Text Animation */}
                    <div className="mt-12 text-center space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] animate-pulse">TEMALA.</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-1">Menyiapkan Pengalaman Terbaik</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 transition-colors">
            {/* === TOP HEADER BAR === */}
            <header className={`fixed top-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-30 flex items-center justify-between px-6 shadow-lg transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}>
                {/* Left: Hamburger Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all hover:scale-105 active:scale-95"
                    title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
                >
                    <Menu size={22} strokeWidth={2.5} />
                </button>

                {/* Right: User Actions */}
                <div className="flex items-center gap-3">
                    <button className="relative p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                        <Bell size={20} strokeWidth={2.5} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full ring-2 ring-white animate-pulse"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-white">{session?.user?.name}</p>
                            <p className="text-xs text-slate-500">Pelanggan</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* === SIDEBAR === */}
            <aside
                className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col fixed h-full z-20 shadow-2xl transition-all duration-300 ease-in-out`}
            >
                {/* Sidebar Header */}
                <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-5 gap-3'} border-b border-slate-800 bg-slate-900`}>
                    <Image
                        src="/logo.png"
                        alt="Temala Logo"
                        width={36}
                        height={36}
                        className="rounded-lg object-contain"
                    />
                    {!isCollapsed && (
                        <div className="animate-in fade-in duration-300">
                            <h1 className="font-black text-lg tracking-tight leading-none text-white">TEMALA.</h1>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Client Panel</p>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-hide mt-2">
                    {!isCollapsed && <div className="text-[10px] font-black text-slate-600 uppercase px-3 mb-3 tracking-wider animate-in fade-in">Menu Utama</div>}
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3.5 rounded-xl transition-all font-bold text-sm group relative ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                title={isCollapsed ? item.name : ''}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {!isCollapsed && <span className="ml-3 truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}

                                {/* Active Indicator */}
                                {isActive && !isCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                )}

                                {/* Tooltip for Collapsed State */}
                                {isCollapsed && (
                                    <div className="absolute left-16 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-slate-800 bg-slate-900">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-3'} w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-sm font-bold border border-red-500/20 hover:border-red-500/40`}
                        title="Keluar"
                    >
                        <LogOut size={20} strokeWidth={2.5} />
                        {!isCollapsed && <span>Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* === MAIN CONTENT AREA === */}
            <main className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
