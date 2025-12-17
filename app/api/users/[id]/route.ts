// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  // Perhatikan tipe data params di sini berubah jadi Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX UTAMA: Kita harus 'await' params dulu sebelum ambil ID-nya
    const { id } = await params
    const userId = Number(id)

    // Cek apakah ID valid?
    if (isNaN(userId)) {
        return NextResponse.json({ error: "ID User tidak valid" }, { status: 400 })
    }

    // 1. Cari dulu apakah user ini punya pesanan/transaksi?
    const userOrders = await prisma.order.findMany({
      where: { user_id: userId },
      select: { id: true }
    })

    const orderIds = userOrders.map(o => o.id)

    // 2. JIKA ADA TRANSAKSI, HAPUS DULU SEMUA JEJAKNYA (Bersih-bersih)
    if (orderIds.length > 0) {
      // Hapus Item Pesanan
      await prisma.orderItem.deleteMany({
        where: { order_id: { in: orderIds } }
      })

      // Hapus Data Pembayaran
      await prisma.payment.deleteMany({
        where: { order_id: { in: orderIds } }
      })

      // Hapus Pesanan Utama
      await prisma.order.deleteMany({
        where: { user_id: userId }
      })
    }

    // 3. Setelah bersih, BARU HAPUS USERNYA
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: "User dan seluruh datanya berhasil dihapus total." })
  } catch (error: any) {
    console.error("Gagal hapus:", error)
    return NextResponse.json({ error: error.message || "Gagal menghapus user" }, { status: 500 })
  }
}