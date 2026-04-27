# MATH-013: ROI Visualization Scale & Interpolation

## 1. Objective
To provide a deterministic method for scaling and interpolating the "Wealth Accumulation" and "Pension Growth" curves in the UI, ensuring that visual slopes accurately represent actuarial deltas.

## 2. Linear Interpolation for Chart Smoothing
Given a projection of $N$ discrete years (typically $n=1 \dots 6$), the UI chart must interpolate values to create "Smooth Monotone Curves."

For any point $t$ between year $i$ and year $i+1$:
$$V(t) = V_i + (V_{i+1} - V_i) \cdot \frac{t - t_i}{t_{i+1} - t_i}$$

Where:
* $V$ is the property (Pension or Investment stack).
* $t$ is the normalized time coordinate.

## 3. ROI Breakeven Scaling
The chart's X-Axis is anchored at the "Projected Retirement Age" ($Age_R$). The ROI Breakeven point ($T_{be}$) is calculated as:
$$T_{be} = \frac{Inv_{total}}{\Delta Pension_{monthly}}$$

In the UI visualizer, the intersection of the "Investment" line and the "Accumulated Pension Benefit" line must align mathematically with $T_{be}$ months post-retirement.

## 4. Visual Normalization
To prevent "Scale Flatness" when comparing a \$10k pension against a \$500k investment, the chart uses a dual-axis or a normalized scale where $MAX(Y)$ is defined as:
$$Y_{max} = MAX(Inv_{total}, \sum_{n=1}^{10} Pension_n) \cdot 1.10$$

---
**Status**: FORMALIZED
**ID**: MATH-013
