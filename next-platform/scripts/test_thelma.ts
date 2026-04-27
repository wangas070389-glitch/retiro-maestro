import fs from 'fs';
import pdfParse from 'pdf-parse';
import { HeuristicParser } from '../src/lib/engine/ingestion/heuristic-parser';
import { SentinelAuditor } from '../src/lib/engine/ingestion/sentinel-auditor';

const filePath = 'C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\background\\ejemplo\\documentosInicio\\19ene2026 GALLEGOS AGUI#AGA THELMA ALICIA Sindo.pdf';

async function main() {
    try {
        console.log(`Loading: ${filePath}`);
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);

        console.log("\n=== RAW TEXT FRAGMENT (FIRST 1000 CHARS) ===");
        console.log(data.text.substring(0, 1000));
        console.log("============================================");

        const parsed = HeuristicParser.parse(data.text, 'thelma.pdf');
        const audit = SentinelAuditor.audit(parsed);

        console.log("\n=== HEURISTIC EXTRACTION ===");
        console.log(JSON.stringify(parsed, null, 2));

        console.log("\n=== SENTINEL AUDIT ===");
        console.log(JSON.stringify(audit, null, 2));
    } catch (error) {
        console.error("Error reading PDF:", error);
    }
}

main();
