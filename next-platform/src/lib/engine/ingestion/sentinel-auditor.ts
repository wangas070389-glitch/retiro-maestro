import anchors from '../../data/legal-anchors.json';
import { IngestedData } from './heuristic-parser';

export interface AuditReport {
    is_valid: boolean;
    score: number;
    flags: string[];
    recommendations: string[];
}

export class SentinelAuditor {
    /**
     * Performs a multi-point audit on ingested data against legal and physical constraints.
     * Implements Protocol 17 (Sentinel) and MATH-003.
     */
    static audit(data: IngestedData): AuditReport {
        const flags: string[] = [];
        const recommendations: string[] = [];
        let score = data.confidence * 0.4; // Start with parser confidence (weighted)
        let age = data.age;

        // 0. Age Derivation & DOB Verification
        if (data.dob) {
            const birthDate = new Date(data.dob.split(/[/-]/).reverse().join('-'));
            const today = new Date();
            let derivedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                derivedAge--;
            }

            if (!age) {
                age = derivedAge;
                recommendations.push(`Derivando edad (${age} años) desde fecha de nacimiento.`);
            } else if (Math.abs(age - derivedAge) > 1) {
                flags.push('CRITICAL: Age/DOB Mismatch');
                recommendations.push(`La edad proporcionada (${age}) no coincide con el DOB (${data.dob}).`);
                score -= 0.3;
            }
        }

        // 1. NSS Forensic Check (Protocol 17)
        if (data.nss && data.dob) {
            const nssYear = parseInt(data.nss.substring(2, 4));
            const birthYearSub = parseInt(data.dob.substring(8, 10)); // DD/MM/YYYY

            // NSS Year (registration) cannot be before Birth Year
            // Note: This is an approximation since birthYearSub is 2 digits
            if (nssYear < birthYearSub && nssYear > 40) { // Simple heuristic for Ley 73
                flags.push('CRITICAL: NSS/DOB Temporal Conflict');
                recommendations.push(`NSS registrado en '${nssYear} parece anterior al año de nacimiento.`);
                score -= 0.2;
            }
        }

        // 2. Temporal Consistency Check (MATH-003 Section 1)
        if (data.weeks && age) {
            const maxPossibleWeeks = (age - 14) * 52.14;
            if (data.weeks > maxPossibleWeeks) {
                flags.push('CRITICAL: Temporal Impossibility');
                recommendations.push(`Semanas (${data.weeks}) exceden el máximo físico para la edad ${age}. Verifique documentos.`);
                score -= 0.4;
            } else {
                score += 0.3;
            }
        }

        // 3. Salary Anchor Validation (MATH-003 Section 2)
        if (data.salary_prom) {
            const smdf = anchors.smdf_2026;
            const maxSalary = anchors.uma_2026 * 25;

            if (data.salary_prom < smdf) {
                flags.push('WARNING: Salario sub-mínimo');
                recommendations.push(`El salario $${data.salary_prom} es menor al SMDF 2026 ($${smdf}).`);
                score -= 0.1;
            } else if (data.salary_prom > maxSalary) {
                flags.push('WARNING: Tope Salarial');
                recommendations.push(`El salario $${data.salary_prom} excede el tope de 25 UMAs ($${maxSalary.toFixed(2)}).`);
                score -= 0.1;
            } else {
                score += 0.3;
            }
        }

        // 4. Identity Flags
        if (!data.nss) flags.push('MISSING: NSS (Requerido para validación forense)');
        if (!data.curp) flags.push('MISSING: CURP');

        // Final result
        return {
            is_valid: score >= 0.65,
            score: Math.max(0, Math.min(1, score)),
            flags,
            recommendations
        };
    }
}
