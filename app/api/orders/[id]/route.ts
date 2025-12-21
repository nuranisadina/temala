// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH: Update Status Pesanan
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // 1. Update Status Order
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status }
    })

    // 2. Update Payment Status sesuai Order Status
    if (status === 'Completed') {
      await prisma.payment.updateMany({
        where: { order_id: Number(id) },
        data: {
          status: 'Success',
          verified_at: new Date()
        }
      })
    }

    if (status === 'Cancelled') {
      await prisma.payment.updateMany({
        where: { order_id: Number(id) },
        data: { status: 'Failed' }
      })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal update order" }, { status: 500 })
  }
}

// DELETE: Hapus Pesanan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Hapus Item Order dulu
    await prisma.orderItem.deleteMany({
      where: { order_id: Number(id) }
    })

    // 2. Hapus Payment terkait
    await prisma.payment.deleteMany({
      where: { order_id: Number(id) }
    })

    // 3. Hapus Order Utama
    await prisma.order.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ message: "Order berhasil dihapus permanen" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus order" }, { status: 500 })
  }
}