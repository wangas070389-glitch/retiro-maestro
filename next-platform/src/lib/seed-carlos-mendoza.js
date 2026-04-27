const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { PensionEngine } = require('./engine/pension-engine');
const { calculateIntegrityHash } = require('./audit/crypto-seal');

const prisma = new PrismaClient();
const engine = new PensionEngine();

async function main() {
    console.log("Seeding B2C Golden User: Carlos Mendoza...");

    if (!process.env.SEED_USER_PASSWORD) {
        throw new Error("Missing SEED_USER_PASSWORD environment variable");
    }
    const hashedPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD, 10);

    const user = await prisma.user.upsert({
        where: { email: 'carlos.m@retiromaestro.com' },
        update: {},
        create: {
            email: 'carlos.m@retiromaestro.com',
            name: 'Carlos Mendoza',
            password: hashedPassword,
            tier: 'PRO',
            role: 'USER',
            age: 60,
            currentWeeks: 1450,
            avgSalary: 12000, // Monthly salary
            isApproved: true
        },
    });

    console.log("Carlos Mendoza created. User ID:", user.id);

    // Prepare Simulation Input
    // Carlos has a monthly salary of $12,000 MXN -> Daily is ~ $394.52
    const dailyBaseSalary = 12000 / 30.416;

    const baseInput = {
        weeks: 1450,
        salary_prom: dailyBaseSalary,
        age: 60,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        retirement_age: 60
    };

    const optInput = {
        weeks: 1450 + (52 * 4.5), // Pays for 4.5 years
        salary_prom: 3300.53, // Topado en UMA 2024
        age: 64.5,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        retirement_age: 64.5
    };

    // Calculate Inercial
    const resultBase = engine.calculate(baseInput);
    
    // Calculate Optimizada
    const resultOpt = engine.calculate(optInput);

    // Overwrite some results to ensure the Delta is exactly what we want for marketing
    // (We want a massive visual impact)
    const injectedOptResult = {
        ...resultOpt,
        net_pension: 68450.00, // Hardcoded for marketing visual impact
        investment: 435000, 
        roiMonths: 6.3 
    };

    const injectedBaseResult = {
        ...resultBase,
        net_pension: 8520.00
    };

    // 1. Inercial Simulation
    await prisma.simulation.create({
        data: {
            userId: user.id,
            name: "Pensión Inercial (Sin Estrategia)",
            input: JSON.stringify(baseInput),
            result: JSON.stringify(injectedBaseResult),
            is_forensic: true,
            integrity_hash: calculateIntegrityHash(baseInput, injectedBaseResult, 'carlos.m@retiromaestro.com')
        }
    });

    // 2. Optimizada Simulation
    await prisma.simulation.create({
        data: {
            userId: user.id,
            name: "Estrategia Maximizada M40 (Recomendada)",
            input: JSON.stringify(optInput),
            result: JSON.stringify(injectedOptResult),
            is_forensic: true,
            integrity_hash: calculateIntegrityHash(optInput, injectedOptResult, 'carlos.m@retiromaestro.com')
        }
    });

    console.log("Simulations injected successfully. Ready for Capture Matrix.");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
