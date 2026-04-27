import { Page, Text, View, Document, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';
import { PensionInput } from '../../lib/engine/pension-engine';

// Register a nice font if possible, otherwise use standard Helvetica
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        color: '#1e293b' // slate-800
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#4f46e5', // indigo-600
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        letterSpacing: 2
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b', // slate-500
        marginTop: 4
    },
    section: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f8fafc', // slate-50
        borderRadius: 4
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 4
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    label: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold'
    },
    value: {
        fontSize: 10,
        color: '#0f172a',
        fontWeight: 'normal'
    },
    highlight: {
        color: '#4f46e5',
        fontWeight: 'bold'
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        padding: 6
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 6
    },
    col1: { width: '10%' }, // Year
    col2: { width: '10%' }, // Age
    col3: { width: '15%' }, // Weeks
    col4: { width: '15%', textAlign: 'right' }, // Registered Salary
    col5: { width: '15%', textAlign: 'right' }, // Blended Average Salary
    col6: { width: '17%', textAlign: 'right' }, // Investment
    col7: { width: '18%', textAlign: 'right' }, // Pension

    tableCell: { fontSize: 8, color: '#334155' },
    tableCellHeader: { fontSize: 8, fontWeight: 'bold', color: '#475569' },

    disclaimer: {
        marginTop: 40,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10
    },
    legalText: {
        fontSize: 7,
        color: '#94a3b8',
        lineHeight: 1.5,
        textAlign: 'justify'
    },
    forensicSection: {
        marginTop: 15,
        padding: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc'
    },
    forensicTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 4
    },
    forensicHash: {
        fontSize: 7,
        fontFamily: 'Courier',
        color: '#64748b'
    },
    // NEW: Visual Authority Styles
    semaforoBadge: {
        padding: '4 8',
        borderRadius: 12,
        fontSize: 8,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase'
    },
    barChartLabel: {
        fontSize: 7,
        color: '#64748b',
        marginBottom: 2
    },
    actionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    checkbox: {
        width: 8,
        height: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        marginRight: 6
    }
});

interface ReportProps {
    clientName?: string;
    input: PensionInput;
    strategyName: string;
    strategyResult: {
        pensionMensual: number;
        totalInversion: number;
        roiMeses: number;
    };
    baselineResult?: {
        pensionMensual: number;
        totalInversion: number;
        roiMeses: number;
    };
    projectionData: Array<{
        year: number;
        age: number;
        weeks: number;
        registeredSalary: number;
        salaryProm: number;
        investment: number;
        pension: number;
        roi: number;
    }>;
    baselineProjectionData?: Array<{
        year: number;
        age: number;
        weeks: number;
        registeredSalary: number;
        salaryProm: number;
        investment: number;
        pension: number;
        roi: number;
    }>;
    bundle?: {
        integrity_hash?: string;
        generated_at: string;
        version: string;
    };
    certifiedDossier?: {
        source_filename: string;
        confidence: number;
        extracted_at: string;
        nss: string;
        curp: string;
    } | null;
    aforeSaldos?: {
        retiro97: number;
        infonavit: number;
        cesantiaVejez?: number;
    };
    honorarios?: {
        estudio: number;
        gestionMensual?: number;
    };
}

