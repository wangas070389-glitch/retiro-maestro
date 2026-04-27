import { create } from 'zustand';

interface LedgerEntry {
    id: string;
    tuple: string;
    signature: string;
    pension_amount: number;
}

interface LedgerStore {
    entries: LedgerEntry[];
}

export const useLedgerStore = create<LedgerStore>(() => ({
    entries: []
}));
