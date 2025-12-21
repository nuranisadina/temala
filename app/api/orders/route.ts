// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1. GET: Ambil Transaksi (Support Filter Status & User ID)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')      // Untuk Notifikasi Kasir
  const userId = searchParams.get('user_id')     // Untuk Halaman "Pesanan Saya"

  try {
    // Bangun filter dinamis
    let whereClause: any = {}
    if (status) whereClause.status = status
    if (userId) whereClause.user_id = Number(userId)

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        payment: true,
        voucher: true,
        orderItems: {
          include: {
            menu: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Format data untuk frontend
    const formattedOrders = orders.map((order: any) => ({
      ...order,
      items: order.orderItems.map((item: any) => ({
        id: item.menu_id,
        name: item.menu.name,
        price: Number(item.menu.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        image: item.menu.image
      }))
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error("GET Orders Error:", error)
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 })
  }
}

// 2. POST: Proses Transaksi (Transaction Mode)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validasi Dasar
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja kosong" }, { status: 400 })
    }

    // Tentukan Status Awal berdasarkan sumber order
    // Jika ada user_id (dari client) -> Pending/Paid (menunggu verifikasi)
    // Jika tanpa user_id (dari kasir) -> Completed (langsung selesai)
    let initialStatus = 'Pending'

    if (body.user_id) {
      // Pesanan dari client - butuh verifikasi
      initialStatus = body.payment_proof ? 'Paid' : 'Pending'
    } else {
      // Pesanan dari kasir - langsung selesai
      initialStatus = 'Completed'
    }

    // Mulai Transaksi Database (Atomic Transaction)
    const result = await prisma.$transaction(async (tx: any) => {
      let calculatedTotal = 0

      // A. Validasi Stok dan Harga
      for (const item of body.items) {
        const menu = await tx.menu.findUnique({ where: { id: item.id } })

        if (!menu) {
          throw new Error(`Menu ${item.name || item.id} tidak ditemukan`)
        }

        if (menu.stock < item.quantity) {
          throw new Error(`Stok ${menu.name} tidak mencukupi (Tersisa: ${menu.stock})`)
        }

        calculatedTotal += Number(menu.price) * item.quantity
      }

      // B. Apply voucher discount if present
      let finalTotal = calculatedTotal
      const discountAmount = body.discount_amount || 0

      if (body.voucher_id && discountAmount > 0) {
        finalTotal = calculatedTotal - discountAmount
        if (finalTotal < 0) finalTotal = 0

        // Increment voucher used_count
        await tx.voucher.update({
          where: { id: body.voucher_id },
          data: { used_count: { increment: 1 } }
        })
      }

      // C. Buat Record Order Utama
      const newOrder = await tx.order.create({
        data: {
          customer_name: body.customer_name || 'Pelanggan Umum',
          customer_phone: body.customer_phone || '-',
          type_order: body.type_order || 'Dine In',
          table_number: body.table_number ? String(body.table_number) : null,
          status: initialStatus,
          total_price: finalTotal,
          user_id: body.user_id ? Number(body.user_id) : null,
          voucher_id: body.voucher_id || null,
          discount_amount: discountAmount,
        }
      })

      // D. Simpan Detail Item & Update Stok secara Serial
      for (const item of body.items) {
        await tx.orderItem.create({
          data: {
            order_id: newOrder.id,
            menu_id: item.id,
            quantity: item.quantity,
            subtotal: Number(item.price) * item.quantity
          }
        })

        // Kurangi stok menu
        await tx.menu.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // E. Simpan Pembayaran
      const paymentMethod = body.payment_method || 'Cash'
      const paymentStatus = initialStatus === 'Completed' ? 'Success' : 'Pending'

      await tx.payment.create({
        data: {
          order_id: newOrder.id,
          method: paymentMethod,
          status: paymentStatus,
          amount: finalTotal,
          payment_proof: body.payment_proof || null,
        }
      })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      message: body.payment_proof
        ? "Pesanan berhasil, menunggu verifikasi pembayaran"
        : "Transaksi berhasil diproses",
      orderId: result.id
    }, { status: 201 })

  } catch (error: any) {
    console.error("Transaction Error:", error.message)
    return NextResponse.json({ error: error.message || "Gagal memproses transaksi" }, { status: 500 })
  }
}