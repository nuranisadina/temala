import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteClientDemo() {
    console.log('Deleting Client Demo user...')

    try {
        const deleted = await prisma.user.deleteMany({
            where: { email: 'client@temala.com' }
        })

        console.log(`✅ Deleted ${deleted.count} user(s)`)
    } catch (error) {
        console.error('Error:', error)
    }

    await prisma.$disconnect()
}

deleteClientDemo()
