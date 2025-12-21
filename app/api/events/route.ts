import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' }
        })
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data event' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, content, image } = body

        const event = await prisma.event.create({
            data: {
                title,
                content,
                image
            }
        })
        return NextResponse.json(event)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal membuat event' }, { status: 500 })
    }
}
