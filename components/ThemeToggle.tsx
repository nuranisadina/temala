'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.classList.add(savedTheme)
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const initialTheme = prefersDark ? 'dark' : 'light'
            setTheme(initialTheme)
            document.documentElement.classList.add(initialTheme)
        }
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)

        // Update DOM
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newTheme)

        // Save to localStorage
        localStorage.setItem('theme', newTheme)

        // Debug log
        console.log('Theme toggled to:', newTheme)
        console.log('HTML classes:', document.documentElement.className)
    }

    if (!mounted) {
        return (
            <div className="w-10 h-10"></div> // Placeholder to prevent layout shift
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-all"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon size={20} strokeWidth={2.5} />
            ) : (
                <Sun size={20} strokeWidth={2.5} />
            )}
        </button>
    )
}
