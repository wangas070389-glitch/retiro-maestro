import { HeuristicParser } from '../src/lib/engine/ingestion/heuristic-parser';
import { SentinelAuditor } from '../src/lib/engine/ingestion/sentinel-auditor';

const sampleTexts = [
    {
        name: "Standard Constance",
        text: `
            Instituto Mexicano del Seguro Social
            CERTIFICADO DE SEMANAS COTIZADAS
            Nombre: Juan Perez
            NSS: 12856512345
            CURP: PEJU650101HMZRRR01
            Semanas Reconocidas: 1450
            Salario Base: $1,250.75
            Fecha de Nacimiento: 01/01/1965
        `
    },
    {
        name: "Conflicting Age/DOB",
        text: `
            Semanas Cotizadas: 500
            SBC: $500.00
            NSS: 01907012345
            Fecha de Nacimiento: 15/05/1970
        `,
        manualAge: 60 // This should conflict with 1970 birth year (in 2026)
    },
    {
        name: "Temporal Impossibility",
        text: `
            NSS: 12806012345
            Semanas Reconocidas: 2500
            Salario Promedio: $1,000.00
            Fecha de Nacimiento: 10/10/1980
        `
    }
];

async function runVerification() {
    console.log("=== INGESTION HARDENING VERIFICATION ===\n");

    for (const sample of sampleTexts) {
        console.log(`--- Testing: ${sample.name} ---`);
        const parsed = HeuristicParser.parse(sample.text, "test.pdf");

        // Manual age injection for conflict testing
        if (sample.manualAge) {
            parsed.age = sample.manualAge;
        }

        const audit = SentinelAuditor.audit(parsed);

        console.log(`Parsed Weeks: ${parsed.weeks}`);
        console.log(`Parsed Salary: ${parsed.salary_prom}`);
        console.log(`Parsed NSS: ${parsed.nss}`);
        console.log(`Parsed CURP: ${parsed.curp}`);
        console.log(`Parsed DOB: ${parsed.dob}`);
        console.log(`Confidence: ${(parsed.confidence * 100).toFixed(1)}%`);
        console.log(`Audit Score: ${(audit.score * 100).toFixed(1)}%`);
        console.log(`Audit Valid: ${audit.is_valid}`);

        if (audit.flags.length > 0) {
            console.log("Flags:");
            audit.flags.forEach(f => console.log(`  [!] ${f}`));
        }

        if (audit.recommendations.length > 0) {
            console.log("Recommendations:");
            audit.recommendations.forEach(r => console.log(`  [-] ${r}`));
        }
        console.log("\n");
    }
}

runVerification().catch(console.error);
