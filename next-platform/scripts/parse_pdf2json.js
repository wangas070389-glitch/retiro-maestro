const fs = require('fs');
const PDFParser = require('pdf2json');

const filePath = 'C:\\Users\\z003puwx\\Desktop\\Antigravity_Projects\\retiro-maestro\\background\\ejemplo\\documentosInicio\\05NOV2025 MORALES-RODRIGUEZ-SULEMA YANETTE SiNDO.pdf';

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    const rawText = pdfParser.getRawTextContent();
    fs.writeFileSync('sulema_raw.txt', rawText);
    console.log("Written to sulema_raw.txt");
});

pdfParser.loadPDF(filePath);
