---
id: MATH-014
title: Protocol 17 Temporal Boundary Calibrations
status: ACTIVE
date: 2026-02-23
domain: Actuarial Logic
protocol: P2 (Mathematical Proof)
---

# MATH-014: Protocol 17 Temporal Boundary Calibrations

## 1. Context
During Forensic Ingestion, `SentinelAuditor` calculates boundary limits to verify the physical possibility of the extracted data. This Math document defines the boundaries for the "Temporal Consistency Check".

## 2. Derivations

### 2.1 Age Derivation
Given `DOB (Date of Birth)`, the user's current physical age is:
$$Age = CurrentYear - BirthYear - \Delta_{month/day}$$
Where $\Delta = 1$ if the current date is strictly before the anniversary of the birth date within the current year, else 0.

### 2.2 Maximum Contributory Weeks Limit ($W_{max}$)
The IMSS allows legal labor starting at age 14 (under specific historical circumstances). 
The theoretical maximum weeks a person could have contributed is bounded by the time elapsed between their 14th birthday and the present day.

Let $WeeksPerYear \approx 52.14$.
$$W_{max} = (Age - 14) \times 52.14$$

If extracted weeks $W_e > W_{max}$, the extraction is logically invalid, triggering a `CRITICAL: Temporal Impossibility` flag.

### 2.3 NSS Temporal Alignment
The Mexican Social Security Number (NSS) contains the year the worker was first registered at the IMSS in digits 3 and 4.
Format: `AA BB CC DDDD E`
- `BB` = Year of registration.

Let $Y_{reg} = \text{Registration Year (derived from BB)}$.
Let $Y_{birth} = \text{Birth Year (derived from DOB)}$.

Constraint for Ley 73:
$$Y_{reg} \ge (Y_{birth} + 14)$$

*Note: Due to edge cases in century crossover (NSS digits are modulo 100), simple heuristics are applied (e.g., if $Y_{reg} < Y_{birth}$ and $Y_{reg} > 40$, it's a conflict).*
