# BLUE-016: Report Architecture

## Data Flow
`Dashboard (State)` -> `PDFGenerator (Component)` -> `PDFDownloadLink` -> `Blob`

## Document Structure (A4)
1.  **Page 1: Executive Summary**
    -   Header: "Retiro Maestro - Informe Soberano"
    -   Client Profile: Name, Age, Weeks.
    -   Top 3 Strategies Comparison (Card View equivalent).
    -   Recommendation Badge.

2.  **Page 2: Deep Analysis (Selected Strategy)**
    -   Growth Chart (Re-implemented as SVG paths or Image snapshot if complex).
    -   Amortization Table (Year 1-5).
    -   ROI & Breakeven Analysis.

3.  **Page 3: Legal Foundation**
    -   Citations of Law 73.
    -   Disclaimer.

## Components
-   `ReportDocument`: Root.
-   `ReportHeader`: Branding.
-   `StrategySection`: Dynamic layout.
-   `AmortizationTable`: Row-based flex layout.

## Styling
-   We will loosely mirror the "Deep Blue" theme but optimized for white paper printing (Black text, Blue headers).