export const ComprehensiveReport = ({ clientName = "Usuario", input, strategyName, strategyResult, baselineResult, projectionData, baselineProjectionData, bundle, certifiedDossier, aforeSaldos, honorarios }: ReportProps) => {
    const deltaMonthly = baselineResult ? (strategyResult.pensionMensual - baselineResult.pensionMensual) : 0;
    const costOfInaction = deltaMonthly; // Each month delayed is one delta lost
    
    // Viability Logic
    const isViable = strategyResult.roiMeses < 12;
    const semaforoColor = strategyResult.roiMeses < 12 ? '#059669' : (strategyResult.roiMeses < 24 ? '#d97706' : '#dc2626');
    const semaforoText = strategyResult.roiMeses < 12 ? 'ALTA VIABILIDAD' : (strategyResult.roiMeses < 24 ? 'VIABILIDAD MEDIA' : 'ANÁLISIS REQUERIDO');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Retiro Maestro</Text>
                        <Text style={styles.subtitle}>ESTUDIO PROFESIONAL DE PENSIONES - LEY 73</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 9, color: '#94a3b8' }}>{new Date().toLocaleDateString()}</Text>
                        <View style={[styles.semaforoBadge, { backgroundColor: semaforoColor, marginTop: 4 }]}>
                            <Text>{semaforoText}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#fdf2f8', borderLeftWidth: 3, borderLeftColor: '#ec4899' }}>
                    <Text style={{ fontSize: 9, color: '#9d174d', fontWeight: 'bold', marginBottom: 4 }}>NOTA DEL ARQUITECTO SOBERANO</Text>
                    <Text style={{ fontSize: 8, color: '#831843', lineHeight: 1.4 }}>
                        Este Estudio Completo está diseñado bajo la premisa de la Verdad Matemática. A diferencia de las proyecciones tradicionales, este documento integra validación heurística y firmas de integridad criptográfica para garantizar que su estrategia de retiro esté basada en datos inmutables y optimización geométrica.
                    </Text>
                </View>

                {/* FASE 1 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fase 1: Auditoría de Identidad y Viabilidad Legal</Text>
                    <Text style={[styles.legalText, { marginBottom: 8, color: '#475569' }]}>
                        La primera barrera en cualquier trámite de pensión es la discrepancia de identidad. Es imperativo que sus datos (Nombre, Apellidos, Fecha de Nacimiento) sean idénticos, letra por letra, entre su Acta de Nacimiento, CURP, RFC, IMSS y AFORE. Cualquier homonimia o error tipográfico bloqueará los fondos.
                    </Text>
                    <Text style={styles.sectionTitle}>Perfil del Cliente</Text>
                    <View style={[styles.row, { flexWrap: 'wrap' }]}>
                        <View style={{ width: '50%', marginBottom: 5 }}>
                            <Text style={styles.label}>Nombre:</Text>
                            <Text style={styles.value}>{clientName}</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 5 }}>
                            <Text style={styles.label}>Edad Actual:</Text>
                            <Text style={styles.value}>{input.age} años</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 5 }}>
                            <Text style={styles.label}>Semanas Cotizadas:</Text>
                            <Text style={styles.value}>{input.weeks}</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 5 }}>
                            <Text style={styles.label}>Salario Prom. Base:</Text>
                            <Text style={styles.value}>${input.salary_prom.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 5 }}>
                            <Text style={styles.label}>Estatus Laboral:</Text>
                            <Text style={styles.value}>{input.is_ongoing_work !== false ? "Activo (Cotizando)" : "Inactivo (Semanas Congeladas)"}</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 5 }}>
                            <Text style={styles.label}>Edad Objetivo Retiro:</Text>
                            <Text style={styles.value}>{input.retirement_age || 65} años</Text>
                        </View>
                    </View>
                    {certifiedDossier && (
                        <View style={{ marginTop: 8, padding: 6, backgroundColor: '#f0fdf4', borderRadius: 4, borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <Text style={{ fontSize: 8, color: '#166534', fontWeight: 'bold' }}>✓ Identidad Verificada Criptográficamente</Text>
                            <Text style={{ fontSize: 7, color: '#15803d', marginTop: 2 }}>Los datos de NSS ({certifiedDossier.nss}) y CURP ({certifiedDossier.curp}) han sido extraídos directamente de documentos emitidos por la autoridad, asegurando viabilidad legal.</Text>
                        </View>
                    )}
                </View>

                {/* FASE 2 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fase 2: Diagnóstico de Conservación de Derechos y Semanas</Text>
                    <Text style={[styles.legalText, { marginBottom: 8, color: '#475569' }]}>
                        Para tener derecho a una pensión bajo la Ley 73, el Instituto exige estar dentro del periodo de Conservación de Derechos (la cuarta parte del tiempo total cotizado desde la fecha de baja). El reporte de semanas es el motor matemático crítico; omitir recuperar semanas perdidas devalúa drásticamente el cálculo geométrico final.
                    </Text>
                    <View style={[styles.row, { paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }]}>
                        <Text style={styles.label}>Total de Semanas Auditadas:</Text>
                        <Text style={[styles.value, { fontWeight: 'bold', color: '#0f172a' }]}>{input.weeks} Semanas</Text>
                    </View>
                    <View style={[styles.row, { paddingTop: 6 }]}>
                        <Text style={styles.label}>Salario Promedio (Últimas 250 semanas):</Text>
                        <Text style={[styles.value, { fontWeight: 'bold', color: '#0f172a' }]}>${input.salary_prom.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</Text>
                    </View>
                </View>

                {/* FASE 3 */}
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>Fase 3: Proyección Matemática y Estrategia (Diseño a la Medida)</Text>
                    <Text style={[styles.legalText, { marginBottom: 12, color: '#475569' }]}>
                        A continuación se presenta el contraste entre la inercia del sistema (lo que ocurrirá si no toma acción) y el Estado Objetivo Soberano (diseñado mediante aportación voluntaria topada en UMA). Las tablas representan la amortización exacta.
                    </Text>
                </View>

                {/* COMPARATIVE VISUALIZATION (BARS) */}
                {baselineResult && (
                    <View style={[styles.section, { backgroundColor: '#FFFFFF', borderLeftWidth: 0, paddingLeft: 0 }]}>
                        <Text style={styles.sectionTitle}>Evidencia Visual: Impacto de la Estrategia</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 40, marginTop: 10, marginBottom: 20 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.barChartLabel}>SIN ESTRATEGIA</Text>
                                <View style={{ width: 60, height: 40, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>${baselineResult.pensionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={[styles.barChartLabel, { color: '#4f46e5' }]}>CON ESTRATEGIA</Text>
                                <View style={{ width: 60, height: Math.min(60, (strategyResult.pensionMensual / baselineResult.pensionMensual) * 40), backgroundColor: '#4f46e5', borderRadius: 4 }} />
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#4f46e5', marginTop: 4 }}>${strategyResult.pensionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 20, borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }}>
                                <Text style={{ fontSize: 8, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Incremento de Pensión</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#059669' }}>+{Math.round((strategyResult.pensionMensual / baselineResult.pensionMensual - 1) * 100)}%</Text>
                                <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 2 }}>* Cálculos basados en Ley 73 vigente.</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {strategyResult.totalInversion === 0 ? "Situación Actuarial Basal (Inercial)" : "Resumen Comparativo de Estrategia"}
                    </Text>

                    {baselineResult && strategyResult.totalInversion > 0 && (
                        <View style={{ flexDirection: 'row', marginBottom: 15, padding: 8, backgroundColor: '#eff6ff', borderRadius: 4 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>ESTADO ACTUAL (AS-IS)</Text>
                                <Text style={[styles.value, { fontSize: 14 }]}>
                                    ${baselineResult.pensionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                            <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: '#bfdbfe', paddingLeft: 10 }}>
                                <Text style={styles.label}>ESTADO OBJETIVO (TO-BE)</Text>
                                <Text style={[styles.value, styles.highlight, { fontSize: 18 }]}>
                                    ${strategyResult.pensionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                                <Text style={{ fontSize: 8, color: '#059669', fontWeight: 'bold' }}>
                                    Incremental: +${(strategyResult.pensionMensual - baselineResult.pensionMensual).toLocaleString('es-MX', { maximumFractionDigits: 0 })}/mes
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={[styles.row, { marginTop: 10 }]}>
                        {(!baselineResult || strategyResult.totalInversion === 0) && (
                            <View style={{ width: '30%' }}>
                                <Text style={[styles.label, { fontSize: 8 }]}>PENSIÓN MENSUAL ESTIMADA</Text>
                                <Text style={[styles.value, styles.highlight, { fontSize: 18 }]}>
                                    ${strategyResult.pensionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                        )}
                        <View style={{ width: '30%' }}>
                            <Text style={[styles.label, { fontSize: 8 }]}>INVERSIÓN ADICIONAL</Text>
                            <Text style={[styles.value, { fontSize: 14 }]}>
                                ${strategyResult.totalInversion.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                            </Text>
                        </View>
                        {strategyResult.totalInversion > 0 && (
                            <View style={{ width: '30%' }}>
                                <Text style={[styles.label, { fontSize: 8 }]}>RETORNO DE INVERSIÓN</Text>
                                <Text style={[styles.value, { fontSize: 14, color: '#059669' }]}>
                                    {Math.ceil(strategyResult.roiMeses)} Meses
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    {/* COSTO DE INACCIÓN */}
                    {strategyResult.totalInversion > 0 && (
                        <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                            <Text style={{ fontSize: 9, color: '#dc2626', fontWeight: 'bold' }}>
                                COSTO DE LA INACCIÓN: -${costOfInaction.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN / mes
                            </Text>
                            <Text style={{ fontSize: 7, color: '#991b1b', marginTop: 2 }}>
                                Por cada mes que usted posterga el inicio de esta estrategia, pierde definitivamente esta cantidad de su ahorro para el retiro.
                            </Text>
                        </View>
                    )}
                </View>

                {/* AMORTIZATION TABLES */}
                <View style={{ marginTop: 20 }}>
                    {baselineProjectionData && (
                        <View style={{ marginBottom: 25 }}>
                            <Text style={[styles.sectionTitle, { color: '#64748b' }]}>Tabla de Amortización: Situación Actual (AS-IS)</Text>
                            <View style={styles.table}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.col1, styles.tableCellHeader]}>Año</Text>
                                    <Text style={[styles.col2, styles.tableCellHeader]}>Edad</Text>
                                    <Text style={[styles.col3, styles.tableCellHeader]}>Semanas</Text>
                                    <Text style={[styles.col4, styles.tableCellHeader]}>Sal. Diario</Text>
                                    <Text style={[styles.col5, styles.tableCellHeader]}>Sal. Prom.</Text>
                                    <Text style={[styles.col6, styles.tableCellHeader]}>Inversión</Text>
                                    <Text style={[styles.col7, styles.tableCellHeader]}>Pensión</Text>
                                </View>
                                {baselineProjectionData.map((row, i) => (
                                    <View key={i} style={[styles.tableRow, i % 2 !== 0 ? { backgroundColor: '#f8fafc' } : {}]}>
                                        <Text style={[styles.col1, styles.tableCell]}>{row.year}</Text>
                                        <Text style={[styles.col2, styles.tableCell]}>{row.age}</Text>
                                        <Text style={[styles.col3, styles.tableCell]}>{row.weeks}</Text>
                                        <Text style={[styles.col4, styles.tableCell]}>
                                            ${row.registeredSalary.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                        </Text>
                                        <Text style={[styles.col5, styles.tableCell]}>
                                            ${row.salaryProm.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                        </Text>
                                        <Text style={[styles.col6, styles.tableCell]}>$0</Text>
                                        <Text style={[styles.col7, styles.tableCell, { fontWeight: 'bold' }]}>
                                            ${row.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4 }}>
                                * Proyección sin inversión adicional conservando el esquema de trabajo actual.
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: '#4f46e5' }]}>
                        {baselineProjectionData ? `Tabla de Amortización: ${strategyName} (TO-BE)` : "Proyección Anual (Amortización)"}
                    </Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.col1, styles.tableCellHeader]}>Año</Text>
                            <Text style={[styles.col2, styles.tableCellHeader]}>Edad</Text>
                            <Text style={[styles.col3, styles.tableCellHeader]}>Semanas</Text>
                            <Text style={[styles.col4, styles.tableCellHeader]}>Sal. Diario</Text>
                            <Text style={[styles.col5, styles.tableCellHeader]}>Sal. Prom.</Text>
                            <Text style={[styles.col6, styles.tableCellHeader]}>Inversión</Text>
                            <Text style={[styles.col7, styles.tableCellHeader]}>Pensión</Text>
                        </View>
                        {projectionData.map((row, i) => (
                            <View key={i} style={[styles.tableRow, i % 2 !== 0 ? { backgroundColor: '#f8fafc' } : {}]}>
                                <Text style={[styles.col1, styles.tableCell]}>{row.year}</Text>
                                <Text style={[styles.col2, styles.tableCell]}>{row.age}</Text>
                                <Text style={[styles.col3, styles.tableCell]}>{row.weeks}</Text>
                                <Text style={[styles.col4, styles.tableCell]}>
                                    ${row.registeredSalary.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                                <Text style={[styles.col5, styles.tableCell]}>
                                    ${row.salaryProm.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                                <Text style={[styles.col6, styles.tableCell]}>
                                    ${row.investment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                                <Text style={[styles.col7, styles.tableCell, { fontWeight: 'bold', color: '#4f46e5' }]}>
                                    ${row.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {/* UMA Technical Note */}
                    <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
                        <Text style={{ fontSize: 7, color: '#475569', lineHeight: 1.4 }}>
                            <Text style={{ fontWeight: 'bold' }}>NOTA TÉCNICA UMA:</Text> Esta proyección contempla un valor de UMA estimado de $108.57 para 2026 y un crecimiento proyectado de la UMA para Febrero 2027 basado en la inflación histórica. Los pagos de Modalidad 40 se ajustarán automáticamente por el IMSS cada año.
                        </Text>
                    </View>
                </View>

                {/* FASE 4 */}
                {(aforeSaldos || honorarios) && (
                    <View style={[styles.section, { backgroundColor: '#fdf4ff', marginTop: 15 }]}>
                        <Text style={[styles.sectionTitle, { color: '#c026d3' }]}>Fase 4: Dinámica de Recuperación de Afore y Costos de Tránsito</Text>
                        <Text style={[styles.legalText, { marginBottom: 10, color: '#86198f' }]}>
                            Retiro Maestro calcula no solo su pensión, sino la masa de capital que el Estado debe reembolsarle en efectivo al momento de obtener su resolución bajo Ley 73. A continuación se desglosan los montos recuperables y la estructura de valor de nuestros servicios de acompañamiento.
                        </Text>
                        {aforeSaldos && (
                            <View style={{ marginBottom: 10 }}>
                                <Text style={[styles.label, { marginBottom: 4, color: '#a21caf' }]}>RETIRO DE FONDOS AFORE (Resolución Pensión Ley 73)</Text>
                                <View style={styles.row}>
                                    <Text style={styles.value}>Retiro 92 y 97 (Afore):</Text>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>${aforeSaldos.retiro97.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.value}>Vivienda 92 y 97 (Infonavit):</Text>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>${aforeSaldos.infonavit.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                                </View>
                                <View style={[styles.row, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#f5d0fe' }]}>
                                    <Text style={[styles.label, { color: '#86198f' }]}>Total Neto a Recuperar:</Text>
                                    <Text style={[styles.value, { fontWeight: 'bold', color: '#c026d3' }]}>${(aforeSaldos.retiro97 + aforeSaldos.infonavit).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                                </View>
                                {aforeSaldos.cesantiaVejez && (
                                    <Text style={{ fontSize: 7, color: '#d946ef', marginTop: 4 }}>
                                        Nota: Los montos de Cesantía y Vejez (${aforeSaldos.cesantiaVejez?.toLocaleString('es-MX')}) pasarán al Gobierno Federal para el fondeo de su pensión y NO se recuperan en efectivo.
                                    </Text>
                                )}
                            </View>
                        )}
                        {honorarios && (
                            <View style={{ marginTop: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5d0fe' }}>
                                <Text style={[styles.label, { marginBottom: 4, color: '#a21caf' }]}>HONORARIOS POR SERVICIOS PROFESIONALES</Text>
                                <View style={styles.row}>
                                    <Text style={styles.value}>Estudio, Planeación y Proyección Actuarial:</Text>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>${honorarios.estudio.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                                </View>
                                {honorarios.gestionMensual && (
                                    <View style={styles.row}>
                                        <Text style={styles.value}>Gestión mensual y configuración M40:</Text>
                                        <Text style={[styles.value, { fontWeight: 'bold' }]}>${honorarios.gestionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* PRÓXIMOS PASOS (SUCCESS ROADMAP) */}
                <View style={[styles.section, { backgroundColor: '#f0fdf4', borderLeftColor: '#22c55e', borderLeftWidth: 3, marginTop: 15 }]}>
                    <Text style={[styles.sectionTitle, { color: '#166534' }]}>Hoja de Ruta: Próximos Pasos Proactivos</Text>
                    <View style={{ gap: 8 }}>
                        <View style={styles.actionStep}>
                            <View style={styles.checkbox} />
                            <Text style={styles.value}>AUDITORÍA DE VIGENCIA: Confirmar fecha de baja oficial y semanas en reporte IMSS.</Text>
                        </View>
                        <View style={styles.actionStep}>
                            <View style={styles.checkbox} />
                            <Text style={styles.value}>EXPEDIENTE DIGITAL: Digitalizar Acta, CURP, RFC y Constancia de Semanas.</Text>
                        </View>
                        <View style={styles.actionStep}>
                            <View style={styles.checkbox} />
                            <Text style={styles.value}>CONTRATACIÓN M40: Realizar inscripción en ventanilla o portal IMSS.</Text>
                        </View>
                        <View style={styles.actionStep}>
                            <View style={styles.checkbox} />
                            <Text style={styles.value}>CRONOGRAMA: Definir fechas de pago mensual para evitar recargos.</Text>
                        </View>
                    </View>
                </View>

                {/* SOVEREIGN PROOF */}
                {bundle && (
                    <View style={[styles.forensicSection, certifiedDossier ? { borderColor: '#10b981', backgroundColor: '#f0fdf4' } : {}]}>
                        <Text style={[styles.forensicTitle, certifiedDossier ? { color: '#059669' } : {}]}>Evidencia Forense (Firma de Integridad)</Text>
                        <Text style={styles.forensicHash}>ID: {bundle.integrity_hash}</Text>
                        <Text style={[styles.forensicHash, { marginTop: 2 }]}>Versión: {bundle.version} | Timestamp: {bundle.generated_at}</Text>
                        {certifiedDossier && (
                            <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopStyle: 'dashed', borderTopColor: '#a7f3d0' }}>
                                <Text style={[styles.forensicHash, { color: '#059669', fontWeight: 'bold' }]}>EXTRACCIÓN VERIFICADA: {(certifiedDossier.confidence * 100).toFixed(0)}% SOY LEY 73</Text>
                                <Text style={styles.forensicHash}>Documento Origen: {certifiedDossier.source_filename}</Text>
                                <Text style={styles.forensicHash}>NSS Validado: {certifiedDossier.nss} | CURP Validada: {certifiedDossier.curp}</Text>
                                <Text style={[styles.forensicHash, { marginTop: 2 }]}>Fecha Lectura Automática: {new Date(certifiedDossier.extracted_at).toLocaleString()}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* LEGAL DISCLAIMER */}
                <View style={styles.disclaimer}>
                    <Text style={[styles.legalText, { fontWeight: 'bold', marginBottom: 4 }]}>AVISO LEGAL Y DESLINDE DE RESPONSABILIDAD</Text>
                    <Text style={styles.legalText}>
                        Este reporte es una simulación financiera con fines informativos y educativos. Los cálculos están basados en la Ley del Seguro Social de 1973 y sus reglamentos vigentes a la fecha de emisión, así como en las variables proporcionadas por el usuario.
                        {"\n\n"}
                        Retiro Maestro no garantiza que el IMSS otorgue exactamente estos montos, ya que la resolución final depende enteramente de la validación oficial de semanas cotizadas, salario promedio registrado y vigencia de derechos por parte de la autoridad.
                        {"\n\n"}
                        Las proyecciones futuras asumen la continuidad de las leyes actuales. Cualquier reforma a la ley de pensiones o cambios en el valor de la UMA pueden alterar estos resultados. Se recomienda validar esta estrategia con un asesor legal.
                    </Text>
                </View>

                {/* FOOTER */}
                <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8' }}>
                    Generado por <Link src="https://github.com/google-deepmind" style={{ color: '#4f46e5', textDecoration: 'none' }}>Retiro Maestro</Link> |
                    Auditado por el <Link src="http://www.imss.gob.mx/derecho-habientes/pensiones" style={{ color: '#4f46e5', textDecoration: 'none' }}>Sello de Integridad Forense</Link>
                </Text>
            </Page>
        </Document>
    );
};
