---
id: BLUE-027
title: Document Uploader & Protocol 17 Bridge
status: ACTIVE
date: 2026-02-23
domain: Technical Implementation
protocol: P1 (Documentation)
---

# BLUE-027: Document Uploader & Protocol 17 Bridge

## 1. Component Architecture
The ingestion pipeline requires a new component designed to handle the physical file upload, binary extraction, and feedback loop.

### `DocumentUploader.tsx` (Client Component)
- **Role**: Presentational dropzone and orchestrator of edge processing.
- **Dependencies**: 
  - `react-dropzone` (for file handling)
  - `pdfjs-dist` (dynamically imported for binary-to-text extraction)
  - `framer-motion` (for kinetic feedback states)

### Handlers
1. **`onDrop(files)`**: Validates MIME type (`application/pdf`) and size (<5MB).
2. **`processDocument(file)`**: 
   - Awaits `PDFParser.extractText(file)`.
   - Passes string to `HeuristicParser.parse()`.
   - Passes `IngestedData` to `SentinelAuditor.audit()`.
3. **`handleConfirmation(data)`**: Dispatches validated payload to the global Zustand store (`useDossierStore`).

## 2. State & Interaction Design
The component operates like a finite state machine:
- **`IDLE`**: Shows standard dropzone UI.
- **`PROCESSING`**: Pulses with a "Forensic Scan" animation (Narciso V33 style).
- **`REVIEW`**: Displays the extracted fields. Green checkmarks for high confidence; amber/red inputs for manual overrides if `audit.is_valid` is false.
- **`CONFIRMED`**: Locks the inputs and transitions user to the next step.

## 3. Protocol 17 Bridge
The `SentinelAuditor` output directly dictates UI behavior:
- If `flags` array is populated, the `DocumentUploader` blocks the "Confirm" action until the user manually touches and verifies each flagged field.
