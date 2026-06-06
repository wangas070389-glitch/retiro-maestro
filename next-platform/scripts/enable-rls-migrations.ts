import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    console.log("Enabling Row Level Security (RLS) on system table '_prisma_migrations'...");
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;');
        console.log("✅ RLS successfully enabled on '_prisma_migrations' table!");
    } catch (error) {
        console.error("❌ Failed to enable RLS on '_prisma_migrations':", error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
