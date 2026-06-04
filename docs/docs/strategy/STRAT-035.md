# STRAT-035: High Density Viewport Optimization and Advisor CRM Product Strategy

This document outlines the product strategy and UX principles applied to the main client/advisor dashboard, detailing how the platform balances visual density with usability.

## 1. Product Positioning: B2B2C Advisor CRM

With the introduction of B2B2C licensing, professional financial advisors are the primary users. Their workflow demands:
* **High Information Density**: The ability to view input parameters, calculations, projections, and simulation history side-by-side without vertical scrolling.
* **Immediate Context Transitions**: Moving from a client profile list to a client-specific workspace, altering parameters, and downloading PDFs in under 3 clicks.
* **Cohesive Dual-Persona UI**: The dashboard must serve both standard citizens (who want clean, digestible numbers) and professional advisors (who require granular configuration controls).

## 2. UX Optimization Decisions (No-Scroll Mode)

To achieve the "No-Scroll" layout requirement on standard desktop viewports (1920x1080 and 1366x768):

1. **Collapsible Complexity**: Accordions hide "Opciones Avanzadas" and "Asignaciones Familiares" under a single line toggle. This keeps the default form height under `400px` while allowing granular customization.
2. **Symmetric Input Grid**:
   - Organized inputs into a 2-column layout (`grid-cols-2 gap-3`).
   - Aligned the "Fecha de Baja" and "Estatus Laboral" row. Putting a label header on top of the status checkbox card and matching its height to `h-[38px]` aligns both fields perfectly.
3. **Responsive 2-Column Split**:
   - Left side contains input fields (width `lg:col-span-5`).
   - Right side contains outputs (width `lg:col-span-7`), ensuring that the primary calculation and its breakdown are visible simultaneously.
4. **Equal Action Button Sizes**:
   - The primary actions (Guardar Estudio, Brief PDF, and Comprehensive PDF) are aligned inside a `grid-cols-1 sm:grid-cols-3 gap-2` container.
   - This prevents uneven spacing and matches the button heights to `h-[38px]`, aligning them symmetrically.
5. **Defined Heights for Tables**:
   - The "Mis Estudios" simulation history is capped at `max-h-[160px] overflow-y-auto`.
   - Table headers are styled as `sticky top-0 z-10 bg-slate-50` with a subtle shadow, ensuring that table scroll does not expand the parent card.
