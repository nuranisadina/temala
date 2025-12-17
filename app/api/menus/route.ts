// app/api/menus/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Ambil semua data menu/promo/event
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { 
        id: 'desc' // KITA URUTKAN PAKAI ID (Karena kamu tidak punya created_at)
      }
    })
    return NextResponse.json(menus)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// POST: Tambah data baru
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validasi sederhana
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Nama dan Harga wajib diisi' }, { status: 400 })
    }

    const newMenu = await prisma.menu.create({
      data: {
        name: body.name,
        category: body.category || 'coffee',
        price: body.price, // Prisma otomatis handle number ke Decimal
        stock: Number(body.stock) || 0,
        image: body.image || null,
        description: body.description || null,
        is_available: true
      }
    })

    return NextResponse.json(newMenu, { status: 201 })
  } catch (error) {
    console.error("POST Database Error:", error)
    return NextResponse.json({ error: 'Gagal menyimpan ke Database. Pastikan "npx prisma db push" sudah dijalankan.' }, { status: 500 })
  }
}

// PUT: Edit data
export async function PUT(request: Request) {
    try {
      const body = await request.json()
      
      if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  
      const updatedMenu = await prisma.menu.update({
        where: { id: Number(body.id) },
        data: {
          name: body.name,
          category: body.category,
          price: body.price,
          stock: Number(body.stock),
          image: body.image,
          description: body.description
        }
      })
  
      return NextResponse.json(updatedMenu)
    } catch (error) {
      console.error("PUT Error:", error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
  }

// DELETE: Hapus data
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await prisma.menu.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}