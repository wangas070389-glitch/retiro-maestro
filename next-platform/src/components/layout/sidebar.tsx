'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FlaskConical,
    Scale,
    LogOut,
    Menu,
    X,
    User,
    Settings,
    ShieldCheck,
    Users,
    History as HistoryIcon
} from 'lucide-react';
import { DocumentUploader } from '../ingestion/DocumentUploader';
import { TierBadge } from '../ui/TierBadge';

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const navigation = [
        { name: 'Simulador', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Expediente Legal', href: '/authority', icon: Scale },
        { name: 'Mi Perfil', href: '/profile', icon: User },
    ];

    if (session?.user?.role === 'ADVISOR' || session?.user?.role === 'ADMIN') {
        navigation.push({ name: 'Mi Portafolio', href: '/portfolio', icon: Users });
    }

    if (session?.user?.role === 'ADMIN') {
        navigation.push({ name: 'Admin Usuarios', href: '/admin/users', icon: ShieldCheck });
        navigation.push({ name: 'Configuración', href: '/settings', icon: Settings });
    }

    const isActive = (path: string) => pathname === path;

    // ===== MOBILE SIDEBAR (full content, drawer) =====
    const MobileSidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    Retiro<span className="text-indigo-500">Maestro</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 tracking-widest font-bold">Motor Actuarial</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden
                                ${active
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                            `}
                        >
                            {active && (
                                <motion.div
                                    layoutId="mobileActiveTab"
                                    className="absolute inset-0 bg-indigo-600 z-0"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <Icon size={20} className={`relative z-10 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                            <span className="font-bold text-sm relative z-10">{item.name}</span>
                        </Link>
                    );
                })}

                <div className="mt-6 px-1">
                    <DocumentUploader variant="compact" />
                </div>
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
                        <User size={16} className="text-indigo-400" />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate">{session?.user?.name || 'Usuario Soberano'}</p>
                        <TierBadge tier={(session?.user as any)?.tier || 'FREE'} className="mt-1" />
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/10 transition-colors"
                >
                    <LogOut size={14} />
                    DESCONECTAR SESIÓN
                </button>
            </div>
        </div>
    );

    // ===== DESKTOP SIDEBAR (collapsible icon rail → expanded on hover) =====
    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="lg:hidden flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-40 shadow-xl">
                <span className="font-bold text-indigo-400 text-lg">Retiro Maestro</span>
                <button
                    aria-label="Abrir Menú"
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sheet */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 shadow-2xl lg:hidden flex flex-col"
                        >
                            <div className="absolute top-4 right-4 z-50">
                                <button
                                    aria-label="Cerrar Menú"
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 bg-slate-800 text-slate-400 rounded-full hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <MobileSidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop: Collapsible Icon Rail */}
            <div
                className="hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`
                    flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isHovered ? 'w-72 shadow-2xl shadow-black/50' : 'w-[68px]'}
                `}>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center gap-3 h-[72px] shrink-0">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/50">
                            <span className="text-white font-black text-sm">R</span>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                            <h1 className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                                Retiro<span className="text-indigo-500">Maestro</span>
                            </h1>
                            <p className="text-[9px] text-slate-500 tracking-widest font-bold whitespace-nowrap">MOTOR ACTUARIAL</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    title={!isHovered ? item.name : undefined}
                                    className={`
                                        flex items-center gap-3 rounded-xl transition-all group relative overflow-hidden
                                        ${isHovered ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                                        ${active
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }
                                    `}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="desktopActiveTab"
                                            className="absolute inset-0 bg-indigo-600 z-0"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon size={20} className={`relative z-10 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                                    <span className={`
                                        font-bold text-sm relative z-10 whitespace-nowrap transition-all duration-300
                                        ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}
                                    `}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Document Uploader — only visible when expanded */}
                        <div className={`mt-4 px-1 transition-all duration-300 ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                            <DocumentUploader variant="compact" />
                        </div>
                    </nav>

                    {/* User Footer */}
                    <div className="p-2 border-t border-slate-800 bg-slate-950/30 shrink-0">
                        <div className={`
                            flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-2
                            ${isHovered ? '' : 'justify-center'}
                        `}>
                            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
                                <User size={16} className="text-indigo-400" />
                            </div>
                            <div className={`overflow-hidden flex-1 transition-all duration-300 ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                <p className="text-xs font-bold text-slate-200 truncate whitespace-nowrap">{session?.user?.name || 'Usuario Soberano'}</p>
                                <TierBadge tier={(session?.user as any)?.tier || 'FREE'} className="mt-1" />
                            </div>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            title={!isHovered ? 'Desconectar' : undefined}
                            className={`
                                w-full flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/10 transition-colors
                                ${isHovered ? 'justify-center' : 'justify-center'}
                            `}
                        >
                            <LogOut size={14} className="shrink-0" />
                            <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                                DESCONECTAR
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
