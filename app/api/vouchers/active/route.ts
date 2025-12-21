// app/api/vouchers/active/route.ts
// Public API - Get active vouchers for promo banner display

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const now = new Date()

        const vouchers = await prisma.voucher.findMany({
            where: {
                is_active: true,
                start_date: { lte: now },
                end_date: { gte: now }
            },
            orderBy: { discount: 'desc' },
            take: 10
        })

        // Filter out vouchers that have reached their usage limit
        const activeVouchers = vouchers.filter(v =>
            v.usage_limit === null || v.used_count < v.usage_limit
        ).slice(0, 6) // Limit to 6 for display

        return NextResponse.json(activeVouchers)
    } catch (error) {
        console.error('Error fetching active vouchers:', error)
        return NextResponse.json({ error: 'Gagal mengambil voucher aktif' }, { status: 500 })
    }
}
