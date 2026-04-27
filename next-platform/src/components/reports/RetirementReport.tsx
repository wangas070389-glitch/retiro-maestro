import { Page, Text, View, Document, Image, Link } from '@react-pdf/renderer';
import { PensionInput } from '../../lib/engine/pension-engine';
import { reportStyles as styles } from './reportStyles';

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
    agencyProfile?: {
        agencyName?: string | null;
        agencyPhone?: string | null;
        agencyLogoUrl?: string | null;
    };
}

export const RetirementReport = ({ clientName = "Usuario", input, strategyName, strategyResult, baselineResult, projectionData, baselineProjectionData, bundle, certifiedDossier, agencyProfile }: ReportProps) => {
    const deltaMonthly = baselineResult ? (strategyResult.pensionMensual - baselineResult.pensionMensual) : 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {agencyProfile?.agencyLogoUrl && (
                            <Image src={agencyProfile.agencyLogoUrl} style={{ width: 40, height: 40, marginRight: 10, objectFit: 'contain' }} />
                        )}
                        <View>
                            <Text style={styles.title}>{agencyProfile?.agencyName || "Retiro Maestro"}</Text>
                            <Text style={styles.subtitle}>DICTAMEN TÉCNICO DE PROYECCIÓN DE RETIRO - LEY 73</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 9, color: '#94a3b8' }}>{new Date().toLocaleDateString()}</Text>
                        {agencyProfile?.agencyPhone && (
                            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>Tel: {agencyProfile.agencyPhone}</Text>
                        )}
                    </View>
                </View>

                {/* CLIENT PROFILE */}
                <View style={styles.section}>
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
                </View>

                {/* COMPARISON / STRATEGY SUMMARY */}
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
                                    Incremental: +${deltaMonthly.toLocaleString('es-MX', { maximumFractionDigits: 0 })}/mes
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
                                <Text style={[styles.label, { fontSize: 8 }]}>TIEMPO DE RECUPERACIÓN</Text>
                                <Text style={[styles.value, { fontSize: 14, color: '#059669' }]}>
                                    {Math.ceil(strategyResult.roiMeses)} Meses
                                </Text>
                            </View>
                        )}
                    </View>

                    {strategyResult.totalInversion > 0 && (
                        <View style={{ marginTop: 15, padding: 10, borderLeftWidth: 3, borderLeftColor: '#4f46e5', backgroundColor: '#eef2ff' }}>
                            <Text style={[styles.label, { color: '#4f46e5', marginBottom: 2 }]}>🛡️ BLINDAJE CONTRA INFLACIÓN</Text>
                            <Text style={{ fontSize: 8, color: '#1e293b', lineHeight: 1.4 }}>
                                Esta estrategia asegura un incremento proyectado de por vida que protege tu poder adquisitivo frente a los aumentos de la UMA. 
                                Se estima un incremento neto de <Text style={{ fontWeight: 'bold' }}>${deltaMonthly.toLocaleString('es-MX')} MXN</Text> cada mes en comparación con su estado actual.
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
                </View>

                {/* AMORTIZATION TABLES END */}

                {/* SOVEREIGN PROOF */}
                {bundle && (
                    <View style={[styles.forensicSection, certifiedDossier ? { borderColor: '#10b981', backgroundColor: '#f0fdf4' } : {}]}>
                        <Text style={[styles.forensicTitle, certifiedDossier ? { color: '#059669' } : {}]}>Certificación de Integridad Legal</Text>
                        <Text style={styles.forensicHash}>Folio de Auditoría: RM-{new Date().getFullYear()}-{bundle.integrity_hash?.substring(0, 6).toUpperCase()}</Text>
                        <Text style={[styles.forensicHash, { marginTop: 2 }]}>Documento Validado: {bundle.generated_at}</Text>
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
                    Validación Normativa bajo <Link src="http://www.imss.gob.mx/derecho-habientes/pensiones" style={{ color: '#4f46e5', textDecoration: 'none' }}>Ley del Seguro Social 1973</Link>
                </Text>
            </Page>
        </Document>
    );
};
