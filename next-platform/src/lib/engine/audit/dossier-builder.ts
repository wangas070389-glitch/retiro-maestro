import anchors from '../../data/legal-anchors.json';
import { useLedgerStore } from '../../../store/ledger';
import { EvidenceSigner } from './evidence-signer';

export interface ForensicBundle {
    version: string;
    generated_at: string;
    anchors_snapshot: typeof anchors;
    projections: any[];
    integrity_hash?: string;
    formula_manifest: {
        pcb_definition: string;
        apcb_definition: string;
        legal_basis: string;
    };
}

export class DossierBuilder {
    /**
     * Compiles all current ledger entries and the active legal anchors into a 
     * self-contained Forensic Bundle (CJFB).
     */
    static async buildBundle(): Promise<ForensicBundle> {
        const entries = useLedgerStore.getState().entries;
        return this.createBundle(entries);
    }

    /**
     * Creates a bundle for a single ad-hoc projection.
     * Useful for sealing reports before they are saved.
     */
    static async buildAdHocBundle(projection: Record<string, unknown>): Promise<ForensicBundle> {
        return this.createBundle([projection]);
    }

    private static async createBundle(projections: any[]): Promise<ForensicBundle> {
        const bundle: ForensicBundle = {
            version: "1.0.0",
            generated_at: new Date().toISOString(),
            anchors_snapshot: anchors,
            projections: projections,
            formula_manifest: {
                pcb_definition: "Porcentaje de Cuantía Básica (Art. 167 LSS 73)",
                apcb_definition: "Asignación por Cuantía Básica (Incremento Anual)",
                legal_basis: "Ley del Seguro Social 1973, Artículos 167, 168 y 171"
            }
        };

        bundle.integrity_hash = await this.generateIntegrityHash(bundle);
        return bundle;
    }

    /**
     * Generates a SHA-256 hash of the entire bundle content (excluding the hash field).
     */
    private static async generateIntegrityHash(bundle: ForensicBundle): Promise<string> {
        const content = JSON.stringify({
            v: bundle.version,
            t: bundle.generated_at,
            a: bundle.anchors_snapshot,
            p: bundle.projections,
            m: bundle.formula_manifest
        });

        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Verifies the integrity of a forensic bundle and its internal signatures.
     */
    static async verifyBundle(bundle: ForensicBundle): Promise<{ valid: boolean; results: any[] }> {
        // 1. Check Bundle Integrity Hash
        const currentHash = await this.generateIntegrityHash(bundle);
        if (currentHash !== bundle.integrity_hash) {
            return { valid: false, results: [{ type: 'bundle', message: 'Bundle integrity hash mismatch' }] };
        }

        const results = await Promise.all(bundle.projections.map(async (entry) => {
            // RED-015 Mitigation: Handle unsealed or legacy projections gracefully
            if (!entry?.tuple || !entry?.signature) {
                return {
                    id: entry?.id || 'unknown',
                    valid: false,
                    message: 'Missing forensic signature'
                };
            }
            const isValid = await EvidenceSigner.verify(entry.tuple, entry.signature);
            return {
                id: entry.id,
                valid: isValid,
                amount: entry.pension_amount
            };
        }));

        return {
            valid: results.every(r => r.valid),
            results
        };
    }
}
