'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Circle, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './shared';

interface ChecklistItem {
    id: string;
    title: string;
    description: string;
    importance: 'critico' | 'recomendado' | 'opcional';
    whyNeeded: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
    {
        id: 'nss',
        title: 'Número de Seguridad Social (NSS) verificado',
        description: 'Constancia de NSS sin duplicidades ni homonimias.',
        importance: 'critico',
        whyNeeded: 'Si tienes más de un número de seguridad social o tu nombre está mal registrado, tus semanas cotizadas no se sumarán correctamente, retrasando o bloqueando tu pensión.'
    },
    {
        id: 'curp',
        title: 'CURP Certificada con Registro Civil',
        description: 'Clave única verificada en RENAPO.',
        importance: 'critico',
        whyNeeded: 'Indispensable para cualquier trámite gubernamental. El IMSS valida tu CURP directamente con RENAPO; un error de una sola letra impedirá la emisión de tu resolución de pensión.'
    },
    {
        id: 'rfc',
        title: 'RFC con Homoclave validado',
        description: 'Cédula de Identificación Fiscal del SAT.',
        importance: 'critico',
        whyNeeded: 'Tus ingresos por jubilación y aportaciones deben estar ligados a tu RFC correcto para fines fiscales ante el SAT.'
    },
    {
        id: 'semanas',
        title: 'Constancia de Semanas Cotizadas',
        description: 'Reporte oficial del IMSS actualizado.',
        importance: 'critico',
        whyNeeded: 'Es la prueba documental del tiempo trabajado. Necesitamos verificar que coincida con tu cálculo de proyección y que no falte ningún patrón del pasado.'
    },
    {
        id: 'afore_exp',
        title: 'Expediente de Identificación del AFORE',
        description: 'Enrolamiento biométrico y datos digitales actualizados.',
        importance: 'critico',
        whyNeeded: 'Tu administradora de fondos requiere que tengas tus huellas dactilares y expediente digital completo antes de liberar tus recursos del SAR 92 y Vivienda.'
    },
    {
        id: 'baja',
        title: 'Baja Laboral Vigente',
        description: 'Notificación oficial de término de relación laboral ante el IMSS.',
        importance: 'critico',
        whyNeeded: 'Para reclamar una pensión por Cesantía o Vejez (o ingresar a la Modalidad 40 si cotizas por tu cuenta), debes estar oficialmente dado de baja en el régimen obligatorio.'
    },
    {
        id: 'identificacion',
        title: 'Identificación Oficial Vigente',
        description: 'Credencial INE original o pasaporte mexicano vigente.',
        importance: 'critico',
        whyNeeded: 'El IMSS exige una identificación oficial con firma y fotografía idéntica a tus firmas registradas.'
    },
    {
        id: 'acta',
        title: 'Acta de Nacimiento Certificada',
        description: 'Copia digital legible con código de barras.',
        importance: 'recomendado',
        whyNeeded: 'Valida tu fecha de nacimiento exacta para el cálculo de tu edad y porcentaje de pensión (ej. 60 años al 75% o 65 años al 100%).'
    },
    {
        id: 'domicilio',
        title: 'Comprobante de Domicilio',
        description: 'Recibo reciente de luz, agua o teléfono fijo (< 3 meses).',
        importance: 'recomendado',
        whyNeeded: 'El IMSS requiere constatar tu residencia actual para asignarte la clínica familiar y zona de cobro.'
    },
    {
        id: 'afore_edo',
        title: 'Estado de Cuenta del AFORE',
        description: 'Último reporte cuatrimestral recibido.',
        importance: 'recomendado',
        whyNeeded: 'Permite confirmar los saldos de retiro y vivienda que se te devolverán o transferirán al IMSS tras pensionarte.'
    },
    {
        id: 'banco',
        title: 'Estado de Cuenta Bancario con CLABE',
        description: 'Estado de cuenta a tu nombre completo con la CLABE interbancaria visible.',
        importance: 'critico',
        whyNeeded: 'Es la cuenta bancaria donde el IMSS depositará tu pensión mensualmente de forma automática. No puede ser de un tercero ni de tipo monedero.'
    }
];

export const TrámiteChecklist: React.FC = () => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // Load initial state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pension_checklist_state');
        if (saved) {
            try {
                setCheckedItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse checklist state', e);
            }
        }
    }, []);

    const toggleItem = (id: string) => {
        const next = { ...checkedItems, [id]: !checkedItems[id] };
        setCheckedItems(next);
        localStorage.setItem('pension_checklist_state', JSON.stringify(next));
    };

    const toggleExpand = (id: string) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    const totalCount = CHECKLIST_ITEMS.length;
    const completedCount = CHECKLIST_ITEMS.filter(item => checkedItems[item.id]).length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const getBadgeStyle = (importance: ChecklistItem['importance']) => {
        switch (importance) {
            case 'critico':
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            case 'recomendado':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
        }
    };

    const getBadgeText = (importance: ChecklistItem['importance']) => {
        switch (importance) {
            case 'critico': return 'Crítico';
            case 'recomendado': return 'Recomendado';
            default: return 'Opcional';
        }
    };

    return (
        <Card className="border-t-4 border-t-emerald-600 flex flex-col h-full hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
            
            {/* Header */}
            <div className="mb-6 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                    <ClipboardList className="text-emerald-600" size={28} />
                    Lista de Requisitos del Trámite
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                    Reúne esta documentación oficial para agilizar tu trámite de jubilación y evitar rechazos administrativos del IMSS.
                </p>
            </div>

            {/* Progress Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Progreso del Expediente</span>
                    <span className="text-sm font-black text-emerald-600">{percentage}% ({completedCount} de {totalCount})</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {percentage === 100 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle2 size={12} /> ¡Expediente completo! Listo para iniciar tu trámite en ventanilla.
                    </p>
                )}
            </div>

            {/* Items List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {CHECKLIST_ITEMS.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    const isExpanded = expandedItem === item.id;

                    return (
                        <div 
                            key={item.id}
                            className={`border rounded-xl transition-all duration-200 ${
                                isChecked 
                                    ? 'bg-emerald-50/25 border-emerald-100 dark:bg-emerald-950/5 dark:border-emerald-900/20' 
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800'
                            }`}
                        >
                            <div className="flex items-start gap-3 p-4">
                                {/* Checkbox Action */}
                                <button 
                                    onClick={() => toggleItem(item.id)}
                                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                                >
                                    {isChecked ? (
                                        <CheckCircle2 className="text-emerald-500 fill-emerald-100 dark:fill-emerald-950" size={20} />
                                    ) : (
                                        <Circle size={20} />
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0" onClick={() => toggleExpand(item.id)}>
                                    <div className="flex flex-wrap items-center gap-2 mb-1 cursor-pointer">
                                        <span className={`font-bold text-sm ${isChecked ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {item.title}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyle(item.importance)}`}>
                                            {getBadgeText(item.importance)}
                                        </span>
                                    </div>
                                    <p className={`text-xs ${isChecked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'} line-clamp-1 cursor-pointer`}>
                                        {item.description}
                                    </p>

                                    {/* Expandable Why needed section */}
                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 animate-in fade-in duration-200 space-y-2">
                                            <div className="flex items-start gap-1.5">
                                                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                                <p className="leading-relaxed">
                                                    <strong>¿Por qué es importante?</strong> {item.whyNeeded}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Expand Toggle Button */}
                                <button 
                                    onClick={() => toggleExpand(item.id)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 self-start mt-0.5"
                                >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
