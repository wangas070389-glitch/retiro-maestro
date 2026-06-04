import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
            {/* Soft background grid */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#slate-200_1px,transparent_1px),linear-gradient(to_bottom,#slate-200_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.03] pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 sm:py-24">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} />
                        Volver al Inicio
                    </Link>
                </div>

                {/* Hero Header */}
                <header className="mb-12 border-b border-slate-200 pb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100 shadow-sm">
                        <Shield size={24} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                        Aviso de Privacidad
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Última actualización: 30 de mayo de 2026. Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) en México.
                    </p>
                </header>

                {/* Content */}
                <article className="prose prose-slate max-w-none text-slate-600 space-y-6 text-justify leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">1. Identidad y Domicilio del Responsable</h2>
                        <p>
                            Retiro Maestro, con domicilio para oír y recibir notificaciones en Ciudad de México, México, es el responsable del uso y protección de sus datos personales. Nos comprometemos a salvaguardar la privacidad de sus datos y a cumplir con los principios constitucionales de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">2. Datos Personales que Recabamos</h2>
                        <p>
                            Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Datos de identificación y contacto (Nombre completo, correo electrónico, teléfono).</li>
                            <li>Información laboral e historial de cotizaciones (Semanas cotizadas ante el IMSS, salarios promedios registrados, historial de altas y bajas).</li>
                            <li>Información biométrica o de geolocalización (Estado de residencia para asignación geográfica de asesores).</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">3. Finalidades del Tratamiento de los Datos</h2>
                        <p>
                            Los datos personales que recabamos de usted serán utilizados para las siguientes finalidades primarias y necesarias para el servicio:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Realizar estimaciones y proyecciones actuariales personalizadas bajo la Ley del Seguro Social de 1973.</li>
                            <li>Brindar asesoría personalizada para la optimización del esquema de Modalidad 40.</li>
                            <li>Facilitar el contacto entre asesores calificados y ciudadanos (Leads) según su región geográfica.</li>
                            <li>Generar informes en formato PDF (Dictámenes Técnicos) que sirvan como guía de planeación financiera.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">4. Transferencia de Datos Personales</h2>
                        <p>
                            Sus datos personales pueden ser compartidos exclusivamente con asesores autorizados y aprobados dentro de la plataforma Retiro Maestro, con la única finalidad de brindarle una atención personalizada. No transferimos sus datos a terceros fuera de la plataforma sin su consentimiento expreso, salvo las excepciones previstas en el artículo 37 de la LFPDPPP.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">5. Derechos ARCO</h2>
                        <p>
                            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos se conocen como derechos ARCO.
                        </p>
                        <p>
                            Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través de un correo electrónico dirigido a <span className="font-semibold text-indigo-600">soporte@retiromaestro.com</span>.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">6. Cambios al Aviso de Privacidad</h2>
                        <p>
                            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los servicios que ofrecemos, de nuestras prácticas de privacidad o por cambios en nuestro modelo de negocio.
                        </p>
                        <p>
                            Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, a través de la publicación de las actualizaciones correspondientes en esta misma sección.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
