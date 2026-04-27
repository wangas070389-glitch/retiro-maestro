
const { PrismaClient } = require('@prisma/client')
// const bcrypt = require('bcryptjs') // We'll mock the hash if bcrypt is tricky in seed without ts-node
// Actually, let's just use a known hash for "admin123" to avoid dependency issues in raw node script if possible.
// Or just require it.

const prisma = new PrismaClient()

async function main() {
    // Hash for 'admin123'
    // $2a$10$fV.. (example)
    // Let's use a simple hash generator or just trust bcrypt is available since it's in dependencies.

    // Imma try to use standard import if I can run it with node. 
    // If not, I'll use a pre-calculated hash.
    // Pre-calculated hash for "admin123" with 10 rounds:
    const passwordHash = "$2a$10$Pc.5.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0" // Just kidding, let's use the lib.

    // Real hash for 'admin123' generated via online tool or previous knowledge:
    // $2a$10$YourHashHere

    // Actually, I'll just write a script that uses the installed bcryptjs

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@retiromaestro.com' },
        update: {},
        create: {
            email: 'admin@retiromaestro.com',
            name: 'Admin User',
            password: hashedPassword,
        },
    })

    const sovereign = await prisma.user.upsert({
        where: { email: 'sovereign@retiromaestro.com' },
        update: {},
        create: {
            email: 'sovereign@retiromaestro.com',
            name: 'Sovereign Citizen',
            password: await bcrypt.hash('Freedom123!', 10),
        }
    })

    console.log({ admin, sovereign })
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
