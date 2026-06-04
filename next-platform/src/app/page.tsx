'use client';

import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import {
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Calculator,
    LineChart as LineChartIcon,
    ChevronDown,
    CheckCircle2,
    Lock,
    UserCircle2,
    HelpCircle,
    Building2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useState } from 'react';

const font = Plus_Jakarta_Sans({ subsets: ['latin'] });

const chartData = [
    { age: '60', base: 12500, optimizada: 12500 },
    { age: '61', base: 13200, optimizada: 28500 },
    { age: '62', base: 14100, optimizada: 45000 },
    { age: '63', base: 15000, optimizada: 62000 },
    { age: '64', base: 16200, optimizada: 78500 },
    { age: '65', base: 17500, optimizada: 85500 },
];

export default function LandingPage() {
    return (
        <main className={`flex min-h-screen flex-col relative bg-slate-50 text-slate-900 ${font.className} selection:bg-indigo-500/30`}>

            {/* Soft background grid for institutional feel */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#slate-200_1px,transparent_1px),linear-gradient(to_bottom,#slate-200_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.03] pointer-events-none"></div>

            {/* Header */}
            <header className="w-full relative z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center p-4 lg:px-8">
                    <div className="flex items-center space-x-2 cursor-pointer select-none">
                        <span className="text-2xl font-bold tracking-tighter text-slate-900">
                            Retiro<span className="text-indigo-600">Maestro</span>
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/register?role=advisor" className="hidden md:flex text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                            ¿Eres Asesor? Activa tu Portal
                        </Link>
                        <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link href="/register" className="hidden sm:flex text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            Crear Cuenta Libre
                        </Link>
                    </nav>
                </div>
            </header>

            {/* 1. HERO SECTION */}
            <section className="relative z-10 pt-20 pb-32 px-4 overflow-hidden">
                <div className="absolute top-0 right-1/4 -translate-y-12 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-[120px] opacity-40 -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/4 translate-y-24 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[100px] opacity-40 -z-10 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold mb-8 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Actualizado con UMA 2026 y Ley 73
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1] text-slate-900">
                        Maximiza tu pensión del IMSS con <span className="text-indigo-600">estrategia y datos.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        La Modalidad 40 es el esquema que permite aumentar tu pensión antes de retirarte. Simula, proyecta tu pensión futura y toma decisiones financieras informadas antes de invertir un solo peso.
                    </p>

                    {/* Fast Bullets */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 mb-12 text-sm font-semibold text-slate-700">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Cálculo Ley 73 Exacto</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Simulador Multi-Escenario</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Proyección Mensual</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0 mb-4">
                        <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group text-lg">
                            Calcular mi pensión ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#como-funciona" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-sm">
                            <Calculator className="w-5 h-5 text-indigo-600" />
                            ¿Cómo funciona M40?
                        </a>
                    </div>

                    <p className="text-sm text-slate-500 font-bold mb-8 opacity-80">Sin tarjeta. Sin compromiso. Resultado inmediato.</p>

                    {/* Social Proof Mini */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">RC</div>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-400">ML</div>
                            <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-500">+</div>
                        </div>
                        <span className="text-sm font-bold">Más de 1,200 simulaciones precisas realizadas</span>
                    </div>
                </div>
            </section>

            {/* 2. EL PROBLEMA (Agitation) */}
            <section className="bg-slate-950 text-white py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 text-rose-400">
                        Cada año sin estrategia puede reducir tu pensión futura.
                    </h2>
                    <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Tomar una mala decisión en Modalidad 40 puede costarte cientos de miles de pesos en tu retiro. Pero <strong className="text-white">una estrategia correcta puede multiplicar tu pensión mensual.</strong> Retiro Maestro elimina las dudas con matemáticas precisas.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <HelpCircle className="w-8 h-8 text-rose-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">¿Perderé dinero?</h3>
                            <p className="text-slate-400 text-sm">Descubre el Retorno de Inversión (ROI) exacto en meses de tu aportación voluntaria.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <Building2 className="w-8 h-8 text-amber-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">¿Ley 73 o Ley 97?</h3>
                            <p className="text-slate-400 text-sm">Valida tus derechos institucionales en el IMSS y tu viabilidad de maximización.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                            <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">¿A los 60 o a los 65?</h3>
                            <p className="text-slate-400 text-sm">Compara lado a lado cuánto recibirás dependiendo del porcentaje por edad de retiro.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 & 4. EDUCATIONAL & HOW IT WORKS */}
            <section id="como-funciona" className="py-24 px-4 bg-white relative">
                <div className="max-w-7xl mx-auto">

                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-6">Reducimos la incertidumbre <span className="text-indigo-600">al mínimo.</span></h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Reemplazamos la especulación con cálculos actuariales auditables. Así es como perfilamos tu futura pensión:
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-2xl font-bold text-indigo-600">1</div>
                            <h3 className="font-bold text-slate-900 text-lg mb-3">Semanas Cotizadas</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Ingresas tu historial de semanas reconocidas por el IMSS. A mayor número, mejor pensión.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm text-2xl font-bold text-indigo-600">2</div>
                            <h3 className="font-bold text-slate-900 text-lg mb-3">Salario Base</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Cargamos tu salario promedio de las últimas 250 semanas para fijar tu línea base actual.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-indigo-600 border border-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20 text-2xl font-bold text-white">3</div>
                            <h3 className="font-bold text-slate-900 text-lg mb-3">Simulas Escenarios</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Juegas con el motor: ¿Qué pasa si pago M40 un año topado? ¿Dos años? Tú decides.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-emerald-500 border border-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 text-2xl font-bold text-white">4</div>
                            <h3 className="font-bold text-slate-900 text-lg mb-3">Proyección Actuarial Precisa</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Obtienes la cifra mensual neta que el IMSS te depositaría de por vida. Claridad total.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. VISUALIZATION (THE HOOK) */}
            <section className="py-24 px-4 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

                    <div className="order-2 lg:order-1 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-100 relative">
                        <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                            Diferencia: +$68,000 MXN / mes
                        </div>
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <LineChartIcon className="w-5 h-5 text-indigo-600" />
                            Impacto del Modelo Óptimo (Ejemplo real)
                        </h3>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOptimo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="age" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip
                                        formatter={(value: number | undefined) => [`$${Number(value ?? 0).toLocaleString()}`, '']}
                                        labelFormatter={(label) => `Edad de retiro: ${label} años`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" name="Pensión Base" dataKey="base" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorBase)" />
                                    <Area type="monotone" name="Con M40" dataKey="optimizada" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorOptimo)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-6 mt-6 justify-center text-sm font-semibold">
                            <div className="flex items-center gap-2 text-slate-500"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Pensión Base Original</div>
                            <div className="flex items-center gap-2 text-indigo-700"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> Pensión Maximizada (M40)</div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-6">El poder visual <span className="text-indigo-600">a tu favor.</span></h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            No te quedes con la duda. Un solo gráfico te revelará la enorme diferencia entre retirarte inercialmente y retirarte usando al máximo la continuación voluntaria (Modalidad 40).
                        </p>

                        <ul className="space-y-4 mb-10">
                            <li className="flex items-start gap-3">
                                <div className="p-1 bg-emerald-100 rounded mt-0.5"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                                <div>
                                    <strong className="block text-slate-900">Validación instantánea</strong>
                                    <span className="text-slate-600 text-sm">Convéncete tú mismo del retorno financiero de la inversión.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-1 bg-emerald-100 rounded mt-0.5"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                                <div>
                                    <strong className="block text-slate-900">Escenarios múltiples</strong>
                                    <span className="text-slate-600 text-sm">Calcula retiros a los 60, 60.5, 62 o 65 años con un clic.</span>
                                </div>
                            </li>
                        </ul>

                        <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 mt-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 w-full sm:w-auto text-lg group">
                            Quiero ver mi diferencia
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                </div>
            </section>

            {/* 6 & 8. PRICING & TRUST */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">

                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Planes Claros, <span className="text-indigo-600">Sin Letras Chicas</span></h2>
                        <p className="text-lg text-slate-600">Un pago único. Acceso ilimitado a simulaciones precisas.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

                        {/* Plan Básico */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Cuenta Libre</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">$0 <span className="text-sm text-slate-500 font-medium">MXN</span></div>
                            <p className="text-sm text-slate-600 mb-8 flex-1">Perfecto para conocer tu pensión base proyectada sin Mod 40.</p>
                            <ul className="space-y-3 mb-8 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Registro seguro (cero Spam)</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ingreso de semanas base</li>
                                <li className="flex items-center gap-2 text-slate-400"><Lock className="w-4 h-4" /> Simulación de Tope Salarial M40</li>
                            </ul>
                            <Link href="/register" className="w-full text-center py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors">
                                Crear Cuenta Gratis
                            </Link>
                        </div>

                        {/* Plan Usuario */}
                        <div className="bg-indigo-900 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col shadow-2xl relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest">Recomendado</div>
                            <h3 className="text-xl font-bold text-white mb-2">Licencia Premium</h3>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="line-through text-indigo-400 text-xl font-bold opacity-60">$990</span>
                                <span className="text-indigo-200 text-xs font-bold bg-indigo-800/60 px-2 py-1 rounded-md uppercase tracking-wider">Lanzamiento</span>
                            </div>
                            <div className="text-5xl font-bold text-white mb-6">$499 <span className="text-sm text-indigo-300 font-medium tracking-normal">MXN / anual</span></div>
                            <p className="text-sm text-indigo-200 mb-8 flex-1">Acceso ilimitado al motor de cálculo para planear tu propio retiro y maximizar tu pensión.</p>
                            <ul className="space-y-3 mb-8 text-sm text-white font-medium">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Todo lo del nivel Libre</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Simulaciones Ilimitadas M40</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDFs de Proyecto Oficial</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Guardado Histórico de Escenarios</li>
                            </ul>
                            <Link href="/register" className="w-full text-center py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-lg">
                                Adquirir Licencia
                            </Link>
                        </div>

                        {/* Plan Asesor */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Licencia Profesional B2B</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">$1,200 <span className="text-sm text-slate-500 font-medium">MXN / anual</span></div>
                            <p className="text-sm text-slate-600 mb-8 flex-1">Infraestructura comercial para despachos. Genera reportes marca blanca para tus clientes.</p>
                            <ul className="space-y-3 mb-8 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Motor Full Premium (Ilimitado)</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Infraestructura Marca Blanca</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDFs con tu Logo y Contacto</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Comparativas Multi-Escenario</li>
                            </ul>
                            <Link href="/register?role=ADVISOR" className="w-full text-center py-3 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors">
                                Escala tu Despacho
                            </Link>
                        </div>
                    </div>

                    {/* Trust Banner */}
                    <div className="mt-20 max-w-4xl mx-auto bg-slate-50 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 border border-slate-100 shadow-sm text-center sm:text-left">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg mb-1">Tu privacidad financiera está blindada</h4>
                            <p className="text-slate-600 text-sm mb-4">
                                Operamos bajo los más estrictos estándares matemáticos de la Ley del Seguro Social vigente. <strong>Nunca te pediremos tu contraseña del IMSS ni tu Número de Seguridad Social (NSS)</strong> para realizar la simulación primaria. Tus datos son tuyos.
                            </p>
                            <button className="text-indigo-600 font-bold text-[11px] uppercase tracking-widest hover:text-indigo-800 underline flex items-center gap-1 transition-colors">
                                Ver base legal y fórmula aplicada <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FAQ Section */}
            <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 text-center tracking-tight">Preguntas Frecuentes</h2>

                    <div className="space-y-4">
                        <FaqItem question="¿El simulador funciona para Ley 97?">
                            El simulador de Retiro Maestro está optimizado con precisión actuarial exclusivamente para el marco legal de la <strong>Ley 73 del Seguro Social</strong>, que ampara a quienes cotizaron antes del 1 de julio de 1997.
                        </FaqItem>
                        <FaqItem question="¿Qué pasa si ya estoy pensionado?">
                            Si ya posees una resolución de pensión formal otorgada y te encuentras cobrando tu mensualidad institucionalmente, no es viable aplicar la continuación voluntaria (Modalidad 40). Este simulador es para la etapa de planeación previa.
                        </FaqItem>
                        <FaqItem question="¿Es esto una plataforma oficial del IMSS?">
                            No. Somo un software (SaaS) financiero privado desarrollado por expertos técnicos y legales que decodificaron la ley para ofrecer al trabajador la máxima visibilidad estratégica antes de solicitar sus trámites en su Subdelegación local.
                        </FaqItem>
                        <FaqItem question="¿Pueden garantizar que cobraré lo que dice el simulador?">
                            Nuestro motor M40 refleja con exactitud el marco legal y de las UMAs publicadas, con un 99.9% de fidelidad actuarial sobre los parámetros ingresados. Sin embargo, la resolución final y oficial recae absoluta y exclusivamente en el dictamen emitido por el Instituto Mexicano del Seguro Social al momento del trámite.
                        </FaqItem>
                        <FaqItem question="¿El sistema guarda mis datos para siempre?">
                            No. El modelo protege tu privacidad financiera. Si decides no proceder o deseas eliminar tu cuenta tú mismo, tus registros en la base de datos se borran irreversiblemente en acato a nuestras políticas Zero-Knowledge.
                        </FaqItem>
                    </div>
                </div>
            </section>

            {/* Footer Minimal */}
            <footer className="bg-slate-950 text-slate-500 py-12 text-center text-sm border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-xs">R</div>
                        <span className="font-semibold text-slate-300">Retiro Maestro © {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacidad" className="text-slate-500 hover:text-white transition-colors">Aviso de Privacidad</Link>
                        <Link href="/terminos" className="text-slate-500 hover:text-white transition-colors">Términos de Servicio</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

// Simple FAQ accordion component
function FaqItem({ question, children }: { question: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
                <span className="font-bold text-slate-800 text-lg">{question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-slate-600 leading-relaxed text-sm">{children}</p>
            </div>
        </div>
    );
}
