# STRAT-034: Dashboard UX/Conversion Pivot (The "Actuary to Advisor" Shift)

**Status:** APPROVED
**Date:** 2026-02-26
**Author:** AI Co-Pilot (Based on User Teardown)

## 1. Context and Motivation

The current internal dashboard ("Centro de Comando") operates like an institutional actuarial engine. While technically flawless, its presentation is overly dense, technical, and intimidating for the primary end-user (individuals 55+ analyzing their IMSS Modalidad 40 options). 

The goal of STRAT-034 is to perform a psychological UX translation: **Move from "Actuarial Tool" to "Clear, Emotional Advisor."** 

## 2. Core Diagnoses & Solutions

### 2.1 Information Hierarchy
**Problem:** Inputs, results, validations, and custom design tools all compete for visual supremacy.
**Solution:** Enforce a strict hierarchy driven by user motivation:
1. **The Result (Hero):** Projected Pension & Comparison (+ $X vs current scenario).
2. **The Recommendation:** Recommended Strategy (Best ROI).
3. **The Engine (Hidden/Collapsible):** Inputs and Technical validation.

### 2.2 Cognitive Extrication (Tabbed Paradigm)
**Problem:** Too much density on a single scroll.
**Solution:** Implement a phased or tabbed approach.
* **Pestaña 1 (Simulación):** The core calculation & results.
* **Pestaña 2 (Estrategias):** The comparative cards (Optimo vs Maximo).
* **Pestaña 3 (Diseño a Medida):** Extract the "tell me what you want to earn" feature into a dedicated, premium-feeling space.

### 2.3 Semantic Simplification (Microcopy)
Technical jargon will be replaced with clear, benefit-driven language.
* "Centro de Comando" -> "Simulador"
* "Expediente Soberano" -> "Mis Estudios" / "Historial"
* "Verificación del Servidor" -> "Cálculo Validado Actuarialmente"
* "Óptimo Matemático (1+4)" -> "Estrategia Recomendada (Costo-Beneficio)"

### 2.4 Emotional and Trust Hooks
**Problem:** The system feels cold and mathematical.
**Solution:**
* **Context Tooltips:** Add `?` icons explaining UMA, SBC, and Ley 73.
* **Emotional Hooks:** Add dynamic text reading `"Esta estrategia aumenta tu pensión mensual en X%."`
* **Institutional Trust:** Add clear legal footers (`"Basado en Ley 73 del IMSS. Valores UMA actualizados a 2026."`).

## 3. Implementation Phasing

**Phase 1: Terminology and Navigation**
* Update Sidebar.
* Update structural titles in `src/app/(main)/dashboard/page.tsx`.

**Phase 2: The Hero Result Block**
* Redesign the inertial output to prominently show the Delta (+ $X vs Base).
* Add High/Medium/Low impact badges.

**Phase 3: Tabbed Layout Architecture**
* Wrap the main view in a Radix/Shadcn Tabs component or custom React state.
* Isolate the "Diseño a Medida" (Custom Strategy Modal content) into its own dedicated Tab or Page.

**Phase 4: Tooltips & Footers**
* Inject contextual help for critical inputs.
* Add Legal/Methodology footers.

## 4. B2B / Monetization Considerations
By separating "Simulación" (Basic) from "Estrategias" (Premium/Optimal) and "Diseño a Medida" (Pro Advisor), the UI naturally aligns with a freemium or tiered SaaS monetization strategy. PDF Generation will be highlighted as a B2B export feature.
