# STRAT-033: Landing Page UX & Conversion Pivot

## 1. Contexto

La iteración actual de la Landing Page (`page.tsx`) utiliza un lenguaje de diseño heredado de la fase de prototipado técnico ("Sovereign Pension Intelligence", estética *dark tech*, animación de partículas de red). Si bien esto demuestra sofisticación técnica (TriKernel, Ledger), **falla en conectar con el dolor real del usuario final**: personas de 55-60+ años buscando maximizar su pensión del IMSS bajo la Ley 73 mediante la Modalidad 40.

El mercado objetivo demanda **certeza, claridad institucional y rendimiento financiero**, no descentralización criptográfica ni "zero-knowledge".

## 2. Evaluación de Recomendaciones (Aprobadas para Ejecución)

Las 10 recomendaciones proporcionadas configuran un *playbook* perfecto para optimización de conversiones (CRO) en este nicho. **Mi evaluación general es: EJECUTAR TOTALMENTE.**

### Desglose de Puntos Críticos:

| Rec. | Concepto | Veredicto | Justificación Técnica & UX |
| :--- | :--- | :--- | :--- |
| **1** | **Cambiar el Hero** | **Aprobado** | Reemplazar "Sovereign Pension Intelligence" por un titular orientado al beneficio: "Maximiza tu pensión del IMSS...". El tráfico entrante tiene 3 segundos para saber de qué trata la página. |
| **2** | **Agitar El Problema** | **Aprobado** | Insertar sección que hable del dolor ("Una mala decisión cuesta cientos de miles"). Esto ancla el valor del SaaS. |
| **3** | **Explicar Modalidad 40** | **Aprobado** | El SaaS no solo calcula, debe educar. Reduce la fricción de entrada eliminando jerga. |
| **4** | **Paso a Paso (SaaS)** | **Aprobado** | Reemplazar las tarjetas técnicas (Registro Inmutable, M40, ZK) por un flujo de uso de 4 pasos simples. El usuario compra el "cómo me ayuda a mí". |
| **5** | **Simulación Visual (Gráfico)**| **Aprobado** | **CRÍTICO.** Mostrar una gráfica comparativa estática o animada (Pensión Actual vs. Optimizada) es el mayor factor de conversión. *Se puede implementar con Recharts de forma elegante.* |
| **6** | **Generar Confianza** | **Aprobado** | La "cara humana" y base legal (Ley 73) matan la desconfianza. Eliminación de promesas oscuras. |
| **7** | **Ajuste de Tono Visual** | **Aprobado** | Pivotar el Cyberpunk a un "Fintech Premium". Podemos mantener fondos oscuros/elegantes (*dark mode*), pero usar colores más institucionales (azules, blancos) y eliminar o suavizar las partículas de red para dar imagen de app bancaria/actuarial. |
| **8** | **Modelo de Negocio Claro** | **Aprobado** | Bloque de *Pricing* transparente (Simulación vs. Estrategia Completa). |
| **9** | **FAQ** | **Aprobado** | Resuelve objeciones antes del pago. |
| **10**| **Quitar "Sovereign"** | **Aprobado** | Excesivamente abstracto y genera ruido conceptual. Transición a branding orientado a "Certidumbre y Precisión". |

## 3. Plan de Acción (Siguientes Pasos)

1. **Refactorización del Hero:** Eliminar `ParticleNetwork` (o reducirlo a opacidad 5%) y centrar el mensaje en IMSS/M40.
2. **Nuevos Componentes UI:**
   - Sección `ProblemAgitation`
   - Sección `HowItWorks` (Pasos 1-4)
   - Sección `ValueVisualization` (Mockup de Gráfica)
   - Sección `Pricing`
   - Sección `FAQ`
3. **Limpieza de Copys:** Purgar términos como "Ledger Forense", "Zero-Knowledge", "Criptográfico". Reemplazar por "Precisión Actuarial", "Ley 73", "Seguridad de Datos".

## Conclusión

El diseño técnico cumplió su propósito de validar la arquitectura, pero para salir a mercado (GTM), la interfaz debe hablar el idioma del pensionado, no el del ingeniero. **Procedemos con la reestructuración completa de la Landing Page.**
