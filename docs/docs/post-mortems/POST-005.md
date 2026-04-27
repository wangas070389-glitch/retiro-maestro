---
id: POST-005
title: Preventive UX Audit of Ingestion Friction
status: ACTIVE
date: 2026-02-23
domain: System Resilience
protocol: P100 (Reflection)
---

# POST-005: Preventive UX Audit of Ingestion Friction

## Background
We are migrating from hardcoded or dummy state injection to actual PDF parsing (`HeuristicParser`). Historically, adding PDF parsing introduces massive User Friction due to OCR errors, regex failures, and opaque error messages ("Invalid File").

## The Identified Friction Scenarios
1. **The Silent Fail**: The parser extracts bad data, doesn't tell the user, and the projection calculates with incorrect base numbers, destroying trust (M-1).
2. **The Hard Wall**: The parser fails to extract one field (e.g., CURP) and blocks the entire funnel, stranding the user.

## The Preventive Solution (Applied in ADR-026 & BLUE-027)
Instead of treating extraction as a "Pass/Fail" backend job, we treat it as an interactive client-side loop.

1. **Contextual Disclosure**: Show the user exactly *what* we extracted.
2. **Confidence Grading**: Instead of failing silently, the `SentinelAuditor` generates a mathematically grounded confidence score (`0.0` to `1.0`). 
3. **Graceful Degradation**: If confidence is `< 0.65`, we shift into "Manual Override Mode". We highlight the missing/failed fields in RED and provide inline hints drawn directly from the `SentinelAuditor.recommendations`. The user can simply type the correct value and proceed.

## Conclusion
By surfacing the audit logic directly into the UI layer (Kinetic Feedback), we build trust ("The system is checking my data carefully") rather than frustration ("The system is broken").
