# MATH-010: Verification & Integrity Algorithms

## 1. The Integrity Checksum
To ensure that a Saved Simulation Record corresponds exactly to a specific set of inputs, we utilize a deterministic checksum.

$$ Hash_{sim} = SHA256(Input_{vector} || Timestamp || User_{ID}) $$

Where $Input_{vector}$ is the canonical JSON string of:
*   `weeks`
*   `salary_prom`
*   `age`
*   `strategy_type`

## 2. ROI Re-Verification
The server must re-calculate ROI to prevent client-side "Number Inflation".

$$ ROI_{server} = \frac{(Pension_{net} \times 12 \times Years_{expect}) - Investment_{total}}{Investment_{total}} \times 100 $$

*   **Constraint**: If $|ROI_{client} - ROI_{server}| > \epsilon$ (where $\epsilon = 0.01\%$), the save is flagged as **INVALID/TAMPERED**.

## 3. Storage Efficiency (Compression)
Given the potential for high frequency saves, we estimate storage growth:

$$ Size_{row} \approx 2kb_{json} + 0.5kb_{meta} $$
$$ Capacity_{1M} = 1,000,000 \times 2.5kb \approx 2.5 GB $$

*   **Conclusion**: Postgres native handling is sufficient. No compression needed for first 1M records.

## 4. The "Mirror Test" (Database vs Engine)
Periodically, a background job (The Sentinel, see STRAT-005) re-runs the logic on stored records.

$$ \forall r \in DB : Engine(r.input) == r.output $$

This ensures that code updates (e.g., changing UMA value) do not silently invalidate historical records without migration/versioning.
