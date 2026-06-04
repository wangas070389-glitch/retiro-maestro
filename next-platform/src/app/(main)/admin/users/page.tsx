'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    ShieldCheck, 
    ShieldAlert, 
    KeyRound, 
    Ban, 
    CheckCircle2, 
    X,
    Trash2,
    Search,
    Users,
    UserCheck,
    UserX,
    Clock
} from 'lucide-react';
import {
    getAllUsersAction,
    toggleUserApprovalAction,
    toggleUserBlockAction,
    resetUserPasswordAction,
    modifyUserClearanceAction
} from '@/actions/admin-actions';
import { useToast } from '@/components/ui/toast-context';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import { TierBadge } from '@/components/ui/TierBadge';

interface AdminUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    tier: string;
    isApproved: boolean;
    isBlocked: boolean;
    advisorId: string | null;
}

type RoleFilter = 'ALL' | 'USER' | 'ADVISOR' | 'ADMIN';

export default function AdminUsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

    const advisors = users.filter(u => u.role === 'ADVISOR' || u.role === 'ADMIN');

    // Modal State
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const res = await getAllUsersAction();
        if (res.success && res.users) {
            setUsers(res.users);
        } else {
            showToast("Error loading users: " + res.error, "error");
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Derived Stats
    const stats = useMemo(() => ({
        total: users.length,
        advisors: users.filter(u => u.role === 'ADVISOR').length,
        citizens: users.filter(u => u.role === 'USER').length,
        blocked: users.filter(u => u.isBlocked).length,
        pending: users.filter(u => !u.isApproved && !u.isBlocked).length,
    }), [users]);

    // Filtered Users
    const filteredUsers = useMemo(() => {
        let result = users;
        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(u => 
                (u.name?.toLowerCase().includes(q)) || 
                (u.email?.toLowerCase().includes(q))
            );
        }
        return result;
    }, [users, roleFilter, searchQuery]);

    async function handleToggleApproval(userId: string, currentStatus: boolean) {
        const res = await toggleUserApprovalAction(userId, !currentStatus);
        if (res.success) {
            showToast(`User ${!currentStatus ? 'Approved' : 'Unapproved'}`, "success");
            loadUsers();
        } else {
            showToast(res.error ?? "Error", "error");
        }
    }

    async function handleToggleBlock(userId: string, currentStatus: boolean) {
        const res = await toggleUserBlockAction(userId, !currentStatus);
        if (res.success) {
            showToast(`User ${!currentStatus ? 'Blocked' : 'Unblocked'}`, "warning");
            loadUsers();
        } else {
            showToast(res.error ?? "Error", "error");
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedUser || newPassword.length < 6) return;

        const res = await resetUserPasswordAction(selectedUser.id, newPassword);
        if (res.success) {
            showToast("Password reset successfully", "success");
            setPasswordModalOpen(false);
            setNewPassword('');
        } else {
            showToast(res.error ?? "Error", "error");
        }
    }

    async function handleRoleChange(userId: string, newRole: string, currentTier: string, newAdvisorId?: string | null) {
        const res = await modifyUserClearanceAction(userId, newRole, currentTier, newAdvisorId);
        if (res.success) {
            showToast(`Clearance updated`, "success");
            loadUsers();
        } else {
            showToast(res.error ?? "Error", "error");
        }
    }

    const roleFilters: { id: RoleFilter; label: string; count: number }[] = [
        { id: 'ALL', label: 'Todos', count: stats.total },
        { id: 'USER', label: 'Ciudadanos', count: stats.citizens },
        { id: 'ADVISOR', label: 'Asesores', count: stats.advisors },
        { id: 'ADMIN', label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-xl text-red-600 border border-red-200 dark:border-red-800 shadow-sm">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Centro de Control</h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión de identidades, permisos y facturación.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Users, color: 'slate', bg: 'bg-slate-50 dark:bg-slate-900' },
                    { label: 'Ciudadanos', value: stats.citizens, icon: UserCheck, color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                    { label: 'Asesores', value: stats.advisors, icon: ShieldCheck, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                    { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                    { label: 'Bloqueados', value: stats.blocked, icon: UserX, color: 'red', bg: 'bg-red-50 dark:bg-red-950/20' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className={`${stat.bg} border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-all hover:shadow-md`}>
                            <div className="flex items-center justify-between mb-3">
                                <Icon size={18} className={`text-${stat.color}-500`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest text-${stat.color}-500`}>{stat.label}</span>
                            </div>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Role Filters */}
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {roleFilters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setRoleFilter(filter.id)}
                            className={`
                                px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2
                                ${roleFilter === filter.id
                                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }
                            `}
                        >
                            {filter.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                                roleFilter === filter.id 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
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
                            ) : filteredUsers.map(user => {
                                const rowBg = user.isBlocked 
                                    ? 'bg-red-50/30 dark:bg-red-950/10 opacity-60' 
                                    : user.role === 'ADMIN' 
                                        ? 'bg-amber-50/20 dark:bg-amber-950/5' 
                                        : user.role === 'ADVISOR' 
                                            ? 'bg-indigo-50/20 dark:bg-indigo-950/5' 
                                            : '';
                                return (
                                    <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${rowBg}`}>
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
                                                onChange={(e) => handleRoleChange(user.id, e.target.value, user.tier, user.advisorId)}
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
                                                    onChange={(e) => handleRoleChange(user.id, user.role, user.tier, e.target.value)}
                                                >
                                                    <option value="unassigned">Sin Asesor</option>
                                                    {advisors.map(adv => (
                                                        <option key={adv.id} value={adv.id}>{adv.email}</option>
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
                                                    onChange={(e) => handleRoleChange(user.id, user.role, e.target.value, user.advisorId)}
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
                                                        onClick={() => handleToggleApproval(user.id, user.isApproved)}
                                                        className={`p-2 rounded-lg transition-colors border ${user.isApproved ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-100' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'}`}
                                                        title={user.isApproved ? 'Revocar Acceso' : 'Aprobar Ingreso'}
                                                    >
                                                        <CheckCircle2 size={15} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setPasswordModalOpen(true);
                                                    }}
                                                    className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                                                    title="Forzar Reset de Password"
                                                >
                                                    <KeyRound size={15} />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                                                    className={`p-2 rounded-lg transition-colors border ${user.isBlocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-300 dark:border-slate-700 hover:bg-slate-200' : 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-800 hover:bg-red-100'}`}
                                                    title={user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                                >
                                                    <Ban size={15} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 bg-red-600 text-white border border-red-700 hover:bg-red-700 rounded-lg transition-all shadow-md shadow-red-500/10 active:scale-95"
                                                    title="PURGAR USUARIO"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {filteredUsers.length} de {stats.total} registros
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Motor Soberano v4.0
                    </p>
                </div>
            </div>

            {/* Password Reset Modal */}
            {passwordModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/30">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <KeyRound size={18} className="text-indigo-600" />
                                Reset de Contraseña
                            </h3>
                            <button onClick={() => setPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title="Cerrar modal" aria-label="Cerrar modal">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6">
                            <p className="text-sm text-slate-500 mb-6">
                                Vas a sobreescribir la contraseña de: <br />
                                <strong className="text-slate-800 dark:text-white font-mono text-xs">{selectedUser.email}</strong>
                            </p>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">Nueva Contraseña Temporal</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm dark:text-slate-200"
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                            >
                                Ejecutar Override de Contraseña
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {deleteModalOpen && selectedUser && (
                <DeleteUserModal
                    user={selectedUser}
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onSuccess={loadUsers}
                />
            )}
        </div>
    );
}
