import { useQuery } from "@tanstack/react-query";
import { AuthUser } from "./auth";
import { apiClient } from "./client";
import { leaderboardApi, LeaderboardEntry, PaginatedResponse, SingleEntryResponse } from "./leaderboard";
import { LevelProgressResponse, userApi, UserPointsResponse, UserProfileResponse, UserTokensResponse } from "./user";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
    auth: {
        all: ["auth"] as const,
        me: () => ["auth", "me"] as const,
    },
    leaderboard: {
        all: ["leaderboard"] as const,
        list: (params?: { limit?: number; offset?: number }) => ["leaderboard", "list", params] as const,
        entry: (address: string) => ["leaderboard", "entry", address] as const,
    },
    user: {
        all: ["user"] as const,
        me: () => ["user", "me"] as const,
        points: () => ["user", "me", "points"] as const,
        tokens: () => ["user", "me", "tokens"] as const,
        progress: () => ["user", "me", "progress"] as const,
    },
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches the currently authenticated user from GET /auth/me.
 * Only enabled when a truthy `enabled` flag is passed.
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
    return useQuery<AuthUser>({
        queryKey: queryKeys.auth.me(),
        queryFn: () => apiClient.get<AuthUser>("/auth/me"),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 60 * 5, // 5 min — user profile rarely changes
    });
}

/**
 * Fetches the ranked leaderboard from GET /leaderboard.
 */
export function useLeaderboardQuery(params?: { limit?: number; offset?: number }, options?: { enabled?: boolean }) {
    return useQuery<PaginatedResponse<LeaderboardEntry>>({
        queryKey: queryKeys.leaderboard.list(params),
        queryFn: () => leaderboardApi.getLeaderboard(params),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Fetches a single leaderboard entry from GET /leaderboard/:address.
 */
export function useLeaderboardEntryQuery(address: string, options?: { enabled?: boolean }) {
    return useQuery<SingleEntryResponse<LeaderboardEntry>>({
        queryKey: queryKeys.leaderboard.entry(address),
        queryFn: () => leaderboardApi.getEntry(address),
        enabled: !!address && (options?.enabled ?? true),
        staleTime: 1000 * 30, // 30 seconds
    });
}

// ─── User Queries ─────────────────────────────────────────────────────────────

/**
 * Fetches the full profile of the authenticated user from GET /user/me.
 */
export function useUserProfileQuery(options?: { enabled?: boolean }) {
    return useQuery<UserProfileResponse>({
        queryKey: queryKeys.user.me(),
        queryFn: () => userApi.getMe(),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 60 * 5, // 5 min — profile rarely changes
    });
}

/**
 * Fetches only the user's accumulated points from GET /user/me/points.
 * Lightweight — safe for frequent UI polling.
 */
export function useUserPointsQuery(options?: { enabled?: boolean }) {
    return useQuery<UserPointsResponse>({
        queryKey: queryKeys.user.points(),
        queryFn: () => userApi.getMyPoints(),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Fetches only the user's accumulated $SKR tokens from GET /user/me/tokens.
 * Lightweight — safe for frequent UI polling.
 */
export function useUserTokensQuery(options?: { enabled?: boolean }) {
    return useQuery<UserTokensResponse>({
        queryKey: queryKeys.user.tokens(),
        queryFn: () => userApi.getMyTokens(),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 30, // 30 seconds
    });
}

/**
 * Fetches the user's current level and progress breakdown from GET /user/me/progress.
 * Stale after 30 seconds — updates after every correct answer via cache invalidation.
 */
export function useUserProgressQuery(options?: { enabled?: boolean }) {
    return useQuery<LevelProgressResponse>({
        queryKey: queryKeys.user.progress(),
        queryFn: () => userApi.getMyProgress(),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 30, // 30 seconds
    });
}
