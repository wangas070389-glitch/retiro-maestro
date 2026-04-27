import legalData from '../data/legal-anchors.json';
import { TaxEngine } from './fiscal/tax-engine';

export interface PensionInput {
  weeks: number;
  salary_prom: number;
  age: number;
  has_wife: boolean;
  children_count: number;
  dependent_parents_count: number;
  anchor_salary?: number; // Optional override for UMA/SMDF
  days_per_month?: number; // Optional override for monthly factor (default 30.416 or book's 30)
  inflation_percentage?: number; // Optional INPC adjustment (e.g. 10.22 for 1.1022)
  retirement_age?: number; // Target age for strategies (default 65)
  is_ongoing_work?: boolean; // Whether the user continues to work (gain weeks) until retirement
  last_termination_date?: string; // MANDATORY for B2C Art 150 checks
  children_data?: { age: number; is_studying: boolean }[]; // New: Granular validation
  aforeSaldos?: {
    retiro97: number;
    infonavit: number;
    cesantiaVejez?: number;
  };
}

export interface PensionResult {
  daily_base_cuantia: number;
  annual_base_cuantia: number;
  excess_years: number;
  annual_increment_total: number;
  adjusted_by_age: number;
  allowances: {
    wife: number;
    children: number;
    parents: number;
    solitude: number;
    total_percentage: number;
  };
  total_annual: number;
  total_monthly: number; // Raw Monthly
  with_decree_111: number; // Final Legally Payable (Base)
  with_inflation?: number; // Future Value (with INPC)
  age_penalty: number;
  capped_salary: number; // The actual salary used (after UMA 25 cap)
  tax_retained: number; // ISR Retained
  net_pension: number; // Final Net Monthly
}

export class PensionEngine {
  public calculate(input: PensionInput): PensionResult {
    const { weeks, salary_prom, age, has_wife, children_count, dependent_parents_count, anchor_salary, days_per_month, inflation_percentage } = input;

    // 1. Calculate Salary Multiplier (n) with Legal Caps
    const effective_anchor = anchor_salary || legalData.uma_2026;

    // RED-002 Mitigation: Cap registration salary at 25 UMAs as per IMSS law
    const capped_salary = Math.min(salary_prom, effective_anchor * 25);
    const n = capped_salary / effective_anchor;

    // 2. Find PCB and APCB from table
    const coefficients = legalData.cuantia_table.find(row => n >= row.min_n && n <= row.max_n)
      || legalData.cuantia_table[legalData.cuantia_table.length - 1];

    const pcb = coefficients.pcb;
    const apcb = coefficients.apcb;

    // 3. Calculate Excess Years (N_ex) with Physical Boundaries
    // RED-001/RED-008 Mitigation: Clamp weeks between 0 and a physical maximum (2700 weeks ~ 52 years)
    const validatedWeeks = Math.max(0, Math.min(2700, weeks));
    const weeks_ex = Math.max(0, validatedWeeks - 500);
    const raw_years_ex = weeks_ex / 52;
    let n_ex = Math.floor(raw_years_ex);
    const fraction = raw_years_ex - n_ex;

    // Rounding logic as per MATH-001 / Excel simulator
    if (fraction >= 0.25 && fraction < 0.5) {
      n_ex += 0.5;
    } else if (fraction >= 0.5) {
      n_ex += 1.0;
    }

    // 4. Base Calculation (Daily terms first for precision parity)
    // Use the capped_salary for calculation to prevent "hallucinated" pensions
    const daily_base = pcb * capped_salary;
    const daily_increment = (n_ex * apcb) * capped_salary;
    const daily_total_base = daily_base + daily_increment;

    const annual_base = daily_base * 365;
    const annual_increment_total = daily_increment * 365;
    const total_annual_base = daily_total_base * 365;

    // 5. Age Factor
    const age_key = Math.min(65, Math.max(60, age)).toString() as keyof typeof legalData.age_factors;
    const age_factor = legalData.age_factors[age_key] || 0.75;
    const adjusted_by_age = total_annual_base * age_factor;

    // 6. Allowances (Asignaciones)
    let wife_p = has_wife ? 0.15 : 0;
    
    // New validation for children assignment
    let children_p = 0;
    if (input.children_data && input.children_data.length > 0) {
      const validChildren = input.children_data.filter(c => {
        if (c.age < 16) return true;
        if (c.age >= 16 && c.age <= 25 && c.is_studying) return true;
        return false;
      });
      children_p = validChildren.length * 0.10;
    } else {
      children_p = children_count * 0.10; // Legacy fallback
    }

    let parents_p = 0;
    let solitude_p = 0;

    if (!has_wife && children_count === 0) {
      if (dependent_parents_count > 0) {
        parents_p = dependent_parents_count * 0.10;
      } else {
        solitude_p = 0.15;
      }
    }

    const total_allowance_p = wife_p + children_p + parents_p + solitude_p;
    const total_with_allowances = adjusted_by_age * (1 + total_allowance_p);

    // 7. Decree Factor (1.11)
    const total_with_decree = total_with_allowances * legalData.decree_factor;

    // 8. Monthly Normalization
    const effective_days_per_month = days_per_month || (365 / 12);
    // Note: The total_with_allowances is annual (SBC*365). 
    // To get monthly: (Total Daily) * 30.
    const total_daily = total_with_allowances / 365;
    const total_monthly = total_daily * effective_days_per_month;
    const with_decree = (total_with_decree / 365) * effective_days_per_month;

    // 9. Inflation Adjustment (Optional)
    const inflation_rate = (inflation_percentage || 0) / 100;
    const with_inflation = with_decree * (1 + inflation_rate);

    // 10. ISR Calculation (Tax) — delegated to canonical TaxEngine
    const taxInfo = TaxEngine.calculateISR(with_decree);

    return {
      daily_base_cuantia: daily_base,
      annual_base_cuantia: annual_base,
      excess_years: n_ex,
      annual_increment_total: annual_increment_total,
      adjusted_by_age: adjusted_by_age,
      allowances: {
        wife: wife_p,
        children: children_p,
        parents: parents_p,
        solitude: solitude_p,
        total_percentage: total_allowance_p
      },
      total_annual: total_with_allowances,
      total_monthly: total_monthly,
      with_decree_111: with_decree,
      with_inflation: with_inflation, // Validated Logic
      age_penalty: age_factor * 100,
      capped_salary: capped_salary,
      tax_retained: taxInfo.estimatedTax,
      net_pension: taxInfo.netPension
    };
  }



