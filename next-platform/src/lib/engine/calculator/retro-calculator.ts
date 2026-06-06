import { WageMovement } from '../ingestion/constancia-parser';

export interface ActuarialResult {
    averageSalary: number;
    totalDays: number; // Should be 1750
    hasGaps: boolean;
    isM40Active: boolean;
}

export class RetroCalculator {
    /**
     * Reconstructs the 250-week (1750 days) average salary history.
     */
    static calculate(movements: WageMovement[]): ActuarialResult {
        if (movements.length === 0) {
            return { averageSalary: 0, totalDays: 0, hasGaps: false, isM40Active: false };
        }

        // 1. Sort by date ascending to build periods
        const sorted = [...movements].sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateA.getTime() - dateB.getTime();
        });

        const isM40Active = movements.some(m => 
            m.employer.includes('CONTINUACION VOLUNTARIA') || 
            m.employer.includes('MODALIDAD 40')
        );

        // 2. Build segments [start, end, wage]
        const segments: { start: Date; end: Date | null; wage: number }[] = [];
        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const startDate = new Date(current.date.split('/').reverse().join('-'));
            
            // If it's a BAJA, it marks the end of the previous period (if same employer) or just a stop.
            // In SISEC, BAJA rows often have the same wage but mark the termination date.
            
            if (current.type === 'BAJA') {
                if (segments.length > 0) {
                    segments[segments.length - 1].end = startDate;
                }
                continue;
            }

            // For REINGRESO or MODIFICACION, start a new segment
            // Close previous segment if still open
            if (segments.length > 0 && !segments[segments.length - 1].end) {
                segments[segments.length - 1].end = startDate;
            }

            segments.push({
                start: startDate,
                end: null, // Open until next movement or "current"
                wage: current.dailyWage
            });
        }

        // 3. Process from latest to oldest until 1750 days reached
        let totalWeightedSalary = 0;
        let daysCounter = 0;
        const TARGET_DAYS = 1750;
        let hasGaps = false;

        // Iterate segments from latest to oldest
        for (let i = segments.length - 1; i >= 0 && daysCounter < TARGET_DAYS; i--) {
            const seg = segments[i];
            const start = seg.start;
            const end = seg.end || new Date(); // If null, assume active/vigente

            // Detect gap between this segment's end and next segment's start (already processed)
            if (i < segments.length - 1) {
                const nextSeg = segments[i + 1];
                const gapMs = nextSeg.start.getTime() - (seg.end?.getTime() || 0);
                if (gapMs > 86400000) { // > 1 day
                    hasGaps = true;
                }
            }

            const diffMs = end.getTime() - start.getTime();
            const segDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            
            if (segDays <= 0) continue;

            const daysToTake = Math.min(segDays, TARGET_DAYS - daysCounter);
            totalWeightedSalary += (seg.wage * daysToTake);
            daysCounter += daysToTake;
        }

        return {
            averageSalary: daysCounter > 0 ? totalWeightedSalary / daysCounter : 0,
            totalDays: daysCounter,
            hasGaps,
            isM40Active
        };
    }
}
