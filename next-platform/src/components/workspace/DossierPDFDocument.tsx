'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register standard fonts
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 20, marginBottom: 20 },
    logoContainer: { width: 120, height: 60, justifyContent: 'center' },
    logo: { objectFit: 'contain' },
    agencyInfo: { alignItems: 'flex-end', justifyContent: 'center' },
    agencyName: { fontSize: 16, fontWeight: 700, color: '#0F172A' },
    agencyPhone: { fontSize: 10, color: '#64748B', marginTop: 4 },
    docTitle: { fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 6 },
    clientName: { fontSize: 14, color: '#475569', marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 24, marginBottom: 12, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 4 },
    vigenciaBox: { flexDirection: 'row', backgroundColor: '#ECFDF5', border: '1pt solid #10B981', padding: 12, borderRadius: 6, marginBottom: 20 },
    vigenciaText: { fontSize: 12, color: '#065F46', fontWeight: 700 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    scenarioCard: { width: '31%', padding: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#F8FAFC' },
    scenarioName: { fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 },
    metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 4 },
    metricLabel: { fontSize: 9, color: '#64748B' },
    metricValue: { fontSize: 9, fontWeight: 700, color: '#0F172A' },
    roiValue: { fontSize: 12, fontWeight: 700, color: '#4F46E5', marginTop: 4 },
    dictamenContainer: { marginTop: 30, padding: 16, borderLeftWidth: 4, borderLeftColor: '#4F46E5', backgroundColor: '#F8FAFC' },
    dictamenTitle: { fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 },
    dictamenText: { fontSize: 10, color: '#334155', lineHeight: 1.5 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 8, color: '#94A3B8' }
});

interface DossierPDFProps {
    agency: { name: string; phone: string; logoUrl?: string };
    client: { name: string; id: string };
    vigenciaStatus: boolean;
    scenarios: any[];
    dictamenHtml: string;
}

export const DossierPDFDocument = ({ agency, client, vigenciaStatus, scenarios, dictamenHtml }: DossierPDFProps) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            {/* Cabecera Corporativa (Marca Blanca) */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    {agency.logoUrl && (
                        /* eslint-disable-next-line jsx-a11y/alt-text */
                        <Image src={agency.logoUrl} style={styles.logo} />
                    )}
                </View>
                <View style={styles.agencyInfo}>
                    <Text style={styles.agencyName}>{agency.name || 'Asesor Financiero'}</Text>
                    <Text style={styles.agencyPhone}>{agency.phone || 'Teléfono no registrado'}</Text>
                </View>
            </View>

            {/* Identificación */}
            <Text style={styles.docTitle}>Dictamen de Planeación Estratégica (M40)</Text>
            <Text style={styles.clientName}>Generado para: {client.name}</Text>

            {/* Sección 1: Auditoría de Ley */}
            <Text style={styles.sectionTitle}>1. Auditoría de Derechos Consticionales (Ley 73)</Text>
            {vigenciaStatus ? (
                <View style={styles.vigenciaBox}>
                    <Text style={styles.vigenciaText}>✔ Derechos Vigentes - Elegible para Pensión IMSS.</Text>
                </View>
            ) : (
                <View style={{ ...styles.vigenciaBox, backgroundColor: '#FFF1F2', borderColor: '#E11D48' }}>
                    <Text style={{ ...styles.vigenciaText, color: '#9F1239' }}>⚠ Riesgo Crítico: Derechos Vencidos. Requiere 52 semanas de reactivación.</Text>
                </View>
            )}

            {/* Sección 2: Escenarios */}
            <Text style={styles.sectionTitle}>2. Modelado de Escenarios (Proyección a Futuro)</Text>
            <View style={styles.grid}>
                {scenarios.map((sc, idx) => (
                    <View key={idx} style={styles.scenarioCard}>
                        <Text style={styles.scenarioName}>{sc.name}</Text>
                        
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Pensión Mensual</Text>
                            <Text style={styles.metricValue}>${sc.result.net_pension.toFixed(2)}</Text>
                        </View>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Semanas Totales</Text>
                            <Text style={styles.metricValue}>{sc.input.weeks} SS</Text>
                        </View>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Inversión Estimada</Text>
                            <Text style={styles.metricValue}>${(sc.delta?.investmentTotal || 0).toFixed(2)}</Text>
                        </View>
                        <View style={{ marginTop: 8 }}>
                            <Text style={styles.metricLabel}>Retorno de Inversión (ROI)</Text>
                            <Text style={styles.roiValue}>
                                {sc.delta?.roiMonths ? sc.delta.roiMonths.toFixed(1) + ' meses' : 'N/A'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Sección 3: Dictamen del Asesor */}
            {dictamenHtml && (
                <View style={styles.dictamenContainer}>
                    <Text style={styles.dictamenTitle}>Conclusión Ejecutiva del Asesor:</Text>
                    {/* Nota: @react-pdf no renderiza HTML nativo. Simulamos la extracción plana. */}
                    <Text style={styles.dictamenText}>{dictamenHtml}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Generado de forma segura mediante {agency.name || 'RetiroMaestro'}</Text>
                <Text style={styles.footerText}>ID: {client.id.split('-')[0].toUpperCase()} - {new Date().toLocaleDateString()}</Text>
            </View>
        </Page>
    </Document>
);