  /**
   * Generates a year-by-year projection of pension growth and investment cost.
   * Useful for "Deep Analysis" charts.
   * 
   * @param input Base input parameters (current state)
   * @param yearsToProject How many years into the future to simulate (default 5)
   * @param strategyMode 'modalidad40' (investing) or 'inercial' (stop paying)
   * @param investmentMonthlyAmount Amount paid monthly for Modalidad 40 (only used if strategyMode is 'modalidad40')
   * @param targetDailySalary The daily salary to contribute (Low for Rampa, Standard for Topado)
   * @param targetDailyHigh Optional: The high daily salary for the second stage (Rampa)
   * @param splitYear Optional: The year at which the registration shifts from targetDailySalary to targetDailyHigh
   */
  public calculateProjection(
    input: PensionInput,
    yearsToProject: number | null = null,
    strategyMode: 'modalidad40' | 'inercial' = 'modalidad40',
    investmentMonthlyAmount: number = 0,
    targetDailySalary?: number,
    targetDailyHigh?: number,
    splitYear?: number
  ): Array<{ year: number; age: number; weeks: number; investment: number; pension: number; roi: number; salaryProm: number; registeredSalary: number }> {
    const projection = [];
    let accumulatedInvestment = 0;
    const currentYear = new Date().getFullYear();

    // Determine simulation length
    const targetYears = yearsToProject !== null
      ? yearsToProject
      : Math.max(0, (input.retirement_age || 65) - input.age);

    for (let i = 0; i <= targetYears; i++) {
      // 1. Simulate Time Passing
      const simAge = input.age + i;
      // FIX: Only gain weeks if 'is_ongoing_work' is true, OR if strategy is 'modalidad40'
      const shouldGainWeeks = (strategyMode === 'modalidad40') || (input.is_ongoing_work !== false);
      const simWeeks = input.weeks + (shouldGainWeeks ? i * 52 : 0);

      // 2. Simulate Investment Cost
      if (i > 0 && strategyMode === 'modalidad40') {
        accumulatedInvestment += (investmentMonthlyAmount * 12);
      }

      // 3. Determine Registration Salary for this period (SBC)
      let simSBC = input.salary_prom;
      if (i > 0 && strategyMode === 'modalidad40') {
        if (targetDailyHigh && splitYear && i > splitYear) {
          simSBC = targetDailyHigh;
        } else {
          simSBC = targetDailySalary ?? input.salary_prom;
        }
      }

      // 4. Simulate Salary Average (Impacts Pension)
      // Shifting 250-week window logic
      let simSalaryProm = input.salary_prom;
      const investWeeks = Math.min(250, i * 52);
      const histWeeks = 250 - investWeeks;

      if (i > 0) {
        if (strategyMode === 'modalidad40') {
          // Dynamic Weighted Average considering the steps
          if (targetDailyHigh && splitYear && i > splitYear) {
            const highWeeks = Math.min(250, (i - splitYear) * 52);
            const lowWeeks = Math.min(Math.max(0, 250 - highWeeks), splitYear * 52);
            const histWeeksRemaining = Math.max(0, 250 - highWeeks - lowWeeks);
            simSalaryProm = ((targetDailyHigh * highWeeks) + (targetDailySalary! * lowWeeks) + (input.salary_prom * histWeeksRemaining)) / 250;
          } else if (targetDailySalary) {
            simSalaryProm = ((targetDailySalary * investWeeks) + (input.salary_prom * histWeeks)) / 250;
          }
        } else {
          // Inercial Mode: 
          // Whether the user keeps working at current salary or is unemployed,
          // the salary average remains the same mathematically.
          simSalaryProm = input.salary_prom;
        }
      }

      // 5. Run Calculation
      const simInput = {
        ...input,
        age: simAge,
        weeks: simWeeks,
        salary_prom: simSalaryProm
      };

      const result = this.calculate(simInput);
      const pensionMonthly = result.net_pension; // Return NET pension for parity with the Strategy Cards UI

      // 6. Calculate ROI
      const roi = pensionMonthly > 0 ? (accumulatedInvestment / pensionMonthly) : 0;

      projection.push({
        year: currentYear + i,
        age: simAge,
        weeks: simWeeks,
        investment: accumulatedInvestment,
        pension: pensionMonthly,
        roi: roi,
        salaryProm: simSalaryProm,
        registeredSalary: simSBC
      });
    }

    return projection;
  }

