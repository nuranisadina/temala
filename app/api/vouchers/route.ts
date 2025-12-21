import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const vouchers = await prisma.voucher.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(vouchers)
    } catch (error) {
        console.error('Error fetching vouchers:', error)
        return NextResponse.json({ error: 'Gagal mengambil data voucher' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        // Validasi dan format tanggal
        const data = {
            ...body,
            start_date: new Date(body.start_date),
            end_date: new Date(body.end_date),
            discount: Number(body.discount),
            min_purchase: Number(body.min_purchase),
            max_discount: body.max_discount ? Number(body.max_discount) : null,
            usage_limit: body.usage_limit ? Number(body.usage_limit) : null
        }

        const voucher = await prisma.voucher.create({
            data
        })
        return NextResponse.json(voucher)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal membuat voucher' }, { status: 500 })
    }
}
