const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Sovereign Unlocker Script ---");
  const result = await prisma.user.updateMany({
    where: {
      leadStatus: {
        in: ["PENDING_INTERNAL", "PENDING_LOCAL", "PENDING_NATIONAL"]
      }
    },
    data: {
      leadStatus: "NONE",
      slaExpiresAt: null
    }
  });
  console.log(`Successfully unlocked ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
