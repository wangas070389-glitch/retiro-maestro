export interface VigenciaResult {
  hasRights: boolean;
  conservationWeeks: number;
  weeksElapsed: number;
  recoveryNeeded: boolean;
  expirationDate?: string;
  message: string;
  warning?: string; // High proximity warning (ADR-011)
}

export class VigenciaGuard {
  /**
   * Calculates if the user still holds their pension rights based on Art. 150
   * @param totalWeeks Number of weeks contributed to IMSS
   * @param terminationDate The date of their last formal termination (Baja)
   * @returns VigenciaResult details
   */
  public static checkRights(totalWeeks: number, terminationDate?: string | Date): VigenciaResult {
    // If no termination date is provided, we assume they are still actively working
    // or they haven't provided the info, so we optimismatically assume they have rights.
    if (!terminationDate) {
      return {
        hasRights: true,
        conservationWeeks: totalWeeks / 4,
        weeksElapsed: 0,
        recoveryNeeded: false,
        message: "No se proporcionó fecha de baja. Se asume vigencia activa."
      };
    }

    const tDate = new Date(terminationDate);
    const currentDate = new Date();
    
    // Time elapsed in milliseconds
    const elapsedMs = currentDate.getTime() - tDate.getTime();
    
    // Convert elapsed ms to weeks
    const weeksElapsed = elapsedMs / (1000 * 60 * 60 * 24 * 7);

    // Art 150: The conservation period is exactly 1/4 of total contributed weeks
    const conservationWeeks = totalWeeks / 4;
    
    const hasRights = weeksElapsed <= conservationWeeks;
    
    // Calculate expiration date
    const expirationDate = new Date(tDate.getTime() + (conservationWeeks * 7 * 24 * 60 * 60 * 1000));

    // If the elapsed weeks exceed the conservation window, they strictly need 52 weeks to recover
    if (!hasRights) {
      return {
        hasRights: false,
        conservationWeeks,
        weeksElapsed,
        recoveryNeeded: true,
        expirationDate: expirationDate.toISOString().split('T')[0],
        message: `ALERTA DE RIESGO: Ha superado el periodo de conservación de derechos (${Math.floor(conservationWeeks)} semanas). Su vigencia expiró el ${expirationDate.toLocaleDateString('es-MX')}. Debe cotizar 52 semanas con un patrón formal para reactivar sus derechos antes de solicitar la pensión o M40.`
      };
    }

    // They still have rights
    const result: VigenciaResult = {
      hasRights: true,
      conservationWeeks,
      weeksElapsed,
      recoveryNeeded: false,
      expirationDate: expirationDate.toISOString().split('T')[0],
      message: `Vigencia validada. Se encuentra dentro del periodo de conservación de derechos (vence el ${expirationDate.toLocaleDateString('es-MX')}).`
    };

    // ADR-011: Unified Proximity Warning (Gravity Well Fix)
    const proximityRatio = weeksElapsed / conservationWeeks;
    if (proximityRatio > 0.8) {
      result.warning = `ATENCIÓN: Está al ${(proximityRatio * 100).toFixed(0)}% de consumir su cuarta parte de conservación de derechos. Su último día para firmar contrato es ${expirationDate.toLocaleDateString('es-MX')}.`;
    }

    return result;
  }
}
