// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET: Ambil semua user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }, 
      orderBy: { created_at: 'desc' }
    })
    
    // PERBAIKAN DI SINI: Kita "gepengkan" datanya jadi string biasa
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      // @ts-ignore
      phone: user.phone || '-',
      
      // Ambil nama role dengan aman
      role_name: user.role ? user.role.role_name : 'User', 
      
      role_id: user.role_id,
      created_at: user.created_at
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 })
  }
}

// POST: Tambah User Baru
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // --- PERBAIKAN LOGIKA ROLE ---
    // Frontend mengirim 'role_name' (String), kita harus cari ID-nya di database
    let targetRoleId = body.role_id

    if (body.role_name) {
        // Cari ID berdasarkan nama role (misal: "Pelanggan")
        let roleData = await prisma.role.findFirst({
            where: { role_name: body.role_name }
        })

        // Jika Role "Pelanggan" belum ada di database, buat otomatis
        if (!roleData && body.role_name === 'Pelanggan') {
            roleData = await prisma.role.create({ data: { role_name: 'Pelanggan' } })
        }

        if (roleData) targetRoleId = roleData.id
    }
    // -----------------------------

    // Validasi
    if (!body.name || !body.email || !body.password || !targetRoleId) {
      return NextResponse.json({ error: "Data tidak lengkap / Role tidak valid" }, { status: 400 })
    }

    // Cek Email
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 })
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Simpan
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        // @ts-ignore
        phone: body.phone || null,
        role_id: Number(targetRoleId) // Gunakan ID yang sudah ditemukan tadi
      }
    })

    return NextResponse.json({ message: "User berhasil dibuat", user: newUser }, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 })
  }
}