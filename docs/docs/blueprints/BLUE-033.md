# BLUE-033: Authority Panel Architecture (Panel Legal & Auditoría)

## 1. Architectural Objective
Define the structural zones and states of the "Panel Legal & Auditoría" (formerly The Authority) to transition it from a raw "utilities panel" to a robust, conversion-focused security dashboard.

## 2. Structural Zones (3-Zone Layout)

The UI is strictly divided into three distinct semantic and visual domains:

### Zona 1: Flujo Operativo Inmediato
Focuses on actionable legal documents and financial planning.
- **Generador de Escritos**: State-aware document generator (Baja Voluntaria, Alta M40). Tracks whether documents are ungenerated or downloaded.
- **Calendario Inteligente**: Active state displays the M40 monthly payment schedule (limit day 17) generated dynamically up to 4 months forward. Empty state features aggressive CTAs ("Generar Plan para Activar Calendario") rather than passive text.

### Zona 2: Seguridad y Auditoría Criptográfica
Focuses on trust, immutability, and data provenance.
- **Dossier Soberano**: Displays cryptographically sealed projections. Includes manual "Validar" forensic checks for structural integrity. Empty states emphasize security risks to prompt simulation generation.
- **Oracle Pulse**: Real-time validation card showing synchronization status with DOF (Diario Oficial de la Federación) and INEGI. Displays current UMA and INPC metrics with a "VÁLIDO" or "Actualizado" pulse animation.

### Zona 3: Escalamiento Institucional (Upgrade Premium)
Focuses on the monetization and SaaS upgrade path.
- **Feature Comparison**: Direct contrast between Free features (generic reports, no audit) and Gold features (infinite audits, real-time oracle, legal specs).
- **Price Anchoring**: Highlights annual cost ($4,999) decoupled psychologically by explicitly stating the monthly equivalent ("Equivalente a $416 MXN al mes").

## 3. Microcopy & Trust Signals
- Renamed entirely to Spanish ("Panel Legal & Auditoría") for linguistic consistency alongside Narciso V33.
- Subheaders heavily index on words like "Criptográfica", "Blindado", "Soberano", and "Institucional".
- Colors intentionally pivot from neutral grays to authoritative indigos, emeralds (for valid states), and ambers (for warnings and premium features).

---
**Status**: ACTIVE
**ID**: BLUE-033
