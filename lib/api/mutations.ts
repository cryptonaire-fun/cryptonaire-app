import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, AuthVerifyPayload, AuthVerifyResponse } from "./auth";
import { gameApi, GenerateQuestionsPayload, GenerateQuestionsResponse, UpdateBothPayload, UpdatePointsPayload, UpdateResponse, UpdateTokensPayload } from "./game";
import { leaderboardApi, LeaderboardEntry, SetPointsPayload, SingleEntryResponse } from "./leaderboard";
import { queryKeys } from "./queries";
import { UpdateUsernamePayload, userApi, UserProfileResponse } from "./user";

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Mutation that posts a SIWS proof to POST /auth/verify.
 * Returns { token, user } on success.
 */
export function useVerifySignInMutation(
    options?: {
        onSuccess?: (data: AuthVerifyResponse) => void;
        onError?: (error: Error) => void;
    },
) {
    return useMutation<AuthVerifyResponse, Error, AuthVerifyPayload>({
        mutationFn: (payload) => authApi.verify(payload),
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

/**
 * Mutation that sets points for a wallet. Triggers a re-rank.
 */
export function useSetLeaderboardPointsMutation(
    options?: {
        onSuccess?: (data: SingleEntryResponse<LeaderboardEntry>) => void;
        onError?: (error: Error) => void;
    },
) {
    const queryClient = useQueryClient();

    return useMutation<SingleEntryResponse<LeaderboardEntry>, Error, { address: string; payload: SetPointsPayload }>({
        mutationFn: ({ address, payload }) => leaderboardApi.setPoints(address, payload),
        onSuccess: (data, variables) => {
            // Invalidate leaderboard list and the specific entry
            queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}

/**
 * Mutation that deletes a leaderboard entry for a wallet.
 */
export function useDeleteLeaderboardEntryMutation(
    options?: {
        onSuccess?: (data: { success: boolean; message: string }) => void;
        onError?: (error: Error) => void;
    },
) {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean; message: string }, Error, string>({
        mutationFn: (address) => leaderboardApi.deleteEntry(address),
        onSuccess: (data, address) => {
            // Invalidate leaderboard list and the specific entry
            queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}

// ─── Game ────────────────────────────────────────────────────────────────

/**
 * Mutation that calls POST /game/generate-questions.
 * Returns 20 AI-generated trivia questions.
 */
export function useGenerateQuestionsMutation(
    options?: {
        onSuccess?: (data: GenerateQuestionsResponse) => void;
        onError?: (error: Error) => void;
    },
) {
    return useMutation<GenerateQuestionsResponse, Error, GenerateQuestionsPayload | undefined>({
        mutationFn: (payload) => gameApi.generateQuestions(payload),
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });
}

/**
 * Mutation that calls POST /game/add-to-user-points.
 * Atomically increments the user's points. Invalidates user cache.
 */
export function useAddToUserPointsMutation(
    options?: {
        onSuccess?: (data: UpdateResponse) => void;
        onError?: (error: Error) => void;
    },
) {
    const queryClient = useQueryClient();

    return useMutation<UpdateResponse, Error, UpdatePointsPayload>({
        mutationFn: (payload) => gameApi.addToUserPoints(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}

/**
 * Mutation that calls POST /game/add-to-user-tokens.
 * Atomically increments the user's $SKR tokens. Invalidates user cache.
 */
export function useAddToUserTokensMutation(
    options?: {
        onSuccess?: (data: UpdateResponse) => void;
        onError?: (error: Error) => void;
    },
) {
    const queryClient = useQueryClient();

    return useMutation<UpdateResponse, Error, UpdateTokensPayload>({
        mutationFn: (payload) => gameApi.addToUserTokens(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}

/**
 * Mutation that calls POST /game/add-to-user-both.
 * Atomically increments both points and $SKR tokens in one DB operation.
 * Invalidates user and leaderboard cache.
 */
export function useAddToUserBothMutation(
    options?: {
        onSuccess?: (data: UpdateResponse) => void;
        onError?: (error: Error) => void;
    },
) {
    const queryClient = useQueryClient();

    return useMutation<UpdateResponse, Error, UpdateBothPayload>({
        mutationFn: (payload) => gameApi.addToUserBoth(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}

// ─── User ──────────────────────────────────────────────────────────────────

/**
 * Mutation that calls PATCH /user/me/username.
 * Updates the username and invalidates the user query to refresh UI.
 */
export function useUpdateUsernameMutation(
    options?: {
        onSuccess?: (data: UserProfileResponse) => void;
        onError?: (error: Error) => void;
    },
) {
    const queryClient = useQueryClient();

    return useMutation<UserProfileResponse, Error, UpdateUsernamePayload>({
        mutationFn: (payload) => userApi.updateUsername(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}
