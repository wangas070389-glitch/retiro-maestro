const fs = require('fs');
const pdfParse = require('pdf-parse');
const parse = pdfParse.default || pdfParse;


const filePath = 'C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\background\\ejemplo\\documentosInicio\\19ene2026 GALLEGOS AGUI#AGA THELMA ALICIA Sindo.pdf';

async function main() {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await parse(dataBuffer);
        console.log(data.text);
    } catch (e) {
        console.error(e);
    }
}
main();
