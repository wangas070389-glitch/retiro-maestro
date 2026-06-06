import { Ban, CheckCircle2, ShieldAlert, KeyRound, Trash2 } from 'lucide-react';
import { TierBadge } from '@/components/ui/TierBadge';
import type { AdminUser } from './PasswordResetModal';

export interface UserDataRowProps {
    user: AdminUser;
    advisors: AdminUser[];
    onRoleChange: (userId: string, newRole: string, currentTier: string, newAdvisorId?: string | null) => Promise<void>;
    onToggleApproval: (userId: string, currentStatus: boolean) => Promise<void>;
    onToggleBlock: (userId: string, currentStatus: boolean) => Promise<void>;
    onOpenPasswordModal: (user: AdminUser) => void;
    onOpenDeleteModal: (user: AdminUser) => void;
}

export function UserDataRow({
    user,
    advisors,
    onRoleChange,
    onToggleApproval,
    onToggleBlock,
    onOpenPasswordModal,
    onOpenDeleteModal
}: UserDataRowProps) {
    const rowBg = user.isBlocked
        ? 'bg-red-50/30 dark:bg-red-950/10 opacity-60'
        : user.role === 'ADMIN'
            ? 'bg-amber-50/20 dark:bg-amber-950/5'
            : user.role === 'ADVISOR'
                ? 'bg-indigo-50/20 dark:bg-indigo-950/5'
                : '';

    return (
        <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${rowBg}`}>
            {/* User */}
            <td className="py-4 px-6">
                <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{user.name || 'Sin Nombre'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                </div>
            </td>
            {/* Role */}
            <td className="py-4 px-6">
                <select
                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold px-3 py-1.5 outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    value={user.role}
                    title="Rol de usuario"
                    aria-label="Rol de usuario"
                    onChange={(e) => onRoleChange(user.id, e.target.value, user.tier, user.advisorId)}
                >
                    <option value="USER">USER</option>
                    <option value="ADVISOR">ADVISOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </td>
            {/* Advisor */}
            <td className="py-4 px-6">
                {user.role === 'USER' ? (
                    <select
                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold px-3 py-1.5 outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 w-full max-w-[160px] cursor-pointer"
                        value={user.advisorId || 'unassigned'}
                        title="Asesor B2B2C Vinculado"
                        aria-label="Asesor B2B2C Vinculado"
                        onChange={(e) => onRoleChange(user.id, user.role, user.tier, e.target.value)}
                    >
                        <option value="unassigned">Sin Asesor</option>
                        {advisors.map(adv => (
                            <option key={adv.id} value={adv.id} className="font-mono text-[11px]">{adv.email}</option>
                        ))}
                    </select>
                ) : (
                    <span className="text-xs text-slate-400 font-mono">N/A</span>
                )}
            </td>
            {/* Tier */}
            <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                    <TierBadge tier={user.tier} />
                    <select
                        className="bg-transparent border-none text-[10px] font-bold outline-none text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 w-5 appearance-none"
                        value={user.tier}
                        onChange={(e) => onRoleChange(user.id, user.role, e.target.value, user.advisorId)}
                        title="Cambiar nivel"
                        aria-label="Cambiar nivel de suscripción"
                    >
                        <option value="FREE">FREE</option>
                        <optgroup label="Ciudadano (B2C)">
                            <option value="STRATEGY">STRATEGY</option>
                            <option value="DOSSIER">DOSSIER</option>
                        </optgroup>
                        <optgroup label="Asesor (B2B)">
                            <option value="STARTER">STARTER</option>
                            <option value="GROWTH">GROWTH</option>
                            <option value="PRO">PRO</option>
                        </optgroup>
                    </select>
                </div>
            </td>
            {/* Status */}
            <td className="py-4 px-6">
                <div className="flex items-center justify-center">
                    {user.isBlocked ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-[10px] font-bold border border-red-200 dark:border-red-800"><Ban size={12} /> Bloqueado</span>
                    ) : user.isApproved ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={12} /> Activo</span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold border border-amber-200 dark:border-amber-800"><ShieldAlert size={12} /> Pendiente</span>
                    )}
                </div>
            </td>
            {/* Actions */}
            <td className="py-4 px-6 text-right">
                <div className="flex justify-end gap-1.5">
                    {!user.isBlocked && (
                        <button
                            onClick={() => onToggleApproval(user.id, user.isApproved)}
                            className={`p-2 rounded-lg transition-colors border ${user.isApproved ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-100' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'}`}
                            title={user.isApproved ? 'Revocar Acceso' : 'Aprobar Ingreso'}
                        >
                            <CheckCircle2 size={15} />
                        </button>
                    )}

                    <button
                        onClick={() => onOpenPasswordModal(user)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Forzar Reset de Password"
                    >
                        <KeyRound size={15} />
                    </button>

                    <button
                        onClick={() => onToggleBlock(user.id, user.isBlocked)}
                        className={`p-2 rounded-lg transition-colors border ${user.isBlocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-300 dark:border-slate-700 hover:bg-slate-200' : 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-800 hover:bg-red-100'}`}
                        title={user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                    >
                        <Ban size={15} />
                    </button>

                    <button
                        onClick={() => onOpenDeleteModal(user)}
                        className="p-2 bg-red-600 text-white border border-red-700 hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-500/10 active:scale-95"
                        title="PURGAR USUARIO"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
