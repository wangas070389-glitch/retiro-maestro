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

       // 1. Calcular la cuarta parte de las semanas (Período de Conservación)
       const semanasGracia = Math.floor(weeks / 4);

       // 2. Extraer la fecha de expiración sumando semanas a la fecha de baja
       const fechaBaja = new Date(lastTerminationDate);
       const fechaVencimiento = new Date(fechaBaja.getTime() + (semanasGracia * 7 * 24 * 60 * 60 * 1000));
       const today = new Date();

       // 3. Evaluar vigencia
       const msRestantes = fechaVencimiento.getTime() - today.getTime();
       const isVigente = msRestantes >= 0;
       const diasRestantes = Math.max(0, Math.floor(msRestantes / (1000 * 60 * 60 * 24)));

       if (isVigente) {
            return {
                isVigente: true,
                semanasGracia,
                fechaVencimientoGracia: fechaVencimiento,
                diasRestantesGracia: diasRestantes,
                mensaje: `Derechos Vigentes. Caducidad en ${diasRestantes} días (Ref: Ley 73 Art. 150).`
            }
       } else {
            return {
                isVigente: false,
                semanasGracia,
                fechaVencimientoGracia: fechaVencimiento,
                diasRestantesGracia: 0,
                mensaje: "Riesgo Crítico: Derechos Vencidos. El cliente requiere reactivación laboral inmediata de 52 semanas."
            }
       }
    }
}
