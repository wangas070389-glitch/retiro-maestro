import { UserDataRow } from './UserDataRow';
import type { AdminUser } from './PasswordResetModal';

export interface UsersDataTableProps {
    loading: boolean;
    filteredUsers: AdminUser[];
    advisors: AdminUser[];
    searchQuery: string;
    totalStatsCount: number;
    onRoleChange: (userId: string, newRole: string, currentTier: string, newAdvisorId?: string | null) => Promise<void>;
    onToggleApproval: (userId: string, currentStatus: boolean) => Promise<void>;
    onToggleBlock: (userId: string, currentStatus: boolean) => Promise<void>;
    onOpenPasswordModal: (user: AdminUser) => void;
    onOpenDeleteModal: (user: AdminUser) => void;
}

export function UsersDataTable({
    loading,
    filteredUsers,
    advisors,
    searchQuery,
    totalStatsCount,
    onRoleChange,
    onToggleApproval,
    onToggleBlock,
    onOpenPasswordModal,
    onOpenDeleteModal
}: UsersDataTableProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="py-4 px-6 font-bold text-slate-500 text-[10px] tracking-widest uppercase">Usuario</th>
                            <th className="py-4 px-6 font-bold text-slate-500 text-[10px] tracking-widest uppercase">Rol</th>
                            <th className="py-4 px-6 font-bold text-slate-500 text-[10px] tracking-widest uppercase">Asesor</th>
                            <th className="py-4 px-6 font-bold text-slate-500 text-[10px] tracking-widest uppercase">Nivel</th>
                            <th className="py-4 px-6 font-bold text-slate-500 text-[10px] tracking-widest uppercase text-center">Estado</th>
                            <th className="py-4 px-6 font-bold text-slate-500 text-[10px] tracking-widest uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest">Cargando matriz...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                    <span className="text-sm font-medium">Sin resultados para &quot;{searchQuery}&quot;</span>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <UserDataRow
                                    key={user.id}
                                    user={user}
                                    advisors={advisors}
                                    onRoleChange={onRoleChange}
                                    onToggleApproval={onToggleApproval}
                                    onToggleBlock={onToggleBlock}
                                    onOpenPasswordModal={onOpenPasswordModal}
                                    onOpenDeleteModal={onOpenDeleteModal}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {filteredUsers.length} de {totalStatsCount} registros
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Motor Soberano v4.0
                </p>
            </div>
        </div>
    );
}
