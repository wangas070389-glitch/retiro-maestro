import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-55 bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100 shadow-sm">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                        Términos de Servicio
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Última actualización: 30 de mayo de 2026. Por favor lea atentamente los presentes términos reguladores.
                    </p>
                </header>

                {/* Content */}
                <article className="prose prose-slate max-w-none text-slate-600 space-y-6 text-justify leading-relaxed">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar el sitio web y la plataforma de simulación Retiro Maestro, usted acuerda estar sujeto a los presentes Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguna parte de estos términos, tiene prohibido utilizar o acceder a esta plataforma.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">2. Descripción de los Servicios y Deslinde Actuarial</h2>
                        <p>
                            Retiro Maestro provee herramientas digitales de simulación financiera basadas en la Ley del Seguro Social de 1973 de México, incluyendo estimación de pensiones, cálculo de exenciones fiscales bajo el Artículo 96 de la LISR y proyecciones de Modalidad 40.
                        </p>
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg text-amber-900 text-xs">
                            <span className="font-bold">ADVERTENCIA LEGAL:</span> Las estimaciones provistas por Retiro Maestro son para fines educativos y simulaciones ilustrativas. Retiro Maestro no es una entidad gubernamental, no está afiliado al Instituto Mexicano del Seguro Social (IMSS) ni emite resoluciones oficiales de pensión. La resolución final del monto de pensión y la vigencia de derechos corresponde única y exclusivamente al IMSS.
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">3. Licencia de Uso</h2>
                        <p>
                            Se concede permiso para descargar temporalmente una copia de los informes generados (Dictamen Técnico en formato PDF) en la plataforma Retiro Maestro para uso personal, no comercial o para uso en asesorías profesionales autorizadas (en caso de poseer una suscripción de Asesor B2B). Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Modificar o alterar el código fuente de los motores de cálculo o del software.</li>
                            <li>Eliminar los deslindes de responsabilidad legal obligatorios incluidos en los reportes PDF.</li>
                            <li>Intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en Retiro Maestro.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">4. Registro y Seguridad de Cuentas</h2>
                        <p>
                            Para hacer uso de los paneles de control e histórico de estudios, el usuario deberá crear una cuenta de acceso proporcionando datos verídicos y actualizados. Es responsabilidad del usuario mantener la confidencialidad de sus contraseñas. Nos reservamos el derecho de bloquear, suspender o revocar la aprobación de cualquier cuenta que incurra en malas prácticas o intente violar la seguridad de la infraestructura.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">5. Limitación de Responsabilidad</h2>
                        <p>
                            En ningún caso Retiro Maestro o sus desarrolladores serán responsables por cualquier daño directo, indirecto, incidental o consecuente derivado del uso o de la imposibilidad de uso de las simulaciones y proyecciones de la plataforma, aun cuando se haya notificado verbalmente o por escrito de la posibilidad de tales daños. Recomendamos a todos los usuarios validar los resultados de sus simulaciones ante un asesor legal certificado o directamente en las subdelegaciones del IMSS.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-950">6. Jurisdicción y Ley Aplicable</h2>
                        <p>
                            Cualquier reclamación relacionada con el sitio web de Retiro Maestro se regirá por las leyes de la República Mexicana, sin consideración a sus disposiciones sobre conflictos de leyes. Cualquier disputa judicial se someterá a la jurisdicción exclusiva de los tribunales competentes de la Ciudad de México, México.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
