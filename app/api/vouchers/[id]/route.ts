import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json()
        const data = {
            ...body,
            start_date: new Date(body.start_date),
            end_date: new Date(body.end_date),
            discount: Number(body.discount),
            min_purchase: Number(body.min_purchase),
            max_discount: body.max_discount ? Number(body.max_discount) : null,
            usage_limit: body.usage_limit ? Number(body.usage_limit) : null
        }

        const voucher = await prisma.voucher.update({
            where: { id: Number(params.id) },
            data
        })
        return NextResponse.json(voucher)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal update voucher' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.voucher.delete({
            where: { id: Number(params.id) }
        })
        return NextResponse.json({ message: 'Voucher dihapus' })
    } catch (error) {
        return NextResponse.json({ error: 'Gagal hapus voucher' }, { status: 500 })
    }
}
