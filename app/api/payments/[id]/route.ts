// app/api/payments/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Ambil detail pembayaran
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const payment = await prisma.payment.findUnique({
            where: { id: Number(id) },
            include: {
                order: {
                    include: {
                        user: true,
                        orderItems: {
                            include: { menu: true }
                        }
                    }
                }
            }
        })

        if (!payment) {
            return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 })
        }

        return NextResponse.json(payment)
    } catch (error) {
        console.error("GET Payment Error:", error)
        return NextResponse.json({ error: "Gagal mengambil data pembayaran" }, { status: 500 })
    }
}

// PATCH: Verifikasi pembayaran (untuk Kasir/Admin)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const body = await request.json()

        const payment = await prisma.payment.findUnique({
            where: { id: Number(id) }
        })

        if (!payment) {
            return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 })
        }

        // Update payment status
        const updatedPayment = await prisma.payment.update({
            where: { id: Number(id) },
            data: {
                status: body.status || payment.status,
                verified_at: body.status === 'Success' ? new Date() : null,
                verified_by: body.verified_by || null,
            }
        })

        // Jika pembayaran diverifikasi (Success), update order status
        if (body.status === 'Success') {
            await prisma.order.update({
                where: { id: payment.order_id },
                data: { status: 'Completed' }
            })
        }

        // Jika pembayaran ditolak (Failed), kembalikan status order
        if (body.status === 'Failed') {
            await prisma.order.update({
                where: { id: payment.order_id },
                data: { status: 'Cancelled' }
            })
        }

        return NextResponse.json({
            success: true,
            message: body.status === 'Success' ? "Pembayaran terverifikasi" : "Status pembayaran diupdate",
            payment: updatedPayment
        })

    } catch (error: any) {
        console.error("PATCH Payment Error:", error.message)
        return NextResponse.json({ error: error.message || "Gagal update pembayaran" }, { status: 500 })
    }
}
