# BLUE-019: Forensic Handshake Integration Map

## 🏗️ Architecture Overview
This blueprint defines the integration between the `SimulationStore` and the `DossierBuilder` to automate the forensic sealing process.

## 🔄 Data Flow
1. **Trigger**: User clicks "Ver Detalle" in `StrategyCards`.
2. **Compute**: `StrategyModal` runs the `projection` calculation.
3. **Seal**: `StrategyModal` calls `DossierBuilder.generateAdHocBundle(projection)`.
4. **Display**: UI displays the generated `Integrity Hash`.
5. **Print**: `RetirementReport` embeds the hash and bundle metadata in the PDF footer.

## 📄 Component Changes
- **RetirementReport.tsx**: Add a `ForensicFooter` component.
- **StrategyModal.tsx**: Introduce a `useForensicBundle` hook.
- **DossierBuilder.ts**: Add `generateAdHocBundle` public method.

## 🛡️ Verification
- Verification script must confirm that the hash in the PDF matches a re-calculation of the projection data.
