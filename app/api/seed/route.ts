// app/api/seed/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 1. Pastikan Role Ada
    const roleAdmin = await prisma.role.upsert({
      where: { role_name: 'Admin' },
      update: {},
      create: { role_name: 'Admin' }
    })
    
    await prisma.role.upsert({
      where: { role_name: 'Kasir' },
      update: {},
      create: { role_name: 'Kasir' }
    })
    
    await prisma.role.upsert({
      where: { role_name: 'Pelanggan' },
      update: {},
      create: { role_name: 'Pelanggan' }
    })

    // 2. Cek apakah Admin sudah ada?
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@temala.com' }
    })

    if (existingAdmin) {
      return NextResponse.json({ message: "Akun Admin SUDAH ADA. Tidak perlu dibuat ulang." })
    }

    // 3. Buat Akun Admin Baru
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@temala.com',
        password: hashedPassword,
        
        // @ts-ignore
        phone: '081234567890', // Kita paksa TypeScript diam disini
        
        role_id: roleAdmin.id,
        image: null
      }
    })

    return NextResponse.json({ message: "SUKSES! Akun Admin berhasil dibuat ulang." })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}