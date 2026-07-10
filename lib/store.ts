// ─────────────────────────────────────────────────────────────────────────────
// Zustand global store for CreatorBrainOG
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CreatorProfile, CreatorDNA, Suggestion, NicheType } from '@/types';

interface CreatorStore {
    // Current profile
    profile: CreatorProfile | null;
    setProfile: (profile: CreatorProfile | null) => void;

    // Analysis results
    dna: CreatorDNA | null;
    suggestions: Suggestion[];
    setAnalysisResults: (dna: CreatorDNA, suggestions: Suggestion[]) => void;

    // UI state
    selectedNiche: NicheType;
    setSelectedNiche: (niche: NicheType) => void;

    bharatMode: boolean;
    setBharatMode: (enabled: boolean) => void;

    isDemoMode: boolean;
    setDemoMode: (demo: boolean) => void;

    // Analysis loading state
    isAnalyzing: boolean;
    analysisStep: number;
    setIsAnalyzing: (v: boolean) => void;
    setAnalysisStep: (step: number) => void;

    // Notifications (mock)
    notifications: Notification[];
    addNotification: (n: Notification) => void;
    clearNotifications: () => void;

    // Reset
    reset: () => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const initialState = {
    profile: null,
    dna: null,
    suggestions: [],
    selectedNiche: 'music' as NicheType,
    bharatMode: false,
    isDemoMode: false,
    isAnalyzing: false,
    analysisStep: 0,
    notifications: [],
};

export const useCreatorStore = create<CreatorStore>()(
    persist(
        (set) => ({
            ...initialState,
            setProfile: (profile) => set({ profile }),
            setAnalysisResults: (dna, suggestions) => set({ dna, suggestions }),
            setSelectedNiche: (selectedNiche) => set({ selectedNiche }),
            setBharatMode: (bharatMode) => set({ bharatMode }),
            setDemoMode: (isDemoMode) => set({ isDemoMode }),
            setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
            setAnalysisStep: (analysisStep) => set({ analysisStep }),
            addNotification: (n) =>
                set((state) => ({ notifications: [n, ...state.notifications] })),
            clearNotifications: () => set({ notifications: [] }),
            reset: () =>
                set({
                    profile: null,
                    dna: null,
                    suggestions: [],
                    isAnalyzing: false,
                    analysisStep: 0,
                }),
        }),
        {
            name: 'creatorbrainog-store',
            partialize: (state) => ({
                selectedNiche: state.selectedNiche,
                bharatMode: state.bharatMode,
                isDemoMode: state.isDemoMode,
            }),
        }
    )
);
