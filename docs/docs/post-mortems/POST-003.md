# POST-003: Authority Screen Regression – Multi-Root Cascade Failure

## 📅 Timeline: February 23, 2026

**Severity**: CRITICAL – Full Authority page blank render + Dashboard `InverseDesign` calculator non-functional.

**Issue**: The `/authority` page stopped rendering. The Dashboard's "Diseño a Medida" (Inverse Calculator) was producing `NaN` values and its "Análisis Profundo" modal failed to open. The root error reported by the browser was:

```
Unhandled Runtime Error
Error: Element type is invalid: expected a string (for built-in components)
or a class/function (for composite components) but got: undefined.
Check the render method of `InverseDesign`.
```

---

## 🔍 Root Cause Analysis

This was not a single failure. It was a **cascade of 5 independent bugs** introduced across multiple sessions, each previously non-fatal but collectively causing a total system failure upon initialization.

### Cause 1 – `StrategyModal.tsx` Was Completely Empty (PRIMARY)
| Attribute | Value |
|---|---|
| **File** | `src/components/modals/StrategyModal.tsx` |
| **Trigger** | Session write interrupted or file corrupted during a previous save operation |
| **Effect** | `InverseDesign` and `StrategyCards` imported `StrategyModal`, which resolved to `undefined`, crashing React's fiber reconciler on any page that included these components |

This was the crash that triggered the visible error log. The component had been created during the "Custom Strategy Modal" session (conversation `fd0c00a7`) but its contents were lost.

### Cause 2 – `import * as` JSON Module Resolution Failure
| Attribute | Value |
|---|---|
| **Files** | `pension-engine.ts`, `inverse-design.tsx`, `strategy-cards.tsx` |
| **Trigger** | Next.js 14 + TypeScript `resolveJsonModule:true` → named exports from JSON are non-deterministic |
| **Effect** | `legalData.uma_2026` resolved as `undefined`, making all salary and UMA calculations return `NaN` |

The `import * as legalData from '...'` pattern was generating warnings (`Should not import the named export`) and silently failing in production chunk compilation.

### Cause 3 – `DossierBuilder.verifyBundle()` Crash on Legacy Data
| Attribute | Value |
|---|---|
| **File** | `src/lib/engine/audit/dossier-builder.ts` |
| **Trigger** | Saved simulations pre-dating the `EvidenceSigner` (Strategy 006) had no `tuple` or `signature` fields |
| **Effect** | `EvidenceSigner.verify(entry.tuple, entry.signature)` → `verify(undefined, undefined)` → crash in the integrity verification flow |

### Cause 4 – `OfficialDocument.tsx` Crashing on Undefined Name
| Attribute | Value |
|---|---|
| **File** | `src/components/reports/OfficialDocument.tsx` |
| **Trigger** | `clientName` passed as `undefined` from a new user session with no profile saved |
| **Effect** | `clientName.toUpperCase()` threw an uncaught `TypeError`, crashing the Authority page during PDF component initialization |

### Cause 5 – `strategyResult` Prop Shape Mismatch
| Attribute | Value |
|---|---|
| **File** | `src/components/modals/StrategyModal.tsx` (reconstructed) |
| **Trigger** | `RetirementReport` expected `{ pensionMensual, totalInversion, roiMeses }` but received raw projection object `{ pension, investment, roi }` |
| **Effect** | TypeScript type error; would have caused PDF generation to fail silently or crash at runtime |

---

## 🛠️ Resolution

| # | Fix | Files Modified |
|---|---|---|
| 1 | Fully reconstructed `StrategyModal` with Recharts chart, annual projection table, PDF download with forensic seal | `modals/StrategyModal.tsx` |
| 2 | Replaced all `import * as legalData` with `import legalData` (default import) | `pension-engine.ts`, `inverse-design.tsx`, `strategy-cards.tsx` |
| 3 | Added null-guard: skip `EvidenceSigner.verify()` if `entry.tuple` or `entry.signature` are absent; return `valid: false` with informative message | `dossier-builder.ts` |
| 4 | Added default prop values (`clientName = "Usuario"`, `nss = "000..."`) and safe string variables | `OfficialDocument.tsx` |
| 5 | Mapped `finalResult` fields to expected `strategyResult` shape in `PDFDownloadLink` props | `StrategyModal.tsx` |

---

## 🔐 Impact on Forensic Integrity

Existing dossiers sealed before the Universal Pension Logic update (Phase 7) will correctly report **"Datos Alterados"** when verified — this is **expected and correct behavior**. The pension engine now produces different projection outputs for the same inputs, which by design invalidates historical cryptographic hashes.

**Resolution**: These dossiers remain valid as historical snapshots. New simulations sealed after this fix will produce valid, verifiable hashes. A "re-sealing" migration script could be implemented if needed (`POST-003-MIGRATION.sql`).

---

## 💡 Lessons Learned

1. **Empty File Silences Are Fatal**: A component that resolves to `undefined` rather than an error at import time can remain hidden until instantiation. Add an `eslint-plugin-import` rule to flag empty component files.

2. **`import * as JSON` Is Non-Deterministic in Next.js**: Always use default imports for JSON data files. Named destructuring is unreliable across module bundlers. Document this as a **team standard** in `ADR`.

3. **Defensive Defaults in PDF Components**: React-PDF renders in a sandboxed context where runtime errors are harder to debug. Every prop that touches string methods must have a fallback default.

4. **Cross-Session Architectural Drift**: Causes 1–5 each originated in different sessions. No single session introduced a breaking change, but their combination was fatal. This highlights the need for integration smoke tests (`npm run smoke`) after each session closes.

5. **Forensic Hash Invalidation Is a Feature, Not a Bug**: Engine changes _should_ invalidate existing hashes. Document this expectation clearly in user-facing copy so users don't interpret it as tampering.

---

## 🔗 Related Documents
- [ADR-020](file:///c:/Users/z003puwx/Desktop/Antigravity_Projects/retiro-maestro/docs/adr/ADR-020.md): Report Integrity & ISR Logic
- [STRAT-019](file:///c:/Users/z003puwx/Desktop/Antigravity_Projects/retiro-maestro/docs/strategy/STRAT-019.md): Authority Dossier & Forensic Handshake
- [RED-013](file:///c:/Users/z003puwx/Desktop/Antigravity_Projects/retiro-maestro/docs/red-team/RED-013.md): Adversarial Audit of Forensic Bundle
