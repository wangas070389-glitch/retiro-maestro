import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 60,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.6,
        color: '#000000'
    },
    header: {
        marginBottom: 40,
        textAlign: 'right'
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        textDecoration: 'underline'
    },
    subject: {
        fontWeight: 'bold',
        marginBottom: 40
    },
    greeting: {
        marginBottom: 20
    },
    body: {
        textAlign: 'justify',
        marginBottom: 20
    },
    signature: {
        marginTop: 60,
        textAlign: 'center'
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: '#000000',
        width: 200,
        alignSelf: 'center',
        marginTop: 40,
        marginBottom: 10
    }
});

interface OfficialDocProps {
    docType: 'm40' | 'renuncia' | 'pension' | 'solicitud_m40';
    clientName: string;
    nss: string;
    date?: string;
}

export const OfficialDocument = ({ docType, clientName = "Usuario", nss = "00000000000", date = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }: OfficialDocProps) => {
    const isM40 = docType === 'm40';
    const safeClientName = (clientName || "Usuario").toUpperCase();
    const safeNss = nss || "00000000000";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text>Asunto: {
                        docType === 'm40' ? 'Solicitud de Inscripción a Continuación Voluntaria (Mod. 40)' :
                            docType === 'renuncia' ? 'Aviso de Baja Voluntaria' :
                                docType === 'pension' ? 'Solicitud de Pensión de Cesantía en Edad Avanzada' :
                                    'Escrito de Solicitud de Cuota'
                    }</Text>
                    <Text>Fecha: {date}</Text>
                </View>

                <View style={styles.greeting}>
                    <Text style={{ fontWeight: 'bold' }}>INSTITUTO MEXICANO DEL SEGURO SOCIAL</Text>
                    <Text>H. SUBDELEGACIÓN CORRESPONDIENTE</Text>
                    <Text>PRESENTE.</Text>
                </View>

                <View style={styles.subject}>
                    <Text>ATTN: DEPARTAMENTO DE AFILIACIÓN Y VIGENCIA</Text>
                </View>

                <View style={styles.body}>
                    {docType === 'm40' && (
                        <Text>
                            Por medio de la presente, el que suscribe, C. {clientName.toUpperCase()}, con Número de Seguridad Social (NSS) {nss}, comparezco ante usted para solicitar formalmente mi inscripción al Régimen de Continuación Voluntaria en el Régimen Obligatorio, mejor conocido como Modalidad 40, bajo los términos de los artículos 218 al 220 de la Ley del Seguro Social vigente.
                            {"\n\n"}
                            Deseo realizar mis aportaciones basándome en el salario que convenga a mis intereses para efectos de mejorar mi promedio salarial y continuar incrementando mis semanas de cotización para una futura pensión bajo la Ley de 1973.
                        </Text>
                    )}
                    {docType === 'renuncia' && (
                        <Text>
                            Por medio de la presente, presento mi renuncia voluntaria al puesto que vengo desempeñando en la empresa en la que actualmente laboro, solicitando se procese mi baja ante este Instituto de manera inmediata. Esta decisión es personal y obedece a mis intereses particulares de iniciar mi proceso de planeación de retiro.
                        </Text>
                    )}
                    {docType === 'pension' && (
                        <Text>
                            Solicito formalmente el inicio del trámite de mi Pensión por Cesantía en Edad Avanzada, al haber cumplido con la edad y semanas de cotización requeridas por la Ley del Seguro Social de 1973. Presento ante esta autoridad la documentación necesaria para acreditar mis derechos.
                        </Text>
                    )}
                </View>

                <Text style={styles.body}>
                    Sin más por el momento, agradezco de antemano la atención prestada a la presente solicitud.
                </Text>

                <View style={styles.signature}>
                    <Text>ATENTAMENTE</Text>
                    <View style={styles.signatureLine} />
                    <Text>{clientName.toUpperCase()}</Text>
                    <Text>NSS: {nss}</Text>
                </View>
            </Page>
        </Document>
    );
};
