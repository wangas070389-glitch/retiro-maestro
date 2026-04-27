'use client';

import { FlaskConical, Scale, Clock, CreditCard, Users } from 'lucide-react';
import { useState } from 'react';

// Copied from prototype
const Badge = ({ children, type = "success" }: { children: React.ReactNode, type?: "success" | "warning" | "danger" | "neutral" | "blue" | "purple" }) => {
    const colors = {
        success: "bg-green-100 text-green-700 border border-green-200",
        warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        danger: "bg-red-50 text-red-700 border border-red-200",
        neutral: "bg-gray-100 text-gray-700 border border-gray-200",
        blue: "bg-blue-50 text-blue-700 border border-blue-200",
        purple: "bg-purple-50 text-purple-700 border border-purple-200",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${colors[type]}`}>
            {children}
        </span>
    );
};

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
        {children}
    </div>
);

export default function LaboratoryPage() {
    const [pensionForTax, setPensionForTax] = useState(65000);
    const [retroactiveMonths, setRetroactiveMonths] = useState(24);
    const [toolSpouse, setToolSpouse] = useState(true);
    const [toolChildren, setToolChildren] = useState(0);

    const UMA_MENSUAL = 117.31 * 30.4;
    const EXENCION_ISR_UMAS = 15;

    // Tax Logic
    const exemptionAmount = UMA_MENSUAL * EXENCION_ISR_UMAS;
    const taxableIncome = Math.max(0, pensionForTax - exemptionAmount);
    let estimatedTax = 0;
    if (taxableIncome > 0) {
        if (taxableIncome < 10000) estimatedTax = taxableIncome * 0.10;
        else if (taxableIncome < 20000) estimatedTax = 1000 + (taxableIncome - 10000) * 0.15;
        else estimatedTax = 3500 + (taxableIncome - 20000) * 0.30;
    }
    const netPension = pensionForTax - estimatedTax;

    // Retroactive Logic
    const monthlyPayment2024 = 8500;
    const retroCost = monthlyPayment2024 * retroactiveMonths;
    const surcharges = retroCost * 0.35;
    const totalRetroPayment = retroCost + surcharges;
    const weeksGained = Math.floor(retroactiveMonths * 4.3);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <FlaskConical size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">The Laboratory</h1>
                    <p className="text-slate-500">Advanced simulation tools and reverse engineering.</p>
                </div>
            </div>

            {/* TAX CALCULATOR */}
            <Card className="border-l-4 border-l-red-500">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Scale className="text-red-600" size={20} />
                            Calculadora de Impuestos (ISR)
                        </h3>
                        <p className="text-sm text-slate-500">Las pensiones mayores a 15 UMAS ({Math.floor(exemptionAmount).toLocaleString()} MXN) pagan impuestos.</p>
                    </div>
                    <Badge type="danger">Fiscal 2026</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pensión Mensual Estimada</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="30000"
                                max="100000"
                                step="1000"
                                value={pensionForTax}
                                onChange={(e) => setPensionForTax(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                aria-label="Pension Mensual Estimada"
                            />
                            <span className="font-bold text-slate-800 w-24 text-right">${pensionForTax.toLocaleString()}</span>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Monto Exento (15 UMAS)</span>
                                <span className="font-medium text-green-600">-${exemptionAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Base Gravable</span>
                                <span className="font-medium">${taxableIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center">
                        <p className="text-xs text-slate-500 font-bold mb-1">Impuesto a Retener (Aprox)</p>
                        <p className="text-2xl font-bold text-red-600">-${estimatedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>

                        <div className="w-full h-px bg-slate-200 my-3"></div>

                        <p className="text-xs text-slate-500 font-bold mb-1">Pensión Neta a Recibir</p>
                        <p className="text-3xl font-bold text-green-700">${netPension.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
            </Card>

            {/* Retroactivo */}
            <Card className="border-l-4 border-l-purple-500">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="text-purple-600" size={20} />
                            Calculadora Retroactiva
                        </h3>
                        <p className="text-sm text-slate-500">Paga meses pasados y recupera semanas.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">Meses sin cotizar: {retroactiveMonths}</label>
                        <input
                            type="range"
                            min="0" max="58"
                            value={retroactiveMonths}
                            onChange={(e) => setRetroactiveMonths(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            aria-label="Meses sin cotizar"
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">Pago Ãšnico (+Recargos)</p>
                        <p className="text-2xl font-bold text-slate-800">${totalRetroPayment.toLocaleString()}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-xs text-purple-600 mb-1">Ganancia Inmediata</p>
                        <p className="text-sm font-medium text-purple-800">+ {weeksGained} Semanas</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Simulator */}
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <CreditCard className="text-indigo-600" size={20} />
                        Simulador de Préstamo
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded">
                            <span className="text-slate-600">Monto del Préstamo</span>
                            <span className="font-bold">$400,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-green-50 text-green-700 rounded border border-green-200">
                            <span className="font-medium">Se paga con tu retroactivo de Afore</span>
                            <span className="font-bold text-xs bg-white px-2 py-0.5 rounded border border-green-200 text-green-700">VIABLE</span>
                        </div>
                    </div>
                </Card>

                {/* Family Simulator */}
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Users className="text-indigo-600" size={20} />
                        Simulador Familiar
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700 text-sm">Esposa / Concubina</p>
                            </div>
                            <button
                                onClick={() => setToolSpouse(!toolSpouse)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${toolSpouse ? 'bg-green-500' : 'bg-slate-300'}`}
                                aria-label="Toggle Spouse"
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${toolSpouse ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700 text-sm">Hijos (Menores/Estudiantes)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setToolChildren(Math.max(0, toolChildren - 1))} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold">-</button>
                                <span className="font-bold text-slate-800 w-4 text-center">{toolChildren}</span>
                                <button onClick={() => setToolChildren(Math.min(5, toolChildren + 1))} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold">+</button>
                            </div>
                        </div>

                        <div className="p-3 bg-indigo-50 rounded-lg text-center mt-2">
                            {(() => {
                                const factorBase = 1.11;
                                const factorSpouse = toolSpouse ? 0.15 : 0;
                                const factorChildren = toolChildren * 0.10;
                                const factorSoledad = (!toolSpouse && toolChildren === 0) ? 0.15 : 0;
                                const totalFactor = factorBase * (1 + factorSpouse + factorChildren + factorSoledad);
                                return (
                                    <>
                                        <p className="text-xs text-indigo-600 mb-1">Factor Total de Pensión</p>
                                        <p className="text-xl font-bold text-indigo-800">x {totalFactor.toFixed(4)}</p>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
