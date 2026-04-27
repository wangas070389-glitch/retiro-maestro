# POST-007: [Preventive] Fuga de Efectivo en Estimaciones con 'Book-Value' de 30.4 Días

## Incidente (Prevenido)
Uso generalizado en el sistema base de la constante actuarial de `30.416` días (o peor aún, un flat `30` días) para calcular los pagos mensuales de Modalidad 40 de los clientes.

## Fecha
24 de Febrero, 2026 (Auditoría Arquitectónica RED-018)

## Impacto (Simulado)
- **Monto de Daño/Desviación:** Varía por cliente. Ejemplo: Un mes de 31 días a tope UMA 2025 genera un cobro de $11,228 MXN. Si el sistema calculaba con 30.4 días, arrojaba $11,011 MXN. Una diferencia de $217 MXN en contra del cliente.
- **Riesgo:** Un asesor da a un cliente una línea de captura proyectada inferior a la real. El cliente llega al banco, el cajero rechaza el pago por insuficiencia; genera fricción operativa y si el cliente viaja o pospone, pierde el mes con consecuencias severas a su acumulación de semanas.

## Causas Raíz
* **Actuarial vs Reales:** En el Motor de Pensiones (`PensionEngine`), está bien promediar el mes a 30.4 días porque se proyectan horizontes de 5 a 10 años (1800 días divididos equitativamente). Sin embargo, cuando cruzamos del límite actuarial al límite transaccional de tesorería, el IMSS cobra religiosamente por **día natural**. 

## Plan de Acción (Resolución)
1. **Bifurcación de Contexto (ADR-031):** Desacoplar firmemente los métodos utilizados para proyectar la *Pensión* (horizonte macro) de los métodos para proyectar el *Pago de la M40* (horizonte micro/mensual transaccional).
2. **Implementación Estricta:** Construir utilerías algorítmicas de tiempo real (Calendario Gregoriano Computado) sobre la capa `m40-calculator.ts` en vez de variables genéricas.
3. **Auditoría UI:** Los mensajes en UI de "Pago Mensual" en los modales de estrategia (`StrategyCards.tsx`) deben etiquetarse como "Pago Promedio", mientras que en el Calendario de la Autoridad UI deben ser precisos al centavo.

## Lecciones Aprendidas
Nunca mezcles matemática predictiva agregada (macros) con matemática financiera de cobranza estatal estricta. Las variables estocásticas y los promedios provocan cascadas de falla en las cajas del banco.
