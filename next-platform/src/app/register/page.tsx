'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUserAction } from '@/actions/auth-actions';
import { useToast } from '@/components/ui/toast-context';
import { signIn } from 'next-auth/react';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('USER');
    const router = useRouter();
    const { showToast } = useToast();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const res = await registerUserAction(formData);

            if (!res.success) {
                showToast(res.error || "Error al registrar el usuario", "error");
                setLoading(false);
                return;
            }

            // Auto log-in after successful registration
            const signInRes = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.ok) {
                showToast("¡Cuenta creada exitosamente!", "success");
                router.push('/dashboard');
                router.refresh();
            } else {
                showToast("Registro exitoso, por favor inicia sesión.", "success");
                router.push('/login');
            }

        } catch (error) {
            showToast("Ocurrió un error inesperado al procesar el registro.", "error");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen relative flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-emerald-500/30">

            {/* Soft background grid for institutional feel */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#slate-200_1px,transparent_1px),linear-gradient(to_bottom,#slate-200_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.03] pointer-events-none"></div>

            {/* UI Overlay */}
            <div className="relative z-10 flex-1 flex flex-col">

                {/* Header */}
                <header className="w-full relative z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="max-w-7xl mx-auto flex justify-between items-center p-4 lg:px-8">
                        <Link href="/" className="flex items-center space-x-2 cursor-pointer select-none">
                            <span className="text-2xl font-bold tracking-tighter text-slate-900">
                                Retiro<span className="text-indigo-600">Maestro</span>
                            </span>
                        </Link>
                        <nav>
                            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                                Iniciar Sesión
                            </Link>
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">

                    <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-sm">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900 mb-3">
                            Asegura tu futuro financiero
                        </h1>
                        <p className="text-slate-600 max-w-sm mx-auto">
                            Crea tu cuenta libre para comenzar a maximizar tu pensión del IMSS con precisión actuarial.
                        </p>
                    </div>

                    {/* Authentication Module */}
                    <div className="w-full max-w-md animate-in zoom-in-95 duration-700 delay-150">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                                        Nombre Completo
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-400"
                                        placeholder="Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-400"
                                        placeholder="tu@correo.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-400"
                                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                    />
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        Mínimo 8 caracteres. Datos protegidos.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-bold text-slate-700 mb-2">
                                        ¿Cómo usarás la plataforma?
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="role"
                                            name="role"
                                            required
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        >
                                            <option value="USER">Personal: Calcularé mi propia pensión</option>
                                            <option value="ADVISOR">B2B: Soy Asesor / Gestionaré Múltiples Clientes</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {role === 'USER' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label htmlFor="residencyState" className="block text-sm font-bold text-slate-700 mb-2">
                                                Estado de Residencia
                                            </label>
                                            <select
                                                id="residencyState"
                                                name="residencyState"
                                                required
                                                defaultValue=""
                                                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            >
                                                <option value="" disabled>Selecciona tu Estado (Requerido)</option>
                                                <option value="Aguascalientes">Aguascalientes</option>
                                                <option value="Baja California">Baja California</option>
                                                <option value="CDMX">Ciudad de México</option>
                                                <option value="Chihuahua">Chihuahua</option>
                                                <option value="Coahuila">Coahuila</option>
                                                <option value="Edomex">Estado de México</option>
                                                <option value="Guanajuato">Guanajuato</option>
                                                <option value="Jalisco">Jalisco</option>
                                                <option value="Michoacan">Michoacán</option>
                                                <option value="Nuevo Leon">Nuevo León</option>
                                                <option value="Puebla">Puebla</option>
                                                <option value="Queretaro">Querétaro</option>
                                                <option value="Sinaloa">Sinaloa</option>
                                                <option value="Sonora">Sonora</option>
                                                <option value="Veracruz">Veracruz</option>
                                                <option value="Yucatan">Yucatán</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="advisorCode" className="block text-sm font-bold text-slate-700 mb-2">
                                                Código de Asesor (Opcional)
                                            </label>
                                            <input
                                                id="advisorCode"
                                                name="advisorCode"
                                                type="text"
                                                className="appearance-none block w-full px-4 py-3 border border-indigo-200 rounded-xl bg-indigo-50/50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-indigo-300"
                                                placeholder="Si un Asesor te recomendó, ingresa su código"
                                            />
                                            <p className="text-[10px] text-indigo-600/70 mt-1.5 ml-1">
                                                Vinculación directa a la red de tu Asesor
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-md font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 transition-all shadow-md group mt-8"
                                >
                                    {loading ? "Registrando..." : "Crear Cuenta"}
                                    {!loading && (
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <span className="text-sm text-slate-500">¿Ya tienes una cuenta? </span>
                                <Link href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Minimal */}
                <footer className="w-full py-8 text-center text-sm text-slate-500 relative z-20">
                    <div className="flex justify-center gap-6">
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Aviso de Privacidad</Link>
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Términos de Servicio</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
