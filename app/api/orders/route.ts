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
        payment: true, // Tambahkan include payment agar info bayar muncul di Dashboard Kasir
        orderItems: { 
          include: { 
            menu: true 
          } 
        } 
      },
      orderBy: { created_at: 'desc' }
    })

    // Format data agar sesuai dengan ekspektasi Frontend (menggunakan 'items')
    const formattedOrders = orders.map(order => ({
        ...order,
        // Ubah orderItems menjadi items agar seragam dengan fungsi POST
        items: order.orderItems.map(item => ({
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

    // Tentukan Status Awal
    // Jika Online Order -> Pending, Jika Kasir/Manual -> Completed
    const initialStatus = body.type_order === 'Online Order' ? 'Pending' : 'Completed'

    // Mulai Transaksi Database (Atomic Transaction)
    const result = await prisma.$transaction(async (tx) => {
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

      // B. Buat Record Order Utama
      const newOrder = await tx.order.create({
        data: {
          customer_name: body.customer_name || 'Pelanggan Umum',
          customer_phone: body.customer_phone || '-', 
          type_order: body.type_order || 'Dine In', 
          table_number: body.table_number ? String(body.table_number) : null,
          status: initialStatus,
          total_price: calculatedTotal,
          user_id: body.user_id ? Number(body.user_id) : null,
        }
      })

      // C. Simpan Detail Item & Update Stok secara Serial
      for (const item of body.items) {
        // Simpan ke tabel OrderItem 
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

      // D. Simpan Pembayaran (Hanya jika langsung lunas/dari Kasir)
      if (initialStatus === 'Completed') {
          await tx.payment.create({
            data: {
              order_id: newOrder.id,
              method: body.payment_method || 'Cash', 
              status: 'Success',
            }
          })
      }

      return newOrder
    })

    return NextResponse.json({ 
      success: true, 
      message: "Transaksi berhasil diproses", 
      orderId: result.id 
    }, { status: 201 })

  } catch (error: any) {
    console.error("Transaction Error:", error.message)
    // Kirim pesan error spesifik dari 'throw new Error' diatas ke frontend
    return NextResponse.json({ error: error.message || "Gagal memproses transaksi" }, { status: 500 })
  }
}