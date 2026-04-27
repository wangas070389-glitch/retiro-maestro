---
title: "STRAT-025: Forensic Ingestion Integration Pipeline"
status: "Draft"
author: "Antigravity Nucleus"
date: "2026-02-23"
tags: ["ingestion", "forensics", "actuarial-engine", "ui", "dossier"]
---

# STRAT-025: Forensic Ingestion Integration Pipeline

## 1. Contexto & Misión
Acabamos de entrenar correctamente la red paramétrica del `HeuristicParser` y `DocumentUploader` para absorber PDFs físicos de IMSS con exactitud comprobada (Thelma, Sulema). Sin embargo, esto solo precarga los inputs visuales (`scenarioA`).

**Misión:** Construir el oleoducto criptográfico y lógico (Forensic Provenance) necesario para que el documento origen valide las salidas a lo largo de toda la cadena de simulación (Desde Drag&Drop -> Motor -> PDF de Entrega -> Ledger).

---

## 2. Mapa Arquitectónico (Flujo de Consciencia)

### Fase 1: Estado Global de Procedencia (Minting)
* **Objetivo:** Guardar no solo los atributos como *(Semanas)*, sino la metadata auditada.
* **Componentes:** `src/store/index.ts` y `DocumentUploader.tsx`.
* **Detalle:** Al hacer click en "Confirmar Datos", el Uploader no solo actualiza `scenarioA` (que puede ser mutado manualmente), sino que inscribe un `certified_dossier` inmutable (Solo lectura) en el Zustand Store que contiene la Firma (Filename, Date, Confidence, Hash, Values).

### Fase 2: Certificación en Componente Principal (Dashboard)
* **Objetivo:** Dar fe notarial (Sello Verde) al operador de que el input está anclado a un PDF real.
* **Componentes:** `src/app/(main)/dashboard/page.tsx`
* **Detalle:** La sección "Parámetros de Entrada" mostrará un Banner de Auditoría: "Cargado desde: sulema.pdf (100% verificado)". Los inputs correspondientes se mostrarán visualmente bloqueados (Lock pattern).

### Fase 3: Destrucción por Fricción (Mutación)
* **Objetivo:** Si el asesor manipula el "Salario Base" después de una extracción exitosa, **se rompe la certificación de origen de manera automática**.
* **Componentes:** `src/app/(main)/dashboard/page.tsx`
* **Detalle:** Cualquier `onChange` manual que detecte que el valor difiere del certificado, emitirá un Toast: "⚠️ Precisión Forense Rota" y limpiará la bandera `certified_dossier`.

### Fase 4: Acta Inercial con Anclaje Forense (PDF a Cliente)
* **Objetivo:** Imprimir en el PDF (Acta_Inercial_Soberana.pdf) la prueba criptográfica.
* **Componentes:** `src/components/reports/RetirementReport.tsx`
* **Detalle:** Se añade una tira de telemetría forense (Watermark / Footer System), detallando el Checksum del Documento Original, N.S.S., C.U.R.P. extraídos.

---

## 3. Plan Estricto de Ejecución

1. [ ] **Store Updates:** `src/store/index.ts` 
   - Añadir `interface CertifiedDossier`.
   - Añadir `setCertifiedDossier(dossier | null)` al store global.

2. [ ] **Uploader Updates:** `src/components/ingestion/DocumentUploader.tsx`
   - Importar `useSimulationStore`.
   - Modificar la función `handleConfirm` para inyectar la metadata con `setCertifiedDossier(...)`.

3. [ ] **Dashboard Lock-In (UI):** `src/app/(main)/dashboard/page.tsx`
   - Importar `certifiedDossier` state.
   - Modificar el renderizado de `Parámetros de Entrada` para agregar Banner y Locks.
   - Reconfigurar `onChange` methods para alertar si se destruye el certificado.

4. [ ] **Report Wiring (PDF):** `src/components/reports/RetirementReport.tsx`
   - Pasar como props el `certifiedDossier`.
   - Renderizar sección especializada `[Auditoría de Ingestión Actuarial] (Soberanía Comprobada)` si existe el dosier base.

## 4. Retorno Deseado
Transformar una simple calculadora web en Terminal de Certificación Digital donde cada cálculo de Pensión tiene un cordón umbilical indisoluble con su fuente de origen física, y de modificarse, levanta alarmas automáticas operacionales.
