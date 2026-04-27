---
title: "SARC-003: Deprecación de Estrategias Estáticas (Rampa 7+5 y Topado 12)"
status: "Sepultado"
date: "2026-02-23"
author: "Antigravity Engineering"
related_to: ["STRAT-026", "ADR-028", "MATH-015"]
---

# SARC-003: Estrategias Estáticas Predefinidas

## Descripción del Código Sepultado
Previo a la implementación de la Inteligencia de Optimización Estratégica (STRAT-026), el componente `StrategyCards.tsx` generaba recomendaciones basadas en dos rutas estáticas escritas en piedra:
1. **Topado Inteligente (12 Años)**: Cotizar al tope máximo legal de 25 UMAs ininterrumpidamente hasta la edad de retiro (o mínimo 12 años).
2. **Estrategia Rampa (7+5)**: Cotizar en una modalidad de bajo flujo (1.5 UMAs) durante el 60% inicial del tiempo restante (usualmente 7 años) para acumular semanas a bajo costo, y luego "pisar el acelerador" al tope de 25 UMAs los últimos 5 años para inflar el promedio salarial final.

## Razón de Deprecación (Causa de Muerte)
Las estrategias fueron sepultadas debido a dos fallos fundamentales en su concepción:

### 1. Ineficiencia Financiera (Falta de Punto Dulce)
El mercado (y los asesores tradicionales) suele promover estas estrategias como "balas de plata". Sin embargo, la herramienta "Diseño a Medida" demostró que para muchos perfiles específicos (dependiendo de su historial de semanas), invertir 8 años a tope no genera una Pénsion significativamente distinta que invertir 5 años, pero sí genera un gasto masivo e innecesario que destruye el Retorno de Inversión (ROI). Las estrategias fijas empujaban a los usuarios a sobre-capitalizar el IMSS.

### 2. Error Matemático en Promedios (MATH-015)
El cálculo de la Estrategia Rampa en el código fuente heredado sufría de una grave dilución de la Ventana de 250 Semanas. 
El algoritmo antiguo calculaba el salario promedio distribuyendo linealmente el peso de los 7 años bajos y los 5 años topes:
`promedio = ((S_low * 7) + (S_high * 5)) / 12`

Esto violaba la regla del Seguro Social donde **únicamente** cuentan los últimos 4.8 años biológicos. Si tú cotizas 5 años al tope al final, la pensión se calcula con 25 UMAs, punto. Los 7 años anteriores de pago bajo **existen exclusivamente** para aumentar el multiplicador de semanas, no entran en la división del Salario Promedio. El bug causaba que el sistema penalizara falsamente la Pensión resultante, haciéndola ver contraintuitivamente baja en `StrategyCards.tsx`.

## Reemplazo
La lógica fue limpiada de `StrategyCards.tsx` y reemplazada por el **Optimizador Matemático Iterativo**, el cual realiza una búsqueda de fuerza bruta sobre cada mes de inversión posible (desde 12 meses hasta el techo máximo), evalúa la pensión exacta realzada con la ventana estricta de 250 semanas (MATH-015), y retorna dinámicamente:
1. El **Óptimo Matemático** (Mayor ROI sin sacrificar un umbral de pensión base).
2. La **Maximización Absoluta** (La inversión topada calculada precisamente hasta la edad objetivo de retiro).
