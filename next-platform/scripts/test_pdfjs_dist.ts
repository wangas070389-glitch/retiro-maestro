import fs from 'fs';
import { HeuristicParser } from '../src/lib/engine/ingestion/heuristic-parser';

const filePath = 'C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\next-platform\\sulema_raw.txt';

async function main() {
    try {
        const rawText = fs.readFileSync(filePath, 'utf-8');
        // Simulate pdfjs-dist behavior by squashing all whitespace into single spaces
        const pdfjsText = rawText.replace(/\s+/g, ' ');

        console.log("=== HEURISTIC EXTRACTION ON CONTINUOUS TEXT ===");
        const parsed = HeuristicParser.parse(pdfjsText, 'sulema.pdf');
        fs.writeFileSync('sulema_result.json', JSON.stringify(parsed, null, 2));
        console.log("Written to sulema_result.json");
    } catch (e) {
        console.error(e);
    }
}

main();
