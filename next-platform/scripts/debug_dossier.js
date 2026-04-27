const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const s1 = await prisma.simulation.findFirst({ orderBy: { createdAt: 'desc' }, where: { name: { contains: 'CUSTOM' } } });
    console.log('CUSTOM result:', s1 ? s1.result : null);

    const s2 = await prisma.simulation.findFirst({ orderBy: { createdAt: 'desc' }, where: { name: { contains: 'OPTIMIZADA' } } });
    console.log('OPTIMIZADA result:', s2 ? s2.result : null);
}

main().catch(console.error).finally(() => prisma.$disconnect());
