/**
 * Core Logic for Administrative User Management.
 * Strictly deterministic, no side effects (DB, Network, UI).
 */

export interface DeletionEligibility {
    isEligible: boolean;
    reason?: string;
}

export class AdminLogic {
    /**
     * Determines if a user can be deleted based on platform invariants.
     * Rule 1: An admin cannot delete themselves.
     * Rule 2: (Placeholder) Protective checks for legacy or system accounts.
     */
    public static validateDeletion(targetId: string, currentAdminId: string): DeletionEligibility {
        if (targetId === currentAdminId) {
            return {
                isEligible: false,
                reason: "No puedes eliminar tu propia cuenta administrativa."
            };
        }

        // Add additional rules here (e.g., blocking deletion of certain roles if needed)
        
        return { isEligible: true };
    }
}