  /**
   * Projects a PensionInput into the future based on retirement age and continuity.
   * This ensures business logic remains in the Core, not the Edge.
   */
  public static projectInput(
    input: {
      age: number,
      weeks: number,
      retirement_age?: number,
      is_ongoing_work?: boolean
    },
    strategyMode: 'modalidad40' | 'inercial' = 'inercial'
  ): { age: number, weeks: number } {
    const currentAge = input.age;
    const targetAge = Math.max(currentAge, input.retirement_age || 0);
    const ageDiff = targetAge - currentAge;

    // RED-015: Only gain weeks if 'is_ongoing_work' is true, OR if strategy is 'modalidad40'
    const shouldGainWeeks = (strategyMode === 'modalidad40') || (input.is_ongoing_work !== false);

    return {
      age: targetAge,
      weeks: input.weeks + (shouldGainWeeks ? Math.floor(ageDiff * 52) : 0)
    };
  }

  /**
   * Calculates the theoretical maximum pension purely based on the 25 UMA ceiling.
   * Useful for UI hard-stops.
   */
  public maxPossiblePension(input: PensionInput): number {
    const yearsLeft = Math.max(0, (input.retirement_age || 65) - input.age);
    const projectedWeeks = input.weeks + (yearsLeft * 52); 

    // Test a hypothetical "ideal" scenario (Full 25 UMA registration until retirement)
    const idealInput: PensionInput = {
      ...input,
      salary_prom: (input.anchor_salary || legalData.uma_2026) * 25,
      age: input.retirement_age || 65, 
      weeks: projectedWeeks
    };
    
    const res = this.calculate(idealInput);
    return res.net_pension;
  }
}
