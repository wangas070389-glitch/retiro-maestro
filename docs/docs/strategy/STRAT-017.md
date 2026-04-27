# STRAT-017: Custom Strategy Design (Inverse Calculator)

## 🎯 Objective
Enable users to perform "Reverse Actuarial Engineering" by defining a target monthly pension and receiving the exact investment plan (Modalidad 40) required to achieve it.

## 🏗️ Core Pillars
1. **Inverse Sovereignty**: The user is the master of their goal; the engine serves as the map-maker.
2. **Instant Feedback**: Real-time recalculation as target amounts evolve.
3. **Legal Integrity**: Enforcement of the 25 UMA ceiling and 2026 investment rates.

## 📈 Roadmap (Completed & Active Status)
- **Phase A (Active Conversion Hook)**: Shift from a passive "calculator" to a direct "Target Differential" hook. The UI immediately reveals the gap between the user's inertial scenario and their `TargetPension`.
- **Phase B (High-Fidelity UI)**: Implemented 2-Column Split (Input & Context vs. Actionable Plan). Integrated dynamic sliders and quick-select buttons ($25k, $30k, Max) to remove cognitive friction.
- **Phase C (Sovereign Authority)**: Enhanced with "Viability" indicators to physically warn users if a goal exceeds the legal 25 UMA cap, establishing the engine as an honest legal actor rather than a naive mathematical tool.

## 🛡️ Success Metrics
- 100% accuracy compared to the forward engine (Proyección Estimada).
- Clean handling of "Impossible Goal" edge cases (25 UMA cap).
- Seamless transition from "Design" to "Saved Strategy".
