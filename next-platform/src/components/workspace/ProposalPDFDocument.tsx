'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { ScenarioResult } from '@/lib/engine/m40-multi-scenario';

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 700 }
    ]
});

const s = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#FFFFFF' },
    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#4F46E5', paddingBottom: 16, marginBottom: 24 },
    logoBox: { width: 120, height: 50, justifyContent: 'center' },
    logo: { objectFit: 'contain' },
    agencyInfo: { alignItems: 'flex-end', justifyContent: 'center' },
    agencyName: { fontSize: 16, fontWeight: 700, color: '#0F172A' },
    agencyPhone: { fontSize: 9, color: '#64748B', marginTop: 3 },
    // Title
    title: { fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
    subtitle: { fontSize: 11, color: '#64748B', marginBottom: 24 },
    // Badge
    badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginBottom: 20, alignSelf: 'flex-start' },
    badgeText: { fontSize: 9, fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: 1.5 },
    // Comparison
    compGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    compCard: { flex: 1, padding: 16, borderWidth: 1, borderRadius: 8 },
    compLabel: { fontSize: 8, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
    compValue: { fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
    compUnit: { fontSize: 9, color: '#94A3B8' },
    // Section
    sectionTitle: { fontSize: 13, fontWeight: 700, color: '#0F172A', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 4, marginBottom: 14, marginTop: 8 },
    // Metrics
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    metricBox: { width: '48%', padding: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6 },
    metricLabel: { fontSize: 8, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    metricValue: { fontSize: 16, fontWeight: 700, color: '#0F172A' },
    metricDetail: { fontSize: 8, color: '#94A3B8', marginTop: 3 },
    // Highlight
    highlight: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981', borderRadius: 8, padding: 16, marginBottom: 20 },
    highlightText: { fontSize: 11, color: '#065F46', fontWeight: 700 },
    highlightSub: { fontSize: 9, color: '#047857', marginTop: 4 },
    // COI
    coiBox: { backgroundColor: '#FFF7ED', borderLeftWidth: 4, borderLeftColor: '#F59E0B', padding: 14, borderRadius: 4, marginBottom: 20 },
    coiLabel: { fontSize: 8, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: 1 },
    coiValue: { fontSize: 14, fontWeight: 700, color: '#78350F', marginTop: 4 },
    // Dictamen
    dictamenBox: { borderLeftWidth: 4, borderLeftColor: '#4F46E5', backgroundColor: '#F8FAFC', padding: 14, marginBottom: 20, borderRadius: 4 },
    dictamenTitle: { fontSize: 11, fontWeight: 700, color: '#0F172A', marginBottom: 6 },
    dictamenText: { fontSize: 10, color: '#334155', lineHeight: 1.6 },
    // Footer
    footer: { position: 'absolute', bottom: 28, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: '#94A3B8' },
});

interface ProposalPDFProps {
    agency: { name: string; phone: string; logoUrl?: string };
    client: { name: string; id: string };
    baseScenario: ScenarioResult;
    selectedScenario: ScenarioResult;
    dictamen?: string;
}

export const ProposalPDFDocument = ({ agency, client, baseScenario, selectedScenario, dictamen }: ProposalPDFProps) => {
    const delta = selectedScenario.delta!;
    const basePension = baseScenario.result.net_pension;
    const newPension = selectedScenario.result.net_pension;
    const lifetimeGain = delta.monthlyIncrement * 12 * 20; // 20 years of retirement

    return (
        <Document>
            <Page size="LETTER" style={s.page}>
                {/* Header */}
                <View style={s.header}>
                    <View style={s.logoBox}>
                        {agency.logoUrl && (
                            /* eslint-disable-next-line jsx-a11y/alt-text */
                            <Image src={agency.logoUrl} style={s.logo} />
                        )}
                    </View>
                    <View style={s.agencyInfo}>
                        <Text style={s.agencyName}>{agency.name || 'Asesor Financiero'}</Text>
                        <Text style={s.agencyPhone}>{agency.phone || ''}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={s.title}>Propuesta de Estrategia de Pensión</Text>
                <Text style={s.subtitle}>Preparado para {client.name} — {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

                {/* Strategy Badge */}
                <View style={s.badge}>
                    <Text style={s.badgeText}>Estrategia Recomendada: {selectedScenario.name}</Text>
                </View>

                {/* Before / After Comparison */}
                <Text style={s.sectionTitle}>1. Comparación de Pensión: Antes vs Después</Text>
                <View style={s.compGrid}>
                    <View style={[s.compCard, { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' }]}>
                        <Text style={s.compLabel}>Sin Estrategia (Hoy)</Text>
                        <Text style={[s.compValue, { color: '#DC2626' }]}>${basePension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                        <Text style={s.compUnit}>MXN / mes</Text>
                    </View>
                    <View style={[s.compCard, { borderColor: '#6EE7B7', backgroundColor: '#ECFDF5' }]}>
                        <Text style={s.compLabel}>Con {selectedScenario.name}</Text>
                        <Text style={[s.compValue, { color: '#059669' }]}>${newPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                        <Text style={s.compUnit}>MXN / mes</Text>
                    </View>
                </View>

                {/* Key Result */}
                <View style={s.highlight}>
                    <Text style={s.highlightText}>
                        ✔ Tu pensión aumentaría +${delta.monthlyIncrement.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN cada mes
                    </Text>
                    <Text style={s.highlightSub}>
                        Eso equivale a ${lifetimeGain.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN adicionales durante tu jubilación (20 años).
                    </Text>
                </View>

                {/* Investment Breakdown */}
                <Text style={s.sectionTitle}>2. Detalle de Inversión</Text>
                <View style={s.metricsGrid}>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Duración de Inversión</Text>
                        <Text style={s.metricValue}>{selectedScenario.type === 'BASE' ? '0' : (parseInt(selectedScenario.type.replace('M40_', '').replace('Y', '')))} año(s)</Text>
                        <Text style={s.metricDetail}>Cotizando bajo Modalidad 40</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Inversión Total</Text>
                        <Text style={s.metricValue}>${delta.investmentTotal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                        <Text style={s.metricDetail}>≈ ${delta.monthlyCost.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN/mes</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Recuperación</Text>
                        <Text style={s.metricValue}>{delta.roiMonths < Infinity ? delta.roiMonths.toFixed(1) : 'N/A'} meses</Text>
                        <Text style={s.metricDetail}>Desde el primer día de cobro de pensión</Text>
                    </View>
                    <View style={s.metricBox}>
                        <Text style={s.metricLabel}>Ganancia Total (20 Años)</Text>
                        <Text style={[s.metricValue, { color: '#059669' }]}>${lifetimeGain.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                        <Text style={s.metricDetail}>Beneficio neto sobre la inversión</Text>
                    </View>
                </View>

                {/* Cost of Inaction */}
                <View style={s.coiBox}>
                    <Text style={s.coiLabel}>⚠ Costo de Demora</Text>
                    <Text style={s.coiValue}>
                        Cada mes sin actuar, dejas de asegurar ${delta.monthlyIncrement.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN mensuales de por vida.
                    </Text>
                </View>

                {/* Dictamen */}
                {dictamen && (
                    <>
                        <Text style={s.sectionTitle}>3. Recomendación del Asesor</Text>
                        <View style={s.dictamenBox}>
                            <Text style={s.dictamenTitle}>Conclusión Ejecutiva:</Text>
                            <Text style={s.dictamenText}>{dictamen}</Text>
                        </View>
                    </>
                )}

                {/* Footer */}
                <View style={s.footer}>
                    <Text style={s.footerText}>Generado por {agency.name || 'RetiroMaestro'} — Documento confidencial</Text>
                    <Text style={s.footerText}>ID: {client.id.split('-')[0].toUpperCase()} — {new Date().toLocaleDateString('es-MX')}</Text>
                </View>
            </Page>
        </Document>
    );
};
