# Mission Statement: B2B Actuarial Workstation (CRM to Engine Migration)

## Mission
To radically transform the passive client portfolio view ("Mi Portafolio") into an aggressive, active **B2B Actuarial Workstation**. The goal is to reduce the Advisor's Time-to-Action (TAT) per client from hours to minutes by automating data ingestion, enforcing legal compliance hard-stops (Article 150), and delivering a multi-scenario parallel calculation engine that culminates in a white-labeled PDF institutional dossier.

## Functional Scope (5-Epic Master Plan)

### Epic 1: Workspace UI/UX Transition
* **Objective:** Anchor the advisor to a specific client context without losing system vision.
* **Mechanism:** Add a CTA to "Ejecutar Análisis" in the CRM table. Render a dedicated `<Workspace />` layer (Drawer or specific route) that permanently sticks the target client's Hard Data (Name, Age, Weeks, Salary) to the top header for persistent context.

### Epic 2: M40 Multi-Scenario Engine (Parallelized)
* **Objective:** Allow advisors to compare deltas between distinct strategic paths instantly.
* **Mechanism:** Auto-ingest client data into the inputs. Display a 3-lane matrix allowing concurrent calculation of (e.g.) 1-Year, 3-Year, and 5-Year max-ceiling investments. Calculate not just the resulting pension, but the true **Financial ROI** (Total Investment vs. Months to Break Even).

### Epic 3: Vigencia de Derechos Hard-Stop (Art. 150 Legal Audit)
* **Objective:** Prevent malpractice suits by blocking calculations for individuals with expired pension rights.
* **Mechanism:** Interrogate `fecha_de_baja` and `total_semanas_cotizadas`. If the grace period (`total_semanas / 4`) has lapsed since the termination date, forcefully block the M40 modeling tools and output a critical Red Banner instructing the advisor that the client needs 52 weeks of re-activation.

### Epic 4: White-Label PDF Assembly (Sovereign Dossier)
* **Objective:** Hand the advisor a closing tool that carries their own branding identity, not the SaaS platform's.
* **Mechanism:** The PDF generator must fetch the advisor's `agencyName`, `agencyPhone`, and `agencyLogoUrl`. Inject the exact M40 ROI charts. Allow the advisor to write a custom "Rich Text" Executive Summary right before hitting Print/Download.

### Epic 5: Decentralized Document Ingestion (B2B2C Drop)
* **Objective:** Offload manual data-entry to the end client.
* **Mechanism:** Generate a secure, one-time payload link. The client uploads their IMSS PDF. Our existing parser extracts the exact weeks/salary and pushes it structurally into the IMSS CRM DB, notifying the advisor of the update.

## Anti-Objectives
* DO NOT destroy the standard B2C workflow; this Workstation is exclusively built for the `ADVISOR` and `ADMIN` roles surveying their `Client` records.
* DO NOT overcomplicate the Multi-Scenario UI with infinite tracks. Constrain it to 3 parallel columns maximum to ensure mobile and tablet responsiveness.
