---
title: "MATH-015: Corrección de Promedio Dinámico (Ventana 250 Semanas)"
status: "Aprobado"
date: "2026-02-23"
author: "Antigravity Engineering"
---

# Corrección de Promedio Dinámico (Ventana 250 Semanas)

## BUG: Dilución de Salarios en Estrategias Prolongadas

Al simular una estrategia "Rampa 7+5" (total 12 años, de los cuales los últimos 5 son al tope de 25 UMAs), el motor subyacente antiguo estaba calculando el `salary_prom` basándose en el promedio **de los 12 años completos**, en lugar de aislar las últimas 250 semanas.

```typescript
// ANTIGUO Y ERRÓNEO: Promediaba 12 años.
const rampaRawTargetDaily = ((rampaLowDaily * 7) + (rampaHighDaily * 5)) / 12;
```

## Definición Matemática de V250
1 año actuarial = 52 semanas.
5 años = 260 semanas (IMSS usa 250 semanas comerciales, ~4.8 años).

Sea $T$ el tiempo total de la estrategia en años.
Sea $S_{low}$ el Salario Diario Inicial (1.5 UMAs) pagado por $T_1$ años.
Sea $S_{high}$ el Salario Diario Final (25 UMAs) pagado por $T_2$ años (donde $T_1 + T_2 = T$).

El **Salario Promedio Real** ($S_{prom}$) válido ante el IMSS cuando el periodo evaluado ($T$) > 4.8 años, **solo cuenta el final del arreglo temporal de salarios**.

Si $T_2 \geq 4.8$ años:
$$S_{prom} = S_{high}$$
(El periodo de salario bajo $S_{low}$ queda **totalmente excluido** de la ventana legal. Solo importó para sumar Semanas Acumuladas).

Si $T_2 < 4.8$ años, y $T_1$ interseca la ventana de 5 años:
$$S_{prom} = \frac{(S_{high} \times T_2 \times 52) + (S_{low} \times (4.8 - T_2) \times 52)}{250}$$

## Implementación de Solución
En `StrategyCards.tsx` y en el motor `OptimizerEngine`, el algoritmo evaluativo debe segmentar el `investYears` o tiempo de rampa. 

1. Validaremos si los años restantes > 5.
2. Todo año en exceso de los últimos 5 debe calcularse al costo **MÍNIMO** de Modalidad 40, cuyo único objetivo es acumular la métrica de Semanas.
3. El costo de los primeros $T_1$ años = Costo_Anual($S_{low}$) $\times T_1$
4. El costo de los últimos 5 años = Costo_Anual($S_{high}$) $\times 5$
5. La pensión se calcula inyectando `$salary_prom = S_{high}$` directamente si $T_2 \geq 4.8$, sin promediar con los años históricos irrelevantes.
