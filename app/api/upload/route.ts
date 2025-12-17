// app/api/upload/route.ts
import { NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import fs from 'fs'

export async function POST(request: Request) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Simpan di public/uploads
  // Pastikan folder public/uploads SUDAH DIBUAT MANUAL jika script ini gagal membuatnya otomatis
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
  }

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const filepath = path.join(uploadDir, filename)
  
  try {
    await writeFile(filepath, buffer)
    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
  }
}