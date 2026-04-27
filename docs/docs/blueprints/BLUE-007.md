# BLUE-007: ROI Optimization Blueprint

## 🏛️ C4 Model: ROI Intelligence Layer

```mermaid
C4Component
    title Component Diagram for ROI Optimization

    Container_Boundary(roi_layer, "ROI Intelligence") {
        Component(roi_computer, "ROI Computer", "TS logic", "Calculates breakeven, IRR, and wealth delta.")
        Component(wealth_viz, "Wealth Visualizer", "React/Recharts", "Displays crossover charts for recovery point.")
    }

    Container(logic, "Actuarial Core", "TypeScript", "Deterministic Pension Engine")
    Container(anchors, "Legal Anchors", "JSON", "M40 Graduated Rates")

    Rel(roi_computer, logic, "Requests A/B Comparison")
    Rel(roi_computer, anchors, "Reads rates for")
    Rel(wealth_viz, roi_computer, "Renders data from")
```

## 📜 ROI Manifest (Protocol 10)
To ensure adversarial robustness, the ROI implementation must:
1. **Always** show the "Recovery Month" as a primary KPI.
2. **Include** a "Cost of Waiting" metric (Loss of pension while investing).
3. **Compare** the investment against a "Safe Haven" (e.g. CETES/Fixed Income).

## 🗃️ Folder Structure Update
```text
src/
  engine/
    roi/
      ROIComputer.ts  <-- NEW
  components/
    ROIVisualizer.tsx <-- NEW
```
