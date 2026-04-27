import { StyleSheet, Font } from '@react-pdf/renderer';

// Register a nice font if possible, otherwise use standard Helvetica
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf'
});

export const reportStyles = StyleSheet.create({
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
    // Visual Authority Styles (from ComprehensiveReport)
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
