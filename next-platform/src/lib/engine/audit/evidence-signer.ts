import { PensionInput } from '../pension-engine';

export interface EvidenceTuple {
    formula_id: string;
    anchor_hash: string;
    input_state: PensionInput;
    timestamp: string;
}

export class EvidenceSigner {
    /**
     * Generates a SHA-256 hash for a given evidence tuple.
     * This implements the logic defined in ADR-004 and MATH-004.
     */
    static async sign(tuple: EvidenceTuple): Promise<string> {
        const serialized = JSON.stringify({
            f: tuple.formula_id,
            a: tuple.anchor_hash,
            i: tuple.input_state,
            t: tuple.timestamp
        });

        const msgBuffer = new TextEncoder().encode(serialized);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

    /**
     * Verifies if a given signature matches the evidence tuple.
     */
    static async verify(tuple: EvidenceTuple, signature: string): Promise<boolean> {
        const expected = await this.sign(tuple);
        return expected === signature;
    }
}
