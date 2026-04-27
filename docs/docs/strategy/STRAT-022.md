# STRAT-022: Universal Pension Longevity & Employment Adaptability

## 1. Context & Rationale
The current system focuses on users near retirement age (60+). To scale as a Sovereign SaaS, we must accommodate younger users (planning phase) and those with varying employment statuses (active vs. inactive), as their retirement roadmap differs drastically.

## 2. Strategic Objectives
- **Inclusivity**: Enable simulations for users from age 18 to 65.
- **Employment Awareness**: Differentiate between "Weeks Gain" (Employed) and "Weeks Frozen" (Unemployed) in baselines.
- **ROI Realism**: Adjust investment recovery calculations to include the "waiting period" for users < 60.

## 3. Implementation Tactics

### T1: The Universal Baseline (AS-IS)
The baseline for an under-60 user is not "zero", but their projected state at 60/65 based on their current rate:
- **Active Employment**: Gains 52 weeks/year until target age.
- **Inactive**: Weeks remain static, showing the "Forensic Decay" of their pension value.

### T2: Employment Lifecycle Toggles
Introduce a global state `employmentStatus` ('employed' | 'unemployed') that governs:
1. `is_ongoing_work` default value.
2. The automatic projection of the 250-week average salary window.

### T3: Young User Strategy (The Pledge)
For users < 55, focus on "Conservación de Derechos" and early Modalidad 40 planning rather than immediate ROI.

## 4. Success Metrics
- **Logic Parity**: Simulations for 45-year-olds must match official IMSS projection patterns for work continuity.
- **UI Clarity**: Explicit differentiation between "Current Status" and "Projection at Retirement".

## 5. Consensus State
**Status**: DRAFT (Awaiting Technical Implementation)
**ID**: STRAT-022
