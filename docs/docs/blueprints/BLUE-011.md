# BLUE-011: UI Interaction Architecture

## 1. Component Hierarchy
The "Sovereign UX" is built on three layers of components:

### Layer A: The "Glass" (Presentation)
*   `GlassPanel`: Base container with blur and border.
*   `NarcisoToast`: Notification bubbles (Z-Index 50).
*   `Skeleton`: Loading placeholders (Animate-Pulse).

### Layer B: The "Input" (Control)
*   `CurrencyInput`: Formats MXN on blur.
*   `PercentageInput`: Handles "Inflation" (0-100%).
*   `ToggleSwitch`: Replaces checkboxes for "Spouse" option.

### Layer C: The "Twin" (Visualization)
*   `PensionCard`: Displays "Base" vs "Projected" values.
*   `StrategyGrid`: Layout for comparing Rampa vs Topado.

## 2. Interaction Flow (The "Pulse")
When a user clicks "Calculate":
1.  **State Change**: `isComputing = true`.
2.  **Visual**:
    *   Button shows "Computing...".
    *   Result Card switches to `<Skeleton />`.
3.  **Action**: `calculatePensionAction(FormData)` (Server).
4.  **Response**:
    *   `isComputing = false`.
    *   Result Card populates with data.
    *   Toast: "Projection Updated" (Emerald).

## 3. Mobile Response Strategy
*   **Desktop (>1024px)**: `Grid [Sidebar 350px, Content 1fr]`
*   **Tablet**: `Grid [Sidebar 250px, Content 1fr]`
*   **Mobile (<768px)**: `Flex-Col [Header, Content, Footer]`
    *   Sidebar becomes a "Drawer" (Hamburger Menu).

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Document ID** | [018db58e-BLUE-011-UX-b1d4-f6a1f9f87dec] |
| **Parent Strategy** | [STRAT-005] |
| **Domain Sovereignty** | [UI-Architecture] |
| **Consensus State** | [BLUEPRINT] |
