import fs from 'fs';
import { HeuristicParser } from '../src/lib/engine/ingestion/heuristic-parser';
import { SentinelAuditor } from '../src/lib/engine/ingestion/sentinel-auditor';

const filePath = 'C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\next-platform\\thelma_raw.txt';

async function main() {
    try {
        const rawText = fs.readFileSync(filePath, 'utf-8');

        console.log("=== HEURISTIC EXTRACTION ===");
        const parsed = HeuristicParser.parse(rawText, 'thelma.pdf');
        console.log(JSON.stringify(parsed, null, 2));

        console.log("\n=== SENTINEL AUDIT ===");
        const audit = SentinelAuditor.audit(parsed);
        console.log(JSON.stringify(audit, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
