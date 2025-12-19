import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUser() {
    console.log('Checking client user...')

    const client = await prisma.user.findUnique({
        where: { email: 'client@temala.com' },
        include: { role: true }
    })

    if (client) {
        console.log('✅ Client user found:')
        console.log(`   ID: ${client.id}`)
        console.log(`   Name: ${client.name}`)
        console.log(`   Email: ${client.email}`)
        console.log(`   Role: ${client.role.role_name}`)
        console.log(`   Phone: ${client.phone}`)

        // Test password
        const isPasswordCorrect = await bcrypt.compare('client123', client.password)
        console.log(`   Password 'client123': ${isPasswordCorrect ? '✅ CORRECT' : '❌ WRONG'}`)

        // Also test with 'admin123' in case it's using same password
        const isAdminPassword = await bcrypt.compare('admin123', client.password)
        console.log(`   Password 'admin123': ${isAdminPassword ? '✅ CORRECT' : '❌ WRONG'}`)
    } else {
        console.log('❌ Client user NOT FOUND')
        console.log('Need to run: npx prisma db seed')
    }

    await prisma.$disconnect()
}

checkUser()
