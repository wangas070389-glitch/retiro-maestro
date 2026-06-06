'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
    getAllUsersAction,
    toggleUserApprovalAction,
    toggleUserBlockAction,
    resetUserPasswordAction,
    modifyUserClearanceAction
} from '@/actions/admin-actions';
import { useToast } from '@/components/ui/toast-context';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';

import { AdminStatsBanner } from './_components/AdminStatsBanner';
import { UserSearchFilters, type RoleFilter } from './_components/UserSearchFilters';
import { UsersDataTable } from './_components/UsersDataTable';
import { PasswordResetModal, type AdminUser } from './_components/PasswordResetModal';

export default function AdminUsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

    const advisors = useMemo(() => users.filter(u => u.role === 'ADVISOR' || u.role === 'ADMIN'), [users]);

    // Modal State
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

    const roleFilters: { id: RoleFilter; label: string; count: number }[] = [
        { id: 'ALL', label: 'Todos', count: stats.total },
        { id: 'USER', label: 'Ciudadanos', count: stats.citizens },
        { id: 'ADVISOR', label: 'Asesores', count: stats.advisors },
        { id: 'ADMIN', label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
    ];

    // Handlers
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

    async function handleResetPassword(userId: string, newPassword: string) {
        const res = await resetUserPasswordAction(userId, newPassword);
        if (res.success) {
            showToast("Password reset successfully", "success");
            setPasswordModalOpen(false);
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

    function openPasswordModal(user: AdminUser) {
        setSelectedUser(user);
        setPasswordModalOpen(true);
    }

    function openDeleteModal(user: AdminUser) {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    }

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
            <AdminStatsBanner stats={stats} />

            {/* Search + Filter Bar */}
            <UserSearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                roleFilters={roleFilters}
            />

            {/* Table */}
            <UsersDataTable
                loading={loading}
                filteredUsers={filteredUsers}
                advisors={advisors}
                searchQuery={searchQuery}
                totalStatsCount={stats.total}
                onRoleChange={handleRoleChange}
                onToggleApproval={handleToggleApproval}
                onToggleBlock={handleToggleBlock}
                onOpenPasswordModal={openPasswordModal}
                onOpenDeleteModal={openDeleteModal}
            />

            {/* Password Reset Modal */}
            {selectedUser && (
                <PasswordResetModal
                    isOpen={passwordModalOpen}
                    onClose={() => setPasswordModalOpen(false)}
                    user={selectedUser}
                    onResetPassword={handleResetPassword}
                />
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
