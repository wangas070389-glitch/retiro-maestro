---
id: POST-010
title: The Pivot to B2B2C & The Advisor Primitive
status: published
date: 2026-02-26
tags: [post-mortem, business-model, scaling]
---

# The Pivot to B2B2C & The Advisor Primitive (POST-010)

## The Catalyst
The original architecture of Retiro Maestro assumed a purely B2C operation: a standard individual logging in, executing their own basic M40 mathematics, and generating a report. However, deep-dive user research and real-world market structures quickly revealed a fundamental flaw: **retirement planning is inherently an assisted service.** Users demand a human expert to validate the math, interpret the legal landscape, and provide fiduciary confidence.

## The Strategy Shift
Rather than trying to automate completely and replace the human consultant, the platform formally pivoted to a B2B2C model (STRAT-032). 
*   We recognized that the actual "Power User" of the system is the **Advisor**, not the retiree.
*   The system was re-architected to treat the mathematical engines (Thelma, M40 Simulator) as a computational SaaS backend for financial professionals.
*   We implemented a self-referential `ADVISOR` mapping mechanism (ADR-034) to allow a single tenant application to support multi-tenant portfolio segregation securely (RED-021).

## Lessons Learned
1.  **Software as leverage:** Attempting to sell complex pensions math directly to consumers incurs high support friction. Selling the *same* math to a professional who uses it to scale their own business creates immediate value alignment and a significantly higher Willingness to Pay (WTP).
2.  **Architectural Agility:** Because we had a strictly typed, modular Prisma schema and decentralized NextAuth sessions, pivoting from B2C to B2B2C did not require deploying a new application. We simply introduced a new `role` primitive and an `advisorId` self-reference.
3.  **Security at the Forefront:** The moment a user has access to *another* user's data, IDOR vulnerabilities become the primary threat vector. Implementing rigid `where: { advisorId: session.id }` checks natively into the server actions was deemed the single most critical structural defense.
