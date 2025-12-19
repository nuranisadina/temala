// app/kasir/layout.tsx
'use client'

import KasirContent from './KasirContent'

export default function KasirLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <KasirContent>{children}</KasirContent>
}
