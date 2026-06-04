import { Sidebar } from '../../components/layout/sidebar';
import { auth } from '@/auth';
import StoreInitializer from '../../components/providers/StoreInitializer';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <StoreInitializer
                userId={session?.user?.id || null}
                userName={session?.user?.name || null}
                birthDate={session?.user?.birthDate}
                nss={session?.user?.nss}
                isWorking={session?.user?.isWorking}
                lastBajaDate={session?.user?.lastBajaDate}
            />
            <Sidebar />
            <div className="flex-1 w-full min-w-0 lg:p-4 lg:ml-[68px]">
                {children}
            </div>
        </div>
    );
}
