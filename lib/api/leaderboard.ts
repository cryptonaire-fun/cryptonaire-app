import { apiClient } from "./client";

export interface LeaderboardEntry {
    id: string;
    walletAddress: string;
    points: number;
    rank: number;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        entries: T[];
        total: number;
        limit: number;
        offset: number;
    };
}

export interface SingleEntryResponse<T> {
    success: boolean;
    data: T;
}

export interface SetPointsPayload {
    points: number;
}

export const leaderboardApi = {
    /**
     * Get the ranked leaderboard (Public)
     */
    getLeaderboard: (params?: { limit?: number; offset?: number }) => {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) query.append("limit", params.limit.toString());
        if (params?.offset !== undefined) query.append("offset", params.offset.toString());

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return apiClient.get<PaginatedResponse<LeaderboardEntry>>(`/leaderboard${queryString}`);
    },

    /**
     * Get a single entry by wallet address (Public)
     */
    getEntry: (address: string) => {
        return apiClient.get<SingleEntryResponse<LeaderboardEntry>>(`/leaderboard/${address}`);
    },

    /**
     * Set points for a wallet (Requires JWT)
     */
    setPoints: (address: string, payload: SetPointsPayload) => {
        return apiClient.put<SingleEntryResponse<LeaderboardEntry>>(`/leaderboard/${address}`, payload);
    },

    /**
     * Remove an entry and re-rank (Requires JWT)
     */
    deleteEntry: (address: string) => {
        return apiClient.delete<{ success: boolean; message: string }>(`/leaderboard/${address}`);
    },
};
