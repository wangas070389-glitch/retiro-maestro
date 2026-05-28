import { create } from 'zustand'
import { PensionInput, PensionResult } from '../lib/engine/pension-engine'

interface ScenarioState {
    input: PensionInput;
    result: PensionResult | null;
}

export interface CertifiedDossier {
    source_filename: string;
    confidence: number;
    extracted_at: string;
    nss: string;
    curp: string;
}

interface UserProfile {
    name: string;
    isEmployed: boolean;
    nss: string;
}

interface SimulationStore {
    userId: string | null;
    certified_dossier: CertifiedDossier | null;
    scenarioA: ScenarioState;
    userProfile: UserProfile;
    setUserId: (id: string | null) => void;
    setCertifiedDossier: (dossier: CertifiedDossier | null) => void;
    setUserProfile: (profile: Partial<UserProfile>) => void;
    updateScenarioA: (input: Partial<PensionInput>) => void;
}

const initialInput: PensionInput = {
    weeks: 1250,
    salary_prom: 500,
    age: 60,
    has_wife: true,
    children_count: 0,
    dependent_parents_count: 0,
    retirement_age: 65,
    is_ongoing_work: true,
    children_data: []
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
    userId: null,
    certified_dossier: null,
    scenarioA: {
        input: { ...initialInput },
        result: null,
    },
    userProfile: {
        name: "Usuario Soberano",
        isEmployed: true,
        nss: "1234567890"
    },

    setUserId: (userId) => set({ userId }),

    setCertifiedDossier: (dossier) => set({ certified_dossier: dossier }),

    setUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
    })),

    updateScenarioA: (input) => set((state) => ({
        scenarioA: { ...state.scenarioA, input: { ...state.scenarioA.input, ...input } }
    })),
}));
