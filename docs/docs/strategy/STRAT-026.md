---
title: "STRAT-026: Inteligencia de Optimización Estratégica"
status: "Propuesto"
date: "2026-02-23"
author: "Antigravity Engineering"
---

# Inteligencia de Optimización Estratégica (Optimizador Matemático)

## Resumen Ejecutivo
Actualmente, el sistema recomienda estrategias predefinidas y estáticas ("Topado a 12 años", "Rampa 7+5"). Sin embargo, el simulador inverso ("Diseño a Medida") demuestra frecuentemente que existen configuraciones de inversión (monto y duración) que logran una **mayor pensión con una menor inversión total**. 
STRAT-026 propone sustituir las recomendaciones estáticas por un **Motor de Búsqueda Óptima** que itere matemáticas precisas para encontrar el "Punto Dulce" (Sweet Spot) de inversión para cada cliente único.

## Problema Detectado (Bug Calculadora Rampa)
Al analizar por qué la estrategia "Rampa" generaba resultados inferiores a los esperados, detectamos un error en la capa de interfaz (`StrategyCards.tsx`). El sistema estaba promediando el salario de los primeros 7 años de baja aportación con los últimos 5 años de alta aportación. 
**Realidad Legal:** La ley del IMSS indica que el salario promedio (`salary_prom`) para el cálculo de la pensión **solo considera las últimas 250 semanas cotizadas (aprox. 4.8 años)**. En la estrategia "Rampa 7+5", las últimas 250 semanas están cubiertas *al 100%* por la inversión Topada, por lo que el salario promedio de la pensión debería ser equivalente a 25 UMAs, no un promedio diluido.

## Misión de Optimización
1. **Corregir el Algoritmo Base**: Ajustar las matemáticas de simulación en las Tarjetas de Estrategia para que la ventana de 250 semanas se aplique estrictamente sobre los años finales de inversión.
2. **Motor de Búsqueda de Punto Óptimo (Óptimo Matemático)**: Desarrollar una función `findOptimalStrategy` que:
   - Recorra todas las duraciones posibles (ej. de 12 a 60 meses de inversión Modalidad 40).
   - Recorra salarios objetivo desde 1 UMA hasta 25 UMAs.
   - Evalúe el ROI (meses para recuperar inversión) y la Pensión Neta resultante.
   - **Criterio de Victoria**: Seleccionar la estrategia que maximice la eficiencia del capital (mayor pensión por cada peso invertido) superando un umbral mínimo de vida digna.

## Nueva UI / UX
La tarjeta "Recomendada" pasará de ser un "Topado Inteligente" genérico a un **"Óptimo Matemático"**, calculando en tiempo real la mejor ruta personalizada considerando la edad, semanas cotizadas actuales y salario promedio histórico del individuo.
