# BLUE-025: Logic Flow for Universal Pension Projections

## 1. System Architecture
This blueprint maps the branching logic for the "Universal" simulation engine, ensuring that users under 60 and those with varying employment statuses receive accurate projections.

## 2. Logic Flow Diagram
```mermaid
graph TD
    Start["Simulation Start"] --> AgeCheck{"Age < 60?"}
    
    AgeCheck -- Yes --> EmpCheck{"Employed?"}
    AgeCheck -- No --> ImmCheck["Immediate Calculation Basis"]
    
    EmpCheck -- Yes --> Gain["Gain 52 Weeks/Year until 60/65"]
    EmpCheck -- No --> Freeze["Freeze Weeks / Observe Rights Decay"]
    
    Gain --> Projection["Project Salary Window (250 Weeks)"]
    Freeze --> Projection
    ImmCheck --> Projection
    
    Projection --> Strategy{"Apply Strategy?"}
    
    Strategy -- None --> ASIS["Baseline (Inercial) Output"]
    Strategy -- M40/Rampa --> TOBE["Optimization Output"]
    
    ASIS --> Compare["Dual Table Comparison"]
    TOBE --> Compare
```

## 3. Component Interaction
- **Dashboard Input**: Provides `age`, `weeks`, `salary_prom`, and `employment_status`.
- **Pension Engine**: Executes the recursive loop defined in `calculateProjection`.
- **PDF Generator**: Consumes dual data arrays to render the "Universal" comparison.
