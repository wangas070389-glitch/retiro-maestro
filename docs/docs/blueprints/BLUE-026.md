# BLUE-026: Strategy Detail Modal (Refined Layout)

## 1. Architectural Objective
To define the technical layout and component hierarchy of the refined `StrategyModal.tsx`, ensuring it implements the **Narciso V33** aesthetic while maintaining strict data integrity signatures.

## 2. Component Diagram

```mermaid
graph TD
    subgraph "StrategyModal (Root - max-w-5xl)"
        H[Sticky Header: Title + Close + Mini CTA]
        subgraph "Tab Navigation"
            T1[Tab 1: Resumen Ejecutivo]
            T2[Tab 2: Proyección Dinámica]
            T3[Tab 3: Desglose Anual]
        end
        Sc[Tab Content Area]
        F[Sticky Footer: Back + Unlock CTA]
    end

    T1 --> Sc
    T2 --> Sc
    T3 --> Sc

    subgraph "Tab 1: Resumen"
        R1[Main KPI: Pension Objetivo]
        R2[Automatic Comparison Differential]
        R3[Plan Requerido: Inversion & Duration Grid]
    end

    subgraph "Tab 2: Proyección"
        P1[Recharts: Area Kinetic Graph (80% Height)]
        P2[Breakeven Legend]
    end

    subgraph "Tab 3: Desglose Anual"
        D1[Independent Vertical Scroll Table]
        D2[Sticky Left Column: Age/Year]
    end
    
    Sc -.-> R1
    Sc -.-> P1
    Sc -.-> D1
```
    T -->|Iterate| PE
    
    F -->|Sign| DB[DossierBuilder.buildAdHocBundle]
    F -->|Report| PR[PDFDownloadLink]
```

## 3. Style Specification (Tailwind)
* **Backdrop**: `bg-slate-900/60 backdrop-blur-sm`
* **Container**: `bg-white dark:bg-slate-950 rounded-3xl shadow-2xl`
* **Metric Cards**: `bg-gradient-to-br from-indigo-50 to-white border-indigo-100` (Dynamic based on metric type).
* **Typography**:
    - Headers: `font-black uppercase tracking-tight`
    - Values: `font-black tabular-nums`
    - Labels: `text-[10px] font-black uppercase tracking-widest`

## 4. Interaction Logic
1. **Mount**: Initialize `PensionEngine` with `input` props.
2. **Compute**: Run projection loop for 5-6 years.
3. **Sign**: Pass final year data to `DossierBuilder`.
4. **Render**: Trigger staggered GSAP/Framer-Motion timeline.

---
**Status**: ACTIVE
**ID**: BLUE-026
