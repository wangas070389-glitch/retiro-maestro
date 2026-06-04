import { VigenciaGuard } from './vigencia-guard.ts';

export interface PersonaGroupInfo {
    id: number;
    title: string;
    description: string;
    recommendations: string[];
    alternatives: string[];
    riskStatus: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class PersonaClassifier {
    public static classify(
        age: number,
        isWorking: boolean,
        weeks: number,
        lastBajaDate?: string | null
    ): PersonaGroupInfo {
        // Handle Group 5: Low information / cannot retire
        if (weeks < 150) {
            return {
                id: 5,
                title: "Grupo 5: Sin historial suficiente o información básica",
                description: "No cuentas con información laboral clara o tu número de semanas cotizadas es muy bajo (< 150 semanas). Necesitas saber si cumples los requisitos básicos para jubilarte.",
                recommendations: [
                    "Localiza tu constancia oficial de Semanas Cotizadas del IMSS para verificar tu historial real.",
                    "Confirma si cotizaste por primera vez antes del 1 de julio de 1997 para asegurar tus derechos bajo la Ley 73.",
                    "Para pensionarte requieres un mínimo absoluto de 500 semanas reconocidas por el IMSS."
                ],
                alternatives: [
                    "Búsqueda Forense: Solicita ayuda a un asesor certificado para rastrear semanas perdidas en archivos históricos.",
                    "Reactivación obligatoria: Cotizar con un patrón del régimen obligatorio para empezar a sumar semanas."
                ],
                riskStatus: "HIGH"
            };
        }

        // Determine if they are in retirement age (60+)
        const inRetirementAge = age >= 60;

        if (inRetirementAge) {
            if (isWorking) {
                // Group 1: retirement age, working
                return {
                    id: 1,
                    title: "Grupo 1: En edad de jubilación, cotizando activamente",
                    description: "Ya tienes la edad mínima de retiro (60 años o más) y te encuentras cotizando formalmente en el IMSS. Puedes jubilarte de inmediato o buscar optimizar tu monto.",
                    recommendations: [
                        "Evalúa tu salario promedio de los últimos 5 años (250 semanas). Si es bajo, te conviene inscribirte a Modalidad 40 para elevarlo antes de jubilarte.",
                        "Cada año adicional que trabajes después de las 500 semanas obligatorias incrementa el porcentaje y el monto de tu pensión."
                    ],
                    alternatives: [
                        "Jubilación Inmediata: Iniciar el trámite de pensión con las condiciones actuales de tu Afore e IMSS.",
                        "Optimización Modalidad 40: Darse de baja con el patrón e ingresar de inmediato a Modalidad 40 (cotizando al tope) de 1 a 3 años para duplicar tu pensión."
                    ],
                    riskStatus: "LOW"
                };
            } else {
                // Group 2: retirement age, NOT working
                let isVigente = true;
                if (lastBajaDate) {
                    const check = VigenciaGuard.checkRights(weeks, lastBajaDate);
                    isVigente = check.hasRights;
                }

                return {
                    id: 2,
                    title: "Grupo 2: En edad de jubilación, dado de baja (Inactivo)",
                    description: "Tienes 60 años o más pero actualmente no cotizas. Tu prioridad absoluta es verificar tu conservación de derechos (Vigencia) ante el IMSS.",
                    recommendations: [
                        isVigente 
                            ? "Tu conservación de derechos está ACTIVA. Puedes tramitar tu pensión de inmediato o contratar Modalidad 40 para mejorar tu promedio salarial."
                            : "⚠️ Tus derechos han EXPIRADO. Legalmente no puedes pensionarte ni contratar Modalidad 40 actualmente. Debes cotizar 52 semanas obligatorias con un patrón para reactivarte.",
                        "Si cotizas 52 semanas consecutivas en el régimen obligatorio, recuperarás todas tus semanas cotizadas anteriores con su valor completo."
                    ],
                    alternatives: [
                        isVigente 
                            ? "Retiro Basal: Iniciar el trámite de pensión de inmediato con tu promedio salarial actual." 
                            : "Reactivación Laboral: Trabajar 1 año (52 semanas) con un patrón real en régimen obligatorio.",
                        isVigente 
                            ? "Mejora con Modalidad 40: Inscribirse voluntariamente con cuota topada para incrementar el promedio salarial de retiro."
                            : "Cooperativas o Modalidad 10: Inscribirse en programas de trabajadoras del hogar o esquemas independientes aprobados para cotizar 1 año."
                    ],
                    riskStatus: isVigente ? "MEDIUM" : "CRITICAL"
                };
            }
        } else {
            // Under retirement age (< 60)
            if (isWorking) {
                // Group 3: under retirement age, working
                return {
                    id: 3,
                    title: "Grupo 3: Joven (< 60 años), cotizando activamente",
                    description: "Eres menor de 60 años y sigues acumulando semanas de cotización formal. Estás en la posición perfecta para diseñar una estrategia ganadora de largo plazo.",
                    recommendations: [
                        "Tu principal meta actual es seguir sumando semanas cotizadas. Entre más semanas acumules, mayor será tu pensión.",
                        "Al cumplir los 55 años, prepara la transición para ingresar a Modalidad 40 de manera topada durante tus últimos 5 años de cotización."
                    ],
                    alternatives: [
                        "Planificación Progresiva: Continuar cotizando con tu patrón actual y simular anualmente tu retiro.",
                        "Modalidad 40 Proyectada: Ahorrar capital para contratar la Modalidad 40 topada de los 55 a los 60 años de edad."
                    ],
                    riskStatus: "LOW"
                };
            } else {
                // Group 4: under retirement age, NOT working
                let isVigente = true;
                if (lastBajaDate) {
                    const check = VigenciaGuard.checkRights(weeks, lastBajaDate);
                    isVigente = check.hasRights;
                }

                return {
                    id: 4,
                    title: "Grupo 4: Joven (< 60 años), dado de baja (Inactivo)",
                    description: "Eres menor de 60 años y te encuentras inactivo. Existe un alto riesgo de perder la vigencia de tus derechos si dejas pasar el tiempo sin cotizar.",
                    recommendations: [
                        isVigente 
                            ? "Tu vigencia está activa, pero se agota día con día. Te conviene reactivarte o inscribirte en Modalidad 40 antes de que expire tu período de gracia."
                            : "⚠️ Tus derechos han EXPIRADO. Debes cotizar 52 semanas consecutivas con un patrón para reactivar tus semanas cotizadas previas.",
                        "Recuerda que no puedes contratar Modalidad 40 si tu fecha de baja ante el IMSS excede los 5 años."
                    ],
                    alternatives: [
                        isVigente 
                            ? "Contratación de Modalidad 40: Entrar a Modalidad 40 para mantener vigencia y seguir sumando semanas baratas antes de los 55." 
                            : "Reactivación Laboral Obligatoria: Cotizar 1 año con patrón para reactivar semanas previas.",
                        "Esquemas Independientes: Evaluar Modalidad 10 (Trabajadores Independientes) del IMSS para cotizar legalmente sin depender de un patrón corporativo."
                    ],
                    riskStatus: isVigente ? "HIGH" : "CRITICAL"
                };
            }
        }
    }
}
