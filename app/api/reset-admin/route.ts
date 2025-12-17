// app/api/reset-admin/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 1. Siapkan Password Baru
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // 2. Pastikan ROLE 'Admin' sudah ada di database
    // (Jaga-jaga kalau tabel Role juga kosong)
    let adminRole = await prisma.role.findFirst({
        where: { role_name: 'Admin' }
    })

    if (!adminRole) {
        // Kalau role Admin hilang, buat baru
        adminRole = await prisma.role.create({
            data: { role_name: 'Admin' }
        })
    }

    // 3. UPSERT ADMIN (Update jika ada, Create jika tidak ada)
    // Ini jurus pamungkasnya!
    const user = await prisma.user.upsert({
      where: { email: 'admin@temala.com' },
      update: {
        password: hashedPassword,
        role_id: adminRole.id // Pastikan jabatannya Admin
      },
      create: {
        name: 'Super Admin',
        email: 'admin@temala.com',
        password: hashedPassword,
        role_id: adminRole.id,
        phone: '08123456789'
      }
    })

    return NextResponse.json({ 
      message: "BERHASIL! Akun Admin telah dipulihkan.",
      detail: "Silakan Login -> Email: admin@temala.com | Pass: admin123",
      user_created: user 
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: "Gagal Total: " + error.message }, { status: 500 })
  }
}