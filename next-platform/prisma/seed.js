import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("=== INICIANDO SECUENCIA DE SEED ACTUARIAL (THE ORACLE INCEPTION) ===");

    const seedPassword = process.env.SEED_USER_PASSWORD;
    if (!seedPassword) {
        throw new Error("ERROR CRÍTICO: La variable de entorno SEED_USER_PASSWORD no está definida. Se requiere para sembrar credenciales seguras.");
    }

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || (seedPassword + "_admin");
    const sovereignPassword = process.env.SEED_SOVEREIGN_PASSWORD || (seedPassword + "_sovereign");
    const esencialPassword = process.env.SEED_ESENCIAL_PASSWORD || (seedPassword + "_esencial");
    const maestroPassword = process.env.SEED_MAESTRO_PASSWORD || (seedPassword + "_maestro");

    const hashedAdmin = await bcrypt.hash(adminPassword, 10);
    const hashedSovereign = await bcrypt.hash(sovereignPassword, 10);
    const hashedEsencial = await bcrypt.hash(esencialPassword, 10);
    const hashedMaestro = await bcrypt.hash(maestroPassword, 10);

    // 1. Seed System Admins & Sovereign Roles
    const admin = await prisma.user.upsert({
        where: { email: 'admin@retiromaestro.com' },
        update: {
            role: 'ADMIN',
            tier: 'SOVEREIGN',
            isApproved: true,
            password: hashedAdmin,
        },
        create: {
            email: 'admin@retiromaestro.com',
            name: 'Admin User',
            password: hashedAdmin,
            role: 'ADMIN',
            tier: 'SOVEREIGN',
            isApproved: true,
        },
    });

    const sovereign = await prisma.user.upsert({
        where: { email: 'sovereign@retiromaestro.com' },
        update: {
            isApproved: true,
            password: hashedSovereign,
        },
        create: {
            email: 'sovereign@retiromaestro.com',
            name: 'Sovereign Citizen',
            password: hashedSovereign,
            isApproved: true,
        }
    });

    // 2. Seed Core Membership Roles (ESENCIAL & MAESTRO)
    const esencialUser = await prisma.user.upsert({
        where: { email: 'esencial@retiromaestro.com' },
        update: {
            tier: 'ESENCIAL',
            role: 'USER',
            isApproved: true,
            password: hashedEsencial
        },
        create: {
            email: 'esencial@retiromaestro.com',
            name: 'Cliente Esencial',
            tier: 'ESENCIAL',
            role: 'USER',
            isApproved: true,
            password: hashedEsencial
        }
    });

    const maestroUser = await prisma.user.upsert({
        where: { email: 'maestro@retiromaestro.com' },
        update: {
            tier: 'MAESTRO',
            role: 'USER',
            isApproved: true,
            password: hashedMaestro
        },
        create: {
            email: 'maestro@retiromaestro.com',
            name: 'Cliente Maestro',
            tier: 'MAESTRO',
            role: 'USER',
            isApproved: true,
            password: hashedMaestro
        }
    });

    // 3. Seed 2020-2030 UMA Value Arrays (EconomicAnchor)
    const anchors = [
        { year: 2020, uma: 86.88, inpc: 109.27, smdf: 123.22, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2021, uma: 89.62, inpc: 113.11, smdf: 141.70, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2022, uma: 96.22, inpc: 120.25, smdf: 172.87, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2023, uma: 103.74, inpc: 128.50, smdf: 207.44, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2024, uma: 108.57, inpc: 133.45, smdf: 248.93, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2025, uma: 113.14, inpc: 138.20, smdf: 278.80, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2026, uma: 117.31, inpc: 142.10, smdf: 315.04, source: "DOF/INEGI Official Bulletin (Local Sync)" },
        { year: 2027, uma: 122.38, inpc: 146.50, smdf: 330.79, source: "Estimated Projection (Proyección Estimada)" },
        { year: 2028, uma: 127.28, inpc: 151.00, smdf: 347.33, source: "Estimated Projection (Proyección Estimada)" },
        { year: 2029, uma: 132.37, inpc: 155.60, smdf: 364.70, source: "Estimated Projection (Proyección Estimada)" },
        { year: 2030, uma: 137.66, inpc: 160.30, smdf: 382.94, source: "Estimated Projection (Proyección Estimada)" },
    ];

    console.log("Seeding UMA & INPC arrays (2020-2030)...");
    for (const anchor of anchors) {
        await prisma.economicAnchor.upsert({
            where: {
                year_source: {
                    year: anchor.year,
                    source: anchor.source
                }
            },
            update: {
                uma: anchor.uma,
                inpc: anchor.inpc,
                smdf: anchor.smdf,
                is_verified: true,
                signature: `SIG_ORACLE_SEED_${anchor.year}`
            },
            create: {
                year: anchor.year,
                uma: anchor.uma,
                inpc: anchor.inpc,
                smdf: anchor.smdf,
                source: anchor.source,
                is_verified: true,
                signature: `SIG_ORACLE_SEED_${anchor.year}`
            }
        });
    }

    console.log("Actuarial seeds completed successfully!");
    console.log({ admin, sovereign, esencialUser, maestroUser });
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
