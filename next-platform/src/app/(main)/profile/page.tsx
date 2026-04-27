'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
    User, 
    KeyRound, 
    ShieldCheck, 
    Store, 
    MapPin, 
    Calculator, 
    CreditCard 
} from 'lucide-react';

import { TierBadge } from '@/components/ui/TierBadge';
import { GeneralTab } from '@/components/profile/tabs/GeneralTab';
import { SecurityTab } from '@/components/profile/tabs/SecurityTab';
import { BrandingTab } from '@/components/profile/tabs/BrandingTab';
import { OperationTab } from '@/components/profile/tabs/OperationTab';
import { DossierTab } from '@/components/profile/tabs/DossierTab';
import { SubscriptionTab } from '@/components/profile/tabs/SubscriptionTab';

type TabId = 'general' | 'security' | 'branding' | 'operation' | 'dossier' | 'subscription';

interface TabConfig {
    id: TabId;
    label: string;
    icon: React.ElementType;
    roles?: string[]; // if undefined, all roles see it
}

const TABS: TabConfig[] = [
    { id: 'general', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: KeyRound },
    { id: 'branding', label: 'Marca Blanca', icon: Store, roles: ['ADVISOR', 'ADMIN'] },
    { id: 'operation', label: 'Operación', icon: MapPin, roles: ['ADVISOR', 'ADMIN'] },
    { id: 'dossier', label: 'Dossier', icon: Calculator },
    { id: 'subscription', label: 'Suscripción', icon: CreditCard },
];

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const role = session?.user?.role || 'USER';

    const visibleTabs = TABS.filter(tab => !tab.roles || tab.roles.includes(role));

    function renderContent() {
        switch (activeTab) {
            case 'general':
                return <GeneralTab session={session} updateSession={updateSession} />;
            case 'security':
                return <SecurityTab />;
            case 'branding':
                return <BrandingTab session={session} updateSession={updateSession} />;
            case 'operation':
                return <OperationTab session={session} updateSession={updateSession} />;
            case 'dossier':
                return <DossierTab session={session} updateSession={updateSession} />;
            case 'subscription':
                return <SubscriptionTab />;
            default:
                return <GeneralTab session={session} updateSession={updateSession} />;
        }
    }

    return (
        <div className="flex-1 w-full pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="px-6 md:px-8 max-w-6xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-3 text-indigo-500 mb-1">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-xs tracking-[0.2em] font-medium uppercase">Identidad Soberana</span>
                        </div>
                        <h1 className="text-3xl font-light tracking-tight text-slate-800 dark:text-slate-100">
                            Mi <span className="font-semibold">Configuración</span>
                        </h1>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Actual</span>
                        <TierBadge tier={(session?.user as any)?.tier || 'FREE'} className="scale-110 origin-right" />
                    </div>
                </div>
            </header>

            {/* Settings Hub Layout */}
            <div className="px-6 md:px-8 max-w-6xl mx-auto pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Navigation Rail */}
                    <nav className="lg:w-56 shrink-0">
                        {/* Mobile: horizontal scroll */}
                        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1 lg:sticky lg:top-24">
                            {visibleTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200
                                            ${isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                        <span className="hidden lg:inline">{tab.label}</span>
                                        {/* Mobile: show label */}
                                        <span className="lg:hidden">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Right Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm min-h-[500px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
