# BLUE-018: Dashboard State Flow & Reactivity

## 🧬 Data Flow Model: "Pulse Reactivity"

The dashboard implements a "Pulse" model where the Main Form acts as the pulse-generator, and all other modules act as resonant listeners.

## 🔄 State Sequence
1. **Input Generation**: User types in `dashboard/page.tsx`.
2. **Pulse Dispatch**: `updateScenarioA()` is called on every keystroke/change.
3. **Store Mutation**: `useSimulationStore` updates the `scenarioA.input` object.
4. **Resonance**:
   - `StrategyCards.tsx` re-calculates projections via `useMemo([scenarioA.input])`.
   - `InverseDesign.tsx` re-calculates required SBC via `useEffect([scenarioA.input])`.
5. **Signed Verification**: Final "Calcular Pensión" button triggers `calculatePensionAction` for server-side authority.

## 📈 Math Standards (2026)
All reactive listeners (Cards, Inverse) MUST use the following constants derived from `legal-anchors.json`:
- **M40 Rate**: 14.438%
- **UMA 2026**: 117.31
- **Inflation Target**: 10.22% (Proyectado)

## 🎨 Component Binding
- `input.weeks` -> `updateScenarioA({ weeks: val })`
- `input.salary_prom` -> `updateScenarioA({ salary_prom: val })`
- `input.age` -> `updateScenarioA({ age: val })`
