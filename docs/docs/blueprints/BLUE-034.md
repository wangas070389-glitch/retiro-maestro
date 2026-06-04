# BLUE-034: Advisor Impersonation Workspace and Client Agenda Synchronization Architecture

This document maps the architectural layout and component relationships that enable real-time synchronization between the Advisor CRM Closing Terminal and the Client's Agenda de Pagos dashboard tracker.

## 1. System Component Layout

```mermaid
graph TD
    subgraph Advisor Viewport (CRM Workspace)
        CT[ClosingTerminal.tsx] -->|selectStrategyAction| DB_M40[DB: m40PaymentsState]
        CT -->|togglePaymentStatusAction| DB_M40
    end

    subgraph Client Viewport (Dashboard)
        D_Tab4[Dashboard: Tab 4 - Mi Agenda] -->|getClientTrackingAction| DB_M40
        D_Tab4 -->|Render| Calendar[Interactive Checkbox Calendar]
        D_Tab4 -->|Render| Progress[Progress Bar & Investment Stats]
    end

    subgraph Actuarial Calculation Engine
        PE[PensionEngine.ts] -->|calculate| D_Tab1[Dashboard: Tab 1 - Tu Pensión]
        PC[PersonaClassifier.ts] -->|classify| D_Tab1
    end
```

## 2. Real-Time Impersonation Synchronization Flow

1. **Advisor Activation**: The advisor views the client's workspace and selects a Modalidad 40 strategy in the `ClosingTerminal` Decision tab. Clicking "Activar" calls `selectStrategyAction(clientId)`.
2. **Database State Mutation**: The server action calculates the progressive contribution rate list, converts it to a JSON string payload, and saves it in `Client.m40PaymentsState`.
3. **Reactive Re-fetch**: When the client logs into their portal or the advisor refreshes the workspace view, `getClientTrackingAction` is called. It loads the parsed payments array and updates the client's progress bar and checklist.
4. **Interactive Checkout Checkboxes**: Either the advisor (from the terminal's execution tab) or the client (from the agenda tab) can toggle individual months. This calls `togglePaymentStatusAction(paymentIndex, status, clientId)`, which mutates the JSON payload in the database and pushes state changes reactively.

## 3. High-Density Viewport Constraints (No Scroll Mode)

To enable advisors and clients to view calculations, history, and breakdowns on standard desktop viewports without scrollbars:
* **Grid Split**: Responsive `grid grid-cols-1 lg:grid-cols-12 gap-4` layout. Left column (`lg:col-span-5`) handles inputs; right column (`lg:col-span-7`) handles results, PDF options, and saved histories.
* **Collapsible Details**: Accordion headers (`showAdvanced`, `showAsignaciones`) toggle local state to hide complex parameters when not in use.
* **Scrollable List Containers**: The saved simulations list is wrapped in an `overflow-y-auto max-h-[160px]` box with sticky headers so that table growth does not push the dashboard off the viewport.
* **Symmetric Input Alignment**: Both columns in the third input row contain matching label headers on top. The "Estatus Laboral" checkbox card is set to a fixed height of `h-[38px]` to match the date input field height, creating a clean horizontal line.
* **Balanced Button Grid**: Action buttons in the right column are laid out in a `grid grid-cols-1 sm:grid-cols-3 gap-2` to align the Save and PDF generation buttons as equal columns.
