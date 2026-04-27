# BLUE-006: Forensic Sovereignty & Resilience Blueprint

## 🏛️ C4 Model: Data Durability Layer

```mermaid
C4Component
    title Component Diagram for Forensic Bundle System

    Container_Boundary(audit_layer, "Audit & Resilience") {
        Component(dossier_engine, "Dossier Engine", "TS Service", "Compiles projections into self-contained bundles.")
        Component(signature_verify, "Signature Verifier", "TS Logic", "Revalidates evidence using embedded anchors.")
        Component(exporter, "CJFB Exporter", "Client Side", "Generates .repro files for Protocol 23 compliance.")
    }

    Container(logic, "Actuarial Core", "TypeScript", "Deterministic Pension Engine")
    ContainerDb(storage, "Local Storage", "IndexDB/LocalStorage", "Volatile Ledger")
    
    Rel(dossier_engine, storage, "Reads history from")
    Rel(dossier_engine, logic, "Uses versioning from")
    Rel(exporter, dossier_engine, "Calls")
    Rel(signature_verify, exporter, "Validates input of")
```

## 📜 Agentic Manifest (Protocol 23)
To ensure long-term durability, the AI or Engineer implementation must:
1. **Never** include absolute paths in the bundle.
2. **Always** include the exact UMA/SMDF values used (do not reference the app's current config).
3. **Format** values with fixed precision (2 decimal places) to avoid floating point drift between different machines in the future.

## 🗃️ Folder Structure Update
```text
src/
  engine/
    audit/
      dossier-builder.ts  <-- NEW
      resilience-logic.ts <-- NEW
  components/
    DossierManager.tsx    <-- NEW
```
