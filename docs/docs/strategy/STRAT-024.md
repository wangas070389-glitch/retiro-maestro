---
id: STRAT-024
title: Forensic Ingestion & Identity Pipeline Integration
status: ACTIVE
date: 2026-02-23
domain: Project Roadmap
protocol: P0 (Strategy)
---

# STRAT-024: Forensic Ingestion & Identity Pipeline Integration

## 1. Mission Context
As part of the Sovereign Framework, we have hardened the core `HeuristicParser` and `SentinelAuditor` to extract and validate critical identity anchors (`NSS`, `CURP`, `DOB`) accurately. The next strategic maneuver is integrating this logic into the user flow without compromising the "Sovereign" aesthetic or introducing overwhelming friction. The Document Uploader must act as a seamless bridge between raw IMSS data and the `PensionEngine`.

## 2. Core Objectives
1. **Zero-Trust Client Extraction**: Enable local extraction of PDFs via the browser. User data should be processed locally to assure data sovereignty and reduce server payload bottlenecks.
2. **Contextual Disclosure (Kinetic UI)**: Present the extraction results to the user dynamically. High-confidence data is pre-confirmed, while low-confidence data triggers manual review loops.
3. **Identity Fortification**: Mandate that `NSS` and `CURP` cross-checks (Protocol 17) act as hard gates before generating official projections.

## 3. Execution Vectors
- Implement a dropzone component (`DocumentUploader.tsx`).
- Bridge `pdfjs-dist` (client-side) to our local `HeuristicParser`.
- Enforce the Protocol 17 Sentinel constraints to reject logically impossible timelines (e.g., claiming 2000 weeks at age 35) immediately at the UI layer.

## 4. Acceptance Criteria
- Users can drop a PDF and see extracted data instantly.
- The system correctly flags missing or contradictory demographic data.
- The aesthetic matches the Narciso V33 design language (glassmorphism, kinetic feedback).
