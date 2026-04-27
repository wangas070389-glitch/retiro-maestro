import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding B2B Golden Data: Asesores de Retiro Elite...");

    if (!process.env.SEED_USER_PASSWORD) {
        throw new Error("Missing SEED_USER_PASSWORD environment variable");
    }
    const hashedPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD, 10);

    const advisor = await prisma.user.upsert({
        where: { email: 'contacto@asesoreselite.com' },
        update: {},
        create: {
            email: 'contacto@asesoreselite.com',
            name: 'Lic. Laura Martínez',
            password: hashedPassword,
            tier: 'PRO',
            role: 'ADVISOR',
            isApproved: true,
            agencyName: 'Asesores de Retiro Elite',
            agencyPhone: '55 1234 5678',
            agencyLogoUrl: 'https://ui-avatars.com/api/?name=Asesores+Elite&background=4f46e5&color=fff&size=128&font-size=0.33&length=2'
        },
    });

    console.log("Advisor created. Advisor ID:", advisor.id);

    // Create 3 specific clients to show in the CRM
    
    // 1. A client ready to close (Closed Won)
    await prisma.client.create({
        data: {
            advisorId: advisor.id,
            name: "Roberto Gómez (Cerrado)",
            email: "roberto.gomez@example.com",
            phone: "55 9876 5432",
            status: "CONTRACTED",
            currentStage: "CLOSED_WIN",
            nextAction: "MEETING",
            nextActionAt: new Date(new Date().getTime() + 86400000), // Tomorrow
            closingNarrative: "Prospecto reaccionó positivamente al contraste Inercial vs M40. Firma programada para el viernes.",
            age: 62,
            currentWeeks: 1200,
            avgSalary: 15000
        }
    });

    // 2. A client in analyzing phase (Active prospect)
    await prisma.client.create({
        data: {
            advisorId: advisor.id,
            name: "Elena Suárez (En Análisis)",
            email: "elena.suarez@example.com",
            phone: "55 1122 3344",
            status: "SIMULATION_DONE",
            currentStage: "ANALYZING",
            nextAction: "FOLLOW_UP",
            nextActionAt: new Date(new Date().getTime() + (86400000 * 2)), 
            closingNarrative: "Pendiente de revisar el PDF oficial marca blanca con su familia.",
            age: 59,
            currentWeeks: 1800,
            avgSalary: 8000
        }
    });

    // 3. A new lead that just arrived
    await prisma.client.create({
        data: {
            advisorId: advisor.id,
            name: "Juan Pérez (Nuevo Lead B2C)",
            email: "juan.perez@example.com",
            phone: "55 5555 6666",
            status: "PROSPECT",
            currentStage: "PROSPECT",
            nextAction: "CALL",
            nextActionAt: new Date(), 
            closingNarrative: "Lead asignado desde el motor de sustracción B2C. Solicita asesoría urgente.",
            age: 60,
            currentWeeks: 950,
            avgSalary: 21000
        }
    });

    console.log("Clients injected successfully.");

    // Inject an Active B2C Lead waiting for Assignment
    // (This user wants an advisor)
    await prisma.user.upsert({
        where: { email: 'lead.solitario@retiromaestro.com' },
        update: {},
        create: {
            email: 'lead.solitario@retiromaestro.com',
            name: 'Martín (Buscando Asesor)',
            password: hashedPassword,
            tier: 'FREE',
            role: 'USER',
            isApproved: true,
            leadStatus: 'PENDING_LOCAL',
            residencyState: 'CDMX',
            age: 61,
            currentWeeks: 1000,
            avgSalary: 5000
        }
    });

    console.log("Active B2C lead injected.");
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
