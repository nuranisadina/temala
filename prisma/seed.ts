import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Buat Role
    const adminRole = await prisma.role.upsert({
        where: { role_name: 'Admin' },
        update: {},
        create: { role_name: 'Admin' }
    })

    // Clean Roles
    await prisma.role.upsert({ where: { role_name: 'Kasir' }, update: {}, create: { role_name: 'Kasir' } })
    await prisma.role.upsert({ where: { role_name: 'Pelanggan' }, update: {}, create: { role_name: 'Pelanggan' } })

    console.log('Roles created.')

    // 2. Buat Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@temala.com' },
        update: { password: hashedPassword, role_id: adminRole.id },
        create: {
            name: 'Admin Temala',
            email: 'admin@temala.com',
            password:  hashedPassword,
            phone: '081234567890',
            role_id: adminRole.id
        }
    })

    // 2.1 Buat Kasir User
    const kasirRole = await prisma.role.findFirst({ where: { role_name: 'Kasir' } })
    if (kasirRole) {
        await prisma.user.upsert({
            where: { email: 'kasir@temala.com' },
            update: { password: hashedPassword, role_id: kasirRole.id },
            create: {
                name: 'Kasir Temala',
                email: 'kasir@temala.com',
                password: hashedPassword,
                phone: '080987654321',
                role_id: kasirRole.id
            }
        })
        console.log('Kasir user created: kasir@temala.com / admin123')
    }

    // 2.2 Buat Client/Pelanggan User
    const pelangganRole = await prisma.role.findFirst({ where: { role_name: 'Pelanggan' } })
    if (pelangganRole) {
        await prisma.user.upsert({
            where: { email: 'client@temala.com' },
            update: { password: hashedPassword, role_id: pelangganRole.id },
            create: {
                name: 'Client Demo',
                email: 'client@temala.com',
                password: hashedPassword,
                phone: '089876543210',
                role_id: pelangganRole.id
            }
        })
        console.log('Client user created: client@temala.com / admin123')
    }

    // 3. Buat MENU DUMMY
    const menus = [
        // Coffee
        { name: 'Kopi Susu Gula Aren', category: 'Coffee', price: 18000, stock: 50, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop', description: 'Kopi susu kekinian dengan gula aren asli.' },
        { name: 'Americano', category: 'Coffee', price: 15000, stock: 50, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop', description: 'Espresso dengan tambahan air panas.' },
        { name: 'Cappuccino', category: 'Coffee', price: 22000, stock: 40, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000&auto=format&fit=crop', description: 'Espresso dengan susu steamed dan foam tebal.' },

        // Non-Coffee
        { name: 'Matcha Latte', category: 'Non-coffee', price: 23000, stock: 30, image: 'https://images.unsplash.com/photo-1515825838458-f2a94b20105a?q=80&w=1000&auto=format&fit=crop', description: 'Minuman matcha hijau creamy.' },
        { name: 'Red Velvet Latte', category: 'Non-coffee', price: 23000, stock: 30, image: 'https://images.unsplash.com/photo-1616486029423-aaa478965c96?q=80&w=1000&auto=format&fit=crop', description: 'Rasa red velvet yang lembut dan manis.' },

        // Food
        { name: 'Nasi Goreng Spesial', category: 'Food', price: 25000, stock: 20, image: 'https://images.unsplash.com/photo-1603133872878-684f108fd118?q=80&w=1000&auto=format&fit=crop', description: 'Nasi goreng dengan telur dan ayam suwir.' },
        { name: 'Mie Goreng Jawa', category: 'Food', price: 22000, stock: 25, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=1000&auto=format&fit=crop', description: 'Mie goreng bumbu jawa yang kaya rempah.' },

        // Snack
        { name: 'Kentang Goreng', category: 'Snack', price: 15000, stock: 100, image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e06497?q=80&w=1000&auto=format&fit=crop', description: 'Kentang goreng renyah dengan saus sambal.' },
        { name: 'Roti Bakar Coklat Keju', category: 'Snack', price: 18000, stock: 50, image: 'https://images.unsplash.com/photo-1541592106381-b31e9674c0e5?q=80&w=1000&auto=format&fit=crop', description: 'Roti bakar topping melimpah.' }
    ]

    for (const menu of menus) {
        await prisma.menu.create({
            data: menu
        })
    }
    console.log('Dummy Menus created.')

    // 4. Buat EVENT DUMMY
    await prisma.event.create({
        data: {
            title: "Live Music Saturday",
            content: "Saksikan penampilan spesial band lokal setiap malam minggu pukul 19.00 WIB.",
            image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop"
        }
    })
    console.log('Dummy Events created.')

    // 5. Buat ORDER DUMMY (Opsional untuk tes dashboard)
    // Tidak wajib, tapi bagus untuk melihat chart

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
