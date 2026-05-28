import { PensionEngine } from './pension-engine.ts';
import type { PensionInput } from './pension-engine.ts';
import legalData from '../data/legal-anchors.json' with { type: 'json' };

export interface InverseResult {
  targetMonthly: number;
  requiredSBC: number;
  investmentMonths: number;
  totalInvestment: number;
  isViable: boolean;
  message: string;
}

export class InverseDesigner {
  private engine: PensionEngine;

  constructor() {
    this.engine = new PensionEngine();
  }

  /**
   * Goal-Seeker: Finds the required Daily Salary (SBC) to reach a target Net Pension.
   * Uses a binary search over the salary range (0 to 25 UMAS).
   */
  public solveForTarget(input: PensionInput, targetNetMonthly: number, investmentMonths: number = 60): InverseResult {
    const uma25 = (input.anchor_salary || legalData.uma_2026) * 25;
    
    // 1. Binary Search Configuration
    let low = 0;
    let high = uma25;
    let bestSBC = 0;
    let currentPension = 0;
    let iterations = 0;

    const projection = PensionEngine.projectInput(input, 'modalidad40');
    const m40_rate = 0.12256; 
    
    // 2. Convergence Loop (Threshold: $10 MXN or 15 iterations)
    while (iterations < 15) {
      const midSBC = (low + high) / 2;
      
      // Calculate projected average for this test SBC
      const investWeeks = Math.floor((investmentMonths / 12) * 52);
      const histWeeks = 250 - Math.min(250, investWeeks);
      const projectedSalaryProm = ((midSBC * Math.min(250, investWeeks)) + (input.salary_prom * histWeeks)) / 250;
      
      const result = this.engine.calculate({
        ...input,
        age: projection.age,
        weeks: projection.weeks,
        salary_prom: projectedSalaryProm
      });
      
      currentPension = result.net_pension;
      
      if (Math.abs(currentPension - targetNetMonthly) < 10) {
        bestSBC = midSBC;
        break;
      }
      
      if (currentPension < targetNetMonthly) {
        low = midSBC;
      } else {
        high = midSBC;
      }
      
      bestSBC = midSBC;
      iterations++;
    }

    const totalInvestment = bestSBC * m40_rate * 30.416 * investmentMonths;
    const isViable = currentPension >= targetNetMonthly * 0.95;

    return {
      targetMonthly: targetNetMonthly,
      requiredSBC: bestSBC,
      investmentMonths,
      totalInvestment,
      isViable,
      message: isViable 
        ? `Meta alcanzable con un salario de $${Math.round(bestSBC).toLocaleString()} MXN.`
        : `Meta no alcanzable (Máximo posible: $${Math.round(currentPension).toLocaleString()} MXN).`
    };
  }
}
