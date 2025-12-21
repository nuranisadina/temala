// app/api/payments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Ambil semua pembayaran (untuk Admin/Kasir melihat bukti)
export async function GET(request: Request) {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                order: {
                    include: {
                        user: true,
                        orderItems: {
                            include: { menu: true }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(payments)
    } catch (error) {
        console.error("GET Payments Error:", error)
        return NextResponse.json({ error: "Gagal mengambil data pembayaran" }, { status: 500 })
    }
}

// POST: Buat pembayaran baru dengan bukti (untuk pelanggan online order)
export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (!body.order_id) {
            return NextResponse.json({ error: "Order ID diperlukan" }, { status: 400 })
        }

        // Cek apakah order sudah ada payment
        const existingPayment = await prisma.payment.findUnique({
            where: { order_id: body.order_id }
        })

        if (existingPayment) {
            // Update bukti pembayaran jika sudah ada
            const updatedPayment = await prisma.payment.update({
                where: { order_id: body.order_id },
                data: {
                    payment_proof: body.payment_proof || null,
                    status: 'Pending', // Menunggu verifikasi
                }
            })

            // Update order status ke Paid (menunggu verifikasi)
            await prisma.order.update({
                where: { id: body.order_id },
                data: { status: 'Paid' }
            })

            return NextResponse.json({
                success: true,
                message: "Bukti pembayaran berhasil diupload",
                payment: updatedPayment
            })
        }

        // Ambil order untuk mendapatkan total
        const order = await prisma.order.findUnique({
            where: { id: body.order_id }
        })

        if (!order) {
            return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 })
        }

        // Buat payment baru
        const newPayment = await prisma.payment.create({
            data: {
                order_id: body.order_id,
                method: body.method || 'QRIS',
                status: 'Pending', // Menunggu verifikasi
                amount: order.total_price,
                payment_proof: body.payment_proof || null,
            }
        })

        // Update order status ke Paid
        await prisma.order.update({
            where: { id: body.order_id },
            data: { status: 'Paid' }
        })

        return NextResponse.json({
            success: true,
            message: "Pembayaran berhasil dibuat, menunggu verifikasi",
            payment: newPayment
        }, { status: 201 })

    } catch (error: any) {
        console.error("POST Payment Error:", error.message)
        return NextResponse.json({ error: error.message || "Gagal membuat pembayaran" }, { status: 500 })
    }
}
