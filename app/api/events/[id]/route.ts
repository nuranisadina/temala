import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json()
        const { title, content, image } = body

        const event = await prisma.event.update({
            where: { id: Number(params.id) },
            data: { title, content, image }
        })
        return NextResponse.json(event)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal update event' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.event.delete({
            where: { id: Number(params.id) }
        })
        return NextResponse.json({ message: 'Event dihapus' })
    } catch (error) {
        return NextResponse.json({ error: 'Gagal hapus event' }, { status: 500 })
    }
}
