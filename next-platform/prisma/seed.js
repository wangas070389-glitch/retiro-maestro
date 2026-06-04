import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@retiromaestro.com' },
        update: {
            role: 'ADMIN',
            isApproved: true,
            password: hashedPassword,
        },
        create: {
            email: 'admin@retiromaestro.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            isApproved: true,
        },
    });

    const sovereign = await prisma.user.upsert({
        where: { email: 'sovereign@retiromaestro.com' },
        update: {
            isApproved: true,
            password: await bcrypt.hash('Freedom123!', 10),
        },
        create: {
            email: 'sovereign@retiromaestro.com',
            name: 'Sovereign Citizen',
            password: await bcrypt.hash('Freedom123!', 10),
            isApproved: true,
        }
    });

    console.log({ admin, sovereign });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
