/**
 * m40-calculator.ts
 * Engine for exact calculation of Modalidad 40 (Continuación Voluntaria) payments.
 * Built according to ADR-031 and RED-018:
 * - Uses exact Gregorian days per month (no 30.4 averages).
 * - Applies progressive employer-employee quotas defined by the 2020 Social Security reform.
 * - Assumes the base salary (SBC) is frozen at the time of registration in MXN.
 */

// Progressive M40 rates as defined by law (assuming max cap profile)
export function getM40RateForYear(year: number): number {
    if (year <= 2022) return 0.10075;
    if (year === 2023) return 0.11166;
    if (year === 2024) return 0.12256;
    if (year === 2025) return 0.13347;
    if (year === 2026) return 0.14438;
    if (year === 2027) return 0.15528;
    if (year === 2028) return 0.16619;
    if (year === 2029) return 0.17709;
    return 0.18800; // 2030 and onwards plateau
}

// Exact Gregorian days in a month. JS Date(year, monthIndex, 0) gives the last day of the previous month.
// Since month is 1-indexed here (1=Jan, 12=Dec), year, month, 0 gives the last day of THAT month.
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

export interface M40MonthlyPayment {
    monthNumber: number; // 1-12
    monthName: string;
    year: number;
    daysInMonth: number;
    rateApplied: number;
    paymentMxn: number;
    isUmaAdjustmentMonth: boolean; // True for February (Month 2)
}

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Generates an array of future payment projections for the next N months.
 * @param dailySalaryMxn The frozen Daily Registered Salary in MXN
 * @param startYear The starting year for the projection
 * @param startMonth The starting month (1-12) for the projection
 * @param monthsToProject How many consecutive months to predict
 * @returns Array of payment objects
 */
export function generatePaymentCalendar(
    dailySalaryMxn: number,
    startYear: number,
    startMonth: number,
    monthsToProject: number = 6
): M40MonthlyPayment[] {
    const calendar: M40MonthlyPayment[] = [];
    let currentY = startYear;
    let currentM = startMonth;

    for (let i = 0; i < monthsToProject; i++) {
        const days = getDaysInMonth(currentY, currentM);
        const rate = getM40RateForYear(currentY);
        const payment = dailySalaryMxn * days * rate;

        calendar.push({
            monthNumber: currentM,
            monthName: MONTH_NAMES[currentM - 1],
            year: currentY,
            daysInMonth: days,
            rateApplied: rate,
            paymentMxn: payment,
            isUmaAdjustmentMonth: currentM === 2
        });

        // Roll over month/year
        currentM++;
        if (currentM > 12) {
            currentM = 1;
            currentY++;
        }
    }

    return calendar;
}
