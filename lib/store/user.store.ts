import { LevelProgressData, UserProfile, userApi } from "@/lib/api/user";
import { create } from "zustand";

// Re-export so consumers can import from one place
export type { LevelProgressData, UserProfile };

// ─── State ────────────────────────────────────────────────────────────────────

interface UserState {
    /** Full user profile fetched from GET /user/me */
    profile: UserProfile | null;
    /** Level progress fetched from GET /user/me/progress */
    progress: LevelProgressData | null;
    /** True while any API request is in-flight */
    isLoading: boolean;
    /** True once the initial fetch pair has completed (success or fail) */
    isHydrated: boolean;

    // ── Actions ───────────────────────────────────────────────────────────────
    /** Fetch profile + level progress in parallel — call on app boot after auth */
    fetchUser: () => Promise<void>;
    /** Optimistically patch local profile fields (e.g. after a points mutation) */
    updateProfile: (partial: Partial<UserProfile>) => void;
    /** Optimistically patch progress fields (e.g. after answering a question) */
    updateProgress: (partial: Partial<LevelProgressData>) => void;
    /** Clear all user state on sign-out */
    clear: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>((set, get) => ({
    profile: null,
    progress: null,
    isLoading: false,
    isHydrated: false,

    fetchUser: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
            // Fetch profile and level progress in parallel
            const [profileRes, progressRes] = await Promise.all([
                userApi.getMe(),
                userApi.getMyProgress(),
            ]);
            set({
                profile: profileRes.data as UserProfile,
                progress: progressRes.data,
                isHydrated: true,
                isLoading: false,
            });
        } catch {
            set({ isHydrated: true, isLoading: false });
        }
    },

    updateProfile: (partial) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, ...partial } });
    },

    updateProgress: (partial) => {
        const current = get().progress;
        if (!current) return;
        set({ progress: { ...current, ...partial } });
    },

    clear: () => set({ profile: null, progress: null, isLoading: false, isHydrated: false }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUserProfile = (s: UserState) => s.profile;
export const selectUserProgress = (s: UserState) => s.progress;
export const selectUserLevel = (s: UserState) => s.progress?.level ?? 1;
export const selectUserPoints = (s: UserState) => s.profile?.points ?? 0;
export const selectUserTokens = (s: UserState) => s.profile?.skrTokens ?? 0;
export const selectUserIsHydrated = (s: UserState) => s.isHydrated;
