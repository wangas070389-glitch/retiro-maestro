import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.user.updateMany({
        where: { email: 'sov@retiro.com' },
        data: { role: 'ADMIN' },
    });
    console.log('User sov@retiro.com elevated to ADMIN.');
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
