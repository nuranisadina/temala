// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH: Update Status Pesanan (Misal: Kasir Terima Order Online -> Completed)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // FIX: Pakai Promise biar aman di Next.js terbaru
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body // Frontend kirim: { status: 'Completed' }

    // 1. Update Status Order
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status }
    })

    // 2. LOGIKA TAMBAHAN: 
    // Jika status berubah jadi 'Completed' (Diterima Kasir),
    // Pastikan data Pembayaran (Payment) tercatat.
    if (status === 'Completed') {
      const existPayment = await prisma.payment.findFirst({
        where: { order_id: Number(id) }
      })

      // Jika belum ada pembayaran (karena pesanan online), buatkan record pembayaran otomatis
      if (!existPayment) {
        await prisma.payment.create({
          data: {
            order_id: Number(id),
            method: 'Cash', // Default Cash (atau bisa diupdate nanti)
            status: 'Success',
            amount: Number(updatedOrder.total_price)
          }
        })
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal update order" }, { status: 500 })
  }
}

// DELETE: Hapus Pesanan (Admin Only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // FIX: Pakai Promise
) {
  try {
    const { id } = await params

    // 1. Hapus Item Order dulu (Hapus anaknya)
    await prisma.orderItem.deleteMany({
      where: { order_id: Number(id) }
    })

    // 2. Hapus Payment terkait (Hapus bukti bayar)
    await prisma.payment.deleteMany({
      where: { order_id: Number(id) }
    })

    // 3. Hapus Order Utama (Hapus induknya)
    await prisma.order.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ message: "Order berhasil dihapus permanen" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus order" }, { status: 500 })
  }
}