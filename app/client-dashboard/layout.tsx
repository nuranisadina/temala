// app/client-dashboard/layout.tsx
'use client'

import ClientDashboardContent from './ClientDashboardContent'

export default function ClientDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <ClientDashboardContent>{children}</ClientDashboardContent>
}
