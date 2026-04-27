# STRAT-018: Reactive Strategy Synchronization

## 🎯 Objective
Unify the dashboard's state management to ensure that all simulation components (Forward Engine, Strategy Cards, and Inverse Calculator) respond instantly to changes in the user profile.

## 🏗️ Core Pillars
1. **Unidirectional State Flow**: The `SimulationStore` becomes the single source of truth for the active scenario.
2. **Instant Feedback Loop**: Sub-components react to store mutations via hooks, eliminating the "Stale Strategy" problem.
3. **Cross-Domain Alignment**: Ensuring that 2026 legal anchors are applied consistently across all calculation engines.

## 📈 Roadmap
- **Phase A**: Refactor Dashboard input form into a "controlled" state model.
- **Phase B**: Update `StrategyCards` to subscribe to store changes and use 2026 M40 rates.
- **Phase C**: Verification of cross-component consistency.

## 🛡️ Success Metrics
- Input changes reflect in strategy cards in <100ms.
- Mathematical parity between "Diseño a Medida" and "Topado Inteligente" cards.
- Zero regression in server-side signed verification.
