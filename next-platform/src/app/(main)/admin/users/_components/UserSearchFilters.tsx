import { Search } from 'lucide-react';

export type RoleFilter = 'ALL' | 'USER' | 'ADVISOR' | 'ADMIN';

export interface UserSearchFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    roleFilter: RoleFilter;
    setRoleFilter: (filter: RoleFilter) => void;
    roleFilters: { id: RoleFilter; label: string; count: number }[];
}

export function UserSearchFilters({
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    roleFilters
}: UserSearchFiltersProps) {
    return (
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
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black font-mono ${
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
    );
}
