import { ConstanciaParser, WageMovement } from './constancia-parser';

export enum DocumentType {
    UNKNOWN = 'UNKNOWN',
    SINDO = 'SINDO',
    SISEC = 'SISEC'
}

export interface IngestedData {
    docType: DocumentType;
    weeks: number | null;
    salary_prom: number | null;
    age: number | null;
    nss: string | null;
    curp: string | null;
    dob: string | null;
    confidence: number;
    extracted_at: string;
    source_filename: string;
    lastBajaDate?: string | null;
    movements?: WageMovement[];
}

export class HeuristicParser {
    /**
     * Identifies weeks patterns in the extracted text.
     */
    static extractWeeks(text: string): number | null {
        // Try original direct match
        const standardMatch = text.match(/(?:Semanas Cotizadas|Total de semanas|Total de cotizaciones|Semanas Reconocidas):\s*([\d,]+)/i);
        if (standardMatch) return parseInt(standardMatch[1].replace(/,/g, ''));

        // Try the physical table format: SEMS. RECS. ... SAL.PROM. ... followed by numbers
        // pdfjs-dist replaces newlines with spaces, so we allow any whitespace `\s+`
        // The inner column S.C.31/12/90 might be entirely blank, so the middle number `(?:[\d,]+\s+)?` is optional.
        const tableMatch = text.match(/SEMS\.?\s*RECS\.?[\s\S]{1,150}?\b([\d,]{3,5})\s+(?:[\d,]+\s+)?\$\s*([\d,]+\.\d{2})/i);
        if (tableMatch) return parseInt(tableMatch[1].replace(/,/g, ''));

        return null;
    }

    /**
     * Identifies salary patterns.
     */
    static extractSalary(text: string): number | null {
        // Try original direct match
        const standardMatch = text.match(/(?:Salario Base|SBC|Salario Diario|Salario Promedio):\s*\$?\s*([\d,]+\.\d{2})/i);
        if (standardMatch) return parseFloat(standardMatch[1].replace(/,/g, ''));

        // Try physical table format (agnostic to spacing/newlines due to pdfjs-dist)
        const tableMatch = text.match(/SEMS\.?\s*RECS\.?[\s\S]{1,150}?\b[\d,]{3,5}\s+(?:[\d,]+\s+)?\$\s*([\d,]+\.\d{2})/i);
        if (tableMatch) return parseFloat(tableMatch[1].replace(/,/g, ''));

        return null;
    }

    /**
     * Identifies NSS patterns (11 digits).
     */
    static extractNSS(text: string): string | null {
        // Handle physical spacing anomalies: '4386653188   2' or '4386653188 - 2'
        const spacedMatch = text.match(/(?:NSS|Número de Seguridad Social|N\.S\.S\.?|NUM\.?\s*DE\s*SEG\.?\s*SOC\.?)\s*:?\s*(\d{10})\s*-?\s*(\d)/i);
        if (spacedMatch) return spacedMatch[1] + spacedMatch[2];

        // Standard contiguous or purely hyphenated e.g. 43-92-75-1693
        const strictMatch = text.match(/(?:NSS|Número de Seguridad Social|N\.S\.S\.?|NUM\.?\s*DE\s*SEG\.?\s*SOC\.?)\s*:?\s*([\d-]{11,14})/i);
        if (strictMatch) {
            const clean = strictMatch[1].replace(/-/g, '');
            if (clean.length === 11) return clean;
        }
        return null;
    }

    /**
     * Identifies CURP patterns (18 characters).
     */
    static extractCURP(text: string): string | null {
        const curpRegex = /(?:CURP|C\.U\.R\.P\.?)\s*:?\s*([A-Z]{4}\d{6}[A-Z]{6}[A-Z\d]\d)/i;
        const match = text.match(curpRegex);
        return match ? match[1] : null;
    }

    /**
     * Identifies Date of Birth patterns.
     */
    static extractDOB(text: string, curp?: string | null): string | null {
        const dobRegex = /(?:Fecha de Nacimiento|Nacido el|FEC\.NACIM\.)\s*:?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i;
        const match = text.match(dobRegex);
        if (match) return match[1];

        // Physical documents often leave explicit DOB blank, derive from CURP
        if (curp && curp.length >= 10) {
            const yy = curp.substring(4, 6);
            const mm = curp.substring(6, 8);
            const dd = curp.substring(8, 10);

            const yearNum = parseInt(yy);
            const fullYear = yearNum > 30 ? `19${yy}` : `20${yy}`;
            return `${dd}/${mm}/${fullYear}`;
        }
        return null;
    }

    static calculateAge(dobStr: string): number {
        const parts = dobStr.split(/[/-]/).map(Number);
        if (parts.length !== 3) return 0;
        const [day, month, year] = parts;
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    /**
     * Identifies the document type based on structural headers.
     */
    static identifyDocumentType(text: string): DocumentType {
        if (text.includes('S.I.N.D.O.') || text.includes('SC04G') || text.includes('Certificado de Derechos')) {
            return DocumentType.SINDO;
        }
        if (text.includes('Constancia de Semanas Cotizadas') || text.includes('HISTORIAL DE REGISTROS AFILIATORIOS')) {
            return DocumentType.SISEC;
        }
        return DocumentType.UNKNOWN;
    }

    /**
     * Runs the full heuristic suite on raw text.
     */
    static parse(text: string, filename: string): IngestedData {
        const docType = this.identifyDocumentType(text);
        const weeks = this.extractWeeks(text);
        const salary = this.extractSalary(text);
        const nss = this.extractNSS(text);
        const curp = this.extractCURP(text);
        const dob = this.extractDOB(text, curp);
        const age = dob ? this.calculateAge(dob) : null;

        let movements: WageMovement[] | undefined = undefined;
        if (docType === DocumentType.SISEC) {
            movements = ConstanciaParser.extractMovements(text);
        }

        // Weighted confidence scoring
        let score = 0;
        let totalPossible = 0;

        // Mandatory fields (Weighted 40% each)
        totalPossible += 0.4;
        if (weeks) score += 0.4;

        totalPossible += 0.4;
        if (salary || (movements && movements.length > 0)) score += 0.4;

        // Identity verification fields (Weighted 0.1% each)
        totalPossible += 0.1;
        if (nss) score += 0.1;

        totalPossible += 0.1;
        if (curp) score += 0.1;

        const confidence = score / totalPossible;

        return {
            docType,
            weeks,
            salary_prom: salary,
            age,
            nss,
            curp,
            dob,
            confidence,
            extracted_at: new Date().toISOString(),
            source_filename: filename,
            movements
        };
    }
}
