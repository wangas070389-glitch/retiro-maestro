import { VigenciaGuard } from './vigencia-guard.ts';

export interface PeriodoGraciaStatus {
    isVigente: boolean;
    semanasGracia: number;
    fechaVencimientoGracia: Date | null;
    diasRestantesGracia?: number;
    mensaje: string;
}

export class Art150LegalGuard {
    /**
     * Valida la conservación de derechos basada en el Artículo 150 de la Ley del Seguro Social de 1973.
     * Los asegurados que dejen de pertenecer al régimen obligatorio conservarán los derechos que 
     * tuvieran adquiridos por un período igual a la cuarta parte del tiempo cubierto por sus cotizaciones 
     * semanales.
     * 
     * @param weeks - Total de semanas cotizadas reconocidas por el IMSS.
     * @param lastTerminationDate - Fecha de Baja formal del IMSS (formato ISO/Date).
     * @returns PeriodoGraciaStatus
     */
    public static validateConservation(weeks: number, lastTerminationDate?: string | Date | null): PeriodoGraciaStatus {
        if (!lastTerminationDate) {
            return {
                isVigente: true,
                semanasGracia: 0,
                fechaVencimientoGracia: null,
                mensaje: "Activo / Sin fecha de baja registrada."
            };
        }

        const res = VigenciaGuard.checkRights(weeks, lastTerminationDate);
        const diasRestantes = res.expirationDate 
            ? Math.max(0, Math.floor((new Date(res.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

        return {
            isVigente: res.hasRights,
            semanasGracia: res.conservationWeeks,
            fechaVencimientoGracia: res.expirationDate ? new Date(res.expirationDate) : null,
            diasRestantesGracia: diasRestantes,
            mensaje: res.hasRights
                ? `Derechos Vigentes. Caducidad en ${diasRestantes} días (Ref: Ley 73 Art. 150).`
                : "Riesgo Crítico: Derechos Vencidos. El cliente requiere reactivación laboral inmediata de 52 semanas."
        };
    }
}
