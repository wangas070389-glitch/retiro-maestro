export interface WageMovement {
    employer: string;
    type: string;
    date: string;
    dailyWage: number;
}

export class ConstanciaParser {
    /**
     * Extracts movement history from raw Sisec text.
     * Pattern:
     * Nombre del patrón: [NAME]
     * Registro Patronal: [ID]
     * ...
     * Tipo de movimiento | Fecha de movimiento | Salario Base
     * [TYPE] | [DATE] | $ [WAGE]
     */
    static extractMovements(text: string): WageMovement[] {
        const movements: WageMovement[] = [];
        
        // Split by "Nombre del patrón:" to isolate employer blocks
        const blocks = text.split(/Nombre del patr贸n:|Nombre del patrón:/i);
        
        // Skip the first block as it's usually header info
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            
            // Extract Employer Name (usually starts immediately after the anchor)
            const nameMatch = block.match(/^\s*([^:\n|]+)/);
            const employerName = nameMatch ? nameMatch[1].trim() : 'UNKNOWN';
            
            // Find all movement rows in this block
            // Regex handles: REINGRESO | 01/02/2025 | $ 2828.5
            // Note: pdf.js might join lines with spaces, so we use \s+ 
            const rowRegex = /(REINGRESO|BAJA|MODIFICACION DE SALARIO|ALTA)\s*\|?\s*(\d{2}\/\d{2}\/\d{4})\s*\|?\s*\$\s*([\d,]+\.\d{2})/gi;
            
            let match;
            while ((match = rowRegex.exec(block)) !== null) {
                movements.push({
                    employer: employerName,
                    type: match[1],
                    date: match[2],
                    dailyWage: parseFloat(match[3].replace(/,/g, ''))
                });
            }
        }

        // Sort by date descending (standard IMSS presentation)
        return movements.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
        });
    }
}
