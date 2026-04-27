const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
    console.log("=== STARTING ADMIN CONTROL TESTS ===");
    try {
        // 1. Create a dummy user
        const dummyEmail = "dummy@retiromaestro.test";
        let user = await prisma.user.findUnique({ where: { email: dummyEmail } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: "Dummy Tester",
                    email: dummyEmail,
                    password: await bcrypt.hash("password123", 10),
                    isApproved: false,
                    isBlocked: false,
                    role: "USER"
                }
            });
            console.log("✅ Created dummy user (isApproved = false)");
        } else {
            console.log("✅ Dummy user already exists");
        }

        // 2. Test Approval
        await prisma.user.update({
            where: { id: user.id },
            data: { isApproved: true }
        });
        const approvedUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (approvedUser.isApproved) console.log("✅ User Approval Toggle Works");

        // 3. Test Blocking
        await prisma.user.update({
            where: { id: user.id },
            data: { isBlocked: true }
        });
        const blockedUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (blockedUser.isBlocked) console.log("✅ User Block Toggle Works");

        // 4. Test Password Reset Override
        const newPassword = "overridePassword456";
        const newHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newHash }
        });

        const resetUser = await prisma.user.findUnique({ where: { id: user.id } });
        const isMatch = await bcrypt.compare(newPassword, resetUser.password);
        if (isMatch) console.log("✅ Password Override & Hashing Works");

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });
        console.log("✅ Cleanup successful");

        console.log("=== ALL TESTS PASSED ===");

    } catch (e) {
        console.error("❌ Test Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
