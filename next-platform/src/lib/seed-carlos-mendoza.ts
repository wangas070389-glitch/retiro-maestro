import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
            avgSalary: 12000, 
            isApproved: true
        },
    });

    console.log("Carlos Mendoza created. User ID:", user.id);

    const baseInput = {
        weeks: 1450,
        salary_prom: 394.52,
        age: 60,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        retirement_age: 60
    };

    const optInput = {
        weeks: 1684, 
        salary_prom: 3300.53, 
        age: 64.5,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        retirement_age: 64.5
    };

    const injectedOptResult = {
        daily_base_cuantia: 429.07,
        annual_base_cuantia: 156610.18,
        excess_years: 23,
        annual_increment_total: 677461.355,
        adjusted_by_age: 834071.535,
        allowances: {
            wife: 0.15,
            children: 0,
            parents: 0,
            solitude: 0,
            total_percentage: 0.15
        },
        total_annual: 959182.26525,
        total_monthly: 79931.85, 
        with_decree_111: 88724.36, 
        with_inflation: 88724.36,
        age_penalty: 100,
        capped_salary: 3300.53,
        tax_retained: 1500,
        net_pension: 68450.00, 
        investment: 435000, 
        roiMonths: 6.3 
    };

    const injectedBaseResult = {
        daily_base_cuantia: 51.28,
        annual_base_cuantia: 18719.98,
        excess_years: 19,
        annual_increment_total: 41804.83,
        adjusted_by_age: 45393.61,
        allowances: {
            wife: 0.15,
            children: 0,
            parents: 0,
            solitude: 0,
            total_percentage: 0.15
        },
        total_annual: 52202.65,
        total_monthly: 4350.22,
        with_decree_111: 4828.74,
        with_inflation: 4828.74,
        age_penalty: 75,
        capped_salary: 394.52,
        tax_retained: 0,
        net_pension: 8520.00 
    };

    await prisma.simulation.create({
        data: {
            userId: user.id,
            name: "Pensión Inercial (Sin Estrategia)",
            input: JSON.stringify(baseInput),
            result: JSON.stringify(injectedBaseResult),
            is_forensic: true,
            integrity_hash: "HSH-INERCIAL-TEST-123"
        }
    });

    await prisma.simulation.create({
        data: {
            userId: user.id,
            name: "Estrategia PROM CUSTOM",
            input: JSON.stringify(optInput),
            result: JSON.stringify(injectedOptResult),
            is_forensic: true,
            integrity_hash: "HSH-OPTIMIZADA-TEST-123"
        }
    });

    console.log("Simulations injected successfully.");
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
