// app/api/menus/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

type Props = {
  params: Promise<{ id: string }>
}

// DELETE: Hapus Menu
export async function DELETE(request: Request, props: Props) {
  try {
    const params = await props.params
    const id = parseInt(params.id)

    // (Opsional) Hapus file gambar lama dari folder uploads jika perlu
    // const menu = await prisma.menu.findUnique({ where: { id } })
    // if (menu?.image) { ... logic hapus file ... }

    await prisma.menu.delete({ where: { id } })
    return NextResponse.json({ message: "Berhasil dihapus" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 })
  }
}

// PUT: Edit Menu (Update Data & Gambar)
export async function PUT(request: Request, props: Props) {
  try {
    const params = await props.params
    const id = parseInt(params.id)

    const formData = await request.formData()

    // Ambil data text
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const stock = formData.get('stock') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    
    // Ambil file gambar
    const file = formData.get('image') as File | null

    // Siapkan data update dasar
    const dataToUpdate: any = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description: description || '',
    }

    // LOGIKA UBAH GAMBAR
    // Hanya proses jika ada file baru yang diupload (size > 0)
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Buat nama file unik baru
      const filename = Date.now() + '-' + file.name.replaceAll(" ", "_")
      const uploadDir = path.join(process.cwd(), 'public/uploads', filename)
      
      await writeFile(uploadDir, buffer)
      
      // Update database dengan URL gambar BARU
      dataToUpdate.image = `/uploads/${filename}`
    }
    // Jika tidak ada file baru, 'dataToUpdate.image' tidak di-set, 
    // jadi Prisma akan tetap menyimpan URL gambar yang LAMA (tidak hilang).

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: dataToUpdate
    })

    return NextResponse.json(updatedMenu)
  } catch (error) {
    console.error("Error Update:", error)
    return NextResponse.json({ error: "Gagal mengupdate menu" }, { status: 500 })
  }
}