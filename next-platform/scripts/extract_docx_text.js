const mammoth = require("mammoth");
const fs = require("fs");

async function extractText(filein, fileout) {
    try {
        const result = await mammoth.extractRawText({ path: filein });
        fs.writeFileSync(fileout, result.value);
        console.log(`Extracted raw text to ${fileout}`);
    } catch (e) {
        console.error(e);
    }
}

extractText(
    "C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\background\\ejemplo\\reporte-final-propuestas\\propuesta de pension GALLEGOS AGUIÑAGA THELMA ALICIA.docx",
    "thelma_pure_text.txt"
);
extractText(
    "C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\background\\ejemplo\\reporte-final-propuestas\\estudio de pension con modalidad 10 MORALES RODRIGUEZ SULEMA YANETTE.docx",
    "sulema_pure_text.txt"
);
