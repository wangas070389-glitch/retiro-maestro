'use client';

interface DataPoint {
    year: number;
    age: number;
    weeks: number;
    salaryProm: number;
    registeredSalary: number;
    investment: number;
    pension: number;
    roi: number;
}

interface Props {
    data: DataPoint[];
}

export function ProjectionTable({ data }: Props) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
                    <tr>
                        <th className="px-4 py-3">Año</th>
                        <th className="px-4 py-3">Edad</th>
                        <th className="px-4 py-3">Semanas</th>
                        <th className="px-4 py-3 text-right">Salario Diario</th>
                        <th className="px-4 py-3 text-right">Salario Prom.</th>
                        <th className="px-4 py-3 text-right">Inversión Acum.</th>
                        <th className="px-4 py-3 text-right">Pensión Mensual</th>
                        <th className="px-4 py-3 text-right">ROI (Meses)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{row.year}</td>
                            <td className="px-4 py-3 text-slate-600">{row.age}</td>
                            <td className="px-4 py-3 text-slate-600">{row.weeks}</td>
                            <td className="px-4 py-3 text-right text-indigo-500 font-bold">
                                ${row.registeredSalary.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500 font-mono">
                                ${row.salaryProm.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-amber-700">
                                ${row.investment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-indigo-700">
                                ${row.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                                {row.roi > 0 ? Math.ceil(row.roi) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
