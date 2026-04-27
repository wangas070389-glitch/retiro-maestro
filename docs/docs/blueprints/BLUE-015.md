# BLUE-015: Deep Analysis Module Implementation

## Component Structure

```mermaid
graph TD
    Dashboard -->|Select Strategy| StrategyCards
    StrategyCards -->|Set Active Strategy| GlobalState(Zustand/Context)
    Dashboard -->|Observes State| StrategyModal
    
    subgraph StrategyModal
        Header(Strategy Title & Badge)
        Tabs(Gráfica | Tabla | ROI)
        
        subgraph Charts
            PensionGrowthChart(AreaChart)
            InvestigationFlowChart(BarChart)
        end
        
        subgraph Data
            AmortizationTable(Detailed Year-by-Year)
        end
    end
```

## Data Structure (Projection Item)

```typescript
interface ProjectionItem {
    year: number;          // e.g., 2026
    age: number;           // 61
    weeks: number;         // 1302
    salaryMonthly: number; // $75,000 (Topado)
    investmentCumulative: number; // $250,000
    pensionResult: number; // What the pension WOULD be if retired this year
}
```

## Implementation Steps

1.  **Engine Upgrade**: Add `calculateProjection()` to `PensionEngine`.
    -   Loop from `currentYear` to `targetYear`.
    -   Accumulate investment cost.
    -   Recalculate Pension for each step.
2.  **Dependencies**: `npm install recharts`.
3.  **UI Components**:
    -   `StrategyModal`: The container.
    -   `ProjectionChart`: The visualizer.
    -   `ProjectionTable`: The detailed breakdown.
4.  **Integration**: Connect `StrategyCards` button to open the Modal.
