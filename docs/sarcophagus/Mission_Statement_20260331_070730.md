# Mission Statement: B2C Interface Refactor (Ciudadano)

## 🎯 Strategic Objective
Minimize entry friction and eradicate financial cognitive load for B2C users (Citizens, typically 60+ years old) by eliminating technical jargon, enforcing actuarial truth through document-driven validation, and restructuring value presentation to focus on Monthly affordability rather than total capital investment.

---

## 🛠️ Operational Objectives

### 1. Ingest & Integrity (Input Layer)
*   **Source of Truth Lock**: If a PDF is uploaded (SINDO/SISEC), fields like "Semanas" and "Salario" must become **Read-Only**.
*   **Actuarial Guardrails (Dependents)**: Strict validation for children (Age <= 16, or 16-25 with "Student" confirmation). Block assignments for children > 25.
*   **Conditionally Mandatory Termination Date**: "Fecha de Baja" is mandatory only if the user is not currently active (`Actualmente cotizando`). If active, the field should be disabled and cleared to ensure frictionless data entry.

### 2. Cognitive Load & Value Anchor (Results Layer)
*   **Monthly Affordability First**: Pivot from "Total Investment" to "Monthly Cost" as the primary decision vector in all strategy modals.
*   **Gap Analysis Chart**: Visualize the "Delta" (the jump in pension) provided by Modalidad 40 vs the Inertial scenario.
*   **Legal Hard-Stop**: Enforce a 25 UMA ceiling on all sliders in the Inverse Design calculator to manage expectations within legal limits.

### 3. Jargon Eradication (Copywriting)
*   **Persona-Aligned Copy**: Replace "Forense", "Dossier", "Hash", and "Criptográfico" with "Validado", "Expediente Legal", and "Folio de Auditoría".
*   **Formato IMSS Clarity**: Rename generated documents to match exactly what the user will encounter at the IMSS window (e.g., "Escrito de Inscripción a Continuación Voluntaria").

### 4. LTV Reinforcement (Monetization)
*   **Inflation Shield**: Reframe the Premium License as an "Annual Inflation Protection" service that automatically recalibrates when UMA/INEGI data updates in February.

---

## 📈 Success Metrics
*   **Conversion**: Increased study completion rate.
*   **Accuracy**: Zero discrepancy between manual input and PDF truth when present.
*   **Trust**: Positive feedback on "Ease of Use" and "Clarity of Law".
