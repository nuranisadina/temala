// app/api/vouchers/apply/route.ts
// API untuk validasi dan menghitung diskon voucher

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { code, total_price } = await req.json()

        if (!code) {
            return NextResponse.json({
                valid: false,
                error: 'Kode voucher diperlukan'
            }, { status: 400 })
        }

        const now = new Date()

        // Cari voucher
        const voucher = await prisma.voucher.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (!voucher) {
            return NextResponse.json({
                valid: false,
                error: 'Kode voucher tidak ditemukan'
            }, { status: 404 })
        }

        // Cek apakah voucher aktif
        if (!voucher.is_active) {
            return NextResponse.json({
                valid: false,
                error: 'Voucher tidak aktif'
            }, { status: 400 })
        }

        // Cek tanggal berlaku
        if (now < voucher.start_date) {
            return NextResponse.json({
                valid: false,
                error: 'Voucher belum berlaku'
            }, { status: 400 })
        }

        if (now > voucher.end_date) {
            return NextResponse.json({
                valid: false,
                error: 'Voucher sudah kadaluarsa'
            }, { status: 400 })
        }

        // Cek limit penggunaan
        if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
            return NextResponse.json({
                valid: false,
                error: 'Voucher sudah mencapai batas penggunaan'
            }, { status: 400 })
        }

        // Cek minimum pembelian
        if (total_price < voucher.min_purchase) {
            return NextResponse.json({
                valid: false,
                error: `Minimum pembelian Rp ${voucher.min_purchase.toLocaleString()}`
            }, { status: 400 })
        }

        // Hitung diskon
        let discount_amount = 0

        if (voucher.type === 'PERCENTAGE') {
            discount_amount = (voucher.discount / 100) * total_price
            // Terapkan max_discount jika ada
            if (voucher.max_discount && discount_amount > voucher.max_discount) {
                discount_amount = voucher.max_discount
            }
        } else {
            // FIXED discount
            discount_amount = voucher.discount
        }

        // Pastikan diskon tidak melebihi total harga
        if (discount_amount > total_price) {
            discount_amount = total_price
        }

        const final_price = total_price - discount_amount

        return NextResponse.json({
            valid: true,
            voucher_id: voucher.id,
            code: voucher.code,
            type: voucher.type,
            discount_value: voucher.discount,
            discount_amount: Math.round(discount_amount),
            original_price: total_price,
            final_price: Math.round(final_price),
            message: voucher.type === 'PERCENTAGE'
                ? `Diskon ${voucher.discount}% berhasil diterapkan!`
                : `Potongan Rp ${voucher.discount.toLocaleString()} berhasil diterapkan!`
        })

    } catch (error) {
        console.error('Error applying voucher:', error)
        return NextResponse.json({
            valid: false,
            error: 'Gagal memproses voucher'
        }, { status: 500 })
    }
}
