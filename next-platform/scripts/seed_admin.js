const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
    console.log("=== INICIANDO SEED DE ADMINISTRADOR SOBERANO ===");

    const adminEmail = "admin@retiromaestro.com";
    const adminPasswordPlain = "Soberano2026"; // Default temporary password

    try {
        const hashedPassword = await bcrypt.hash(adminPasswordPlain, 10);

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log(`[!] El usuario ${adminEmail} ya existe. Actualizando credenciales y permisos...`);
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    password: hashedPassword,
                    role: "ADMIN",
                    tier: "SOVEREIGN",
                    name: "Admin Soberano",
                    isApproved: true,
                    isBlocked: false
                }
            });
            console.log("✅ Permisos de Administrador y contraseña restaurados.");
        } else {
            console.log(`[+] Creando nuevo usuario administrador: ${adminEmail}...`);
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    role: "ADMIN",
                    tier: "SOVEREIGN",
                    name: "Admin Soberano",
                    isApproved: true,
                    isBlocked: false
                }
            });
            console.log("✅ Cuenta Administrador creada exitosamente.");
        }

        console.log("\n==============================================");
        console.log("  CREDENCIALES DE ACCESO (SUPER TABLERO)      ");
        console.log("==============================================");
        console.log(`  Email:    ${adminEmail}`);
        console.log(`  Password: ${adminPasswordPlain}`);
        console.log("==============================================\n");

    } catch (error) {
        console.error("❌ Error durante el seeding del administrador:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
