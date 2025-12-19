// app/dashboard/layout.tsx
'use client'

import DashboardContent from './DashboardContent'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardContent>{children}</DashboardContent>
}