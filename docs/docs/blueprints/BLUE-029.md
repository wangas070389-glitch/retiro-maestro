# BLUE-029: Flujo de Datos del Calendario de Pagos Inteligente

## 1. Esquema de Integración

Este blueprint detalla cómo los datos viajan desde la simulación almacenada hasta la interfaz de usuario en el módulo de "Autoridad", permitiendo el cálculo dinámico mes a mes.

```mermaid
graph TD
    A[Sovereign Dossier DB] -->|fetch(userId)| B[SavedSimulations]
    B -->|filtro: M40| C[Última Estrategia TOP]
    C -->|extrae SBC Diario| D[m40-calculator.ts]
    
    E[Fecha Actual] --> D
    F[legal-anchors.json o DB] -->|porcentajes anuales| D
    
    D -->|calcula dias x mes x %| G[Array de Pagos Mensuales]
    G -->|renderiza| H[Calendario de Pagos UI]
    H -->|Alerta Visual| I[Sube cuota en Febrero]
```

## 2. Mapa de Propiedades (m40-calculator)

La función core `calculateMonthlyM40Payment` toma:
- `dailySalary`: Número (ej. $3,000.00)
- `year`: Número (ej. 2026)
- `month`: Número (1-12)

**Output esperado:**
```typescript
{
   monthName: string,   // "Febrero"
   year: number,        // 2026
   daysInMonth: number, // 28
   rateApplied: number, // 14.438%
   paymentMxn: number,  // $12,127.92
   isUmaAdjustmentMonth: boolean // true si month === 2
}
```

## 3. Consideraciones de Caché
Dado que la proyección de pagos de M40 es altamente determinista (solo cambia si el usuario modifica su registro de salario en el IMSS), los resultados de los próximos meses deben calcularse de forma idempotente en el front-end cada vez que se carga el componente, usando el `dailySalary` almacenado sin necesidad de llamadas excesivas a red.
