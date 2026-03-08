import { apiClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface GenerateQuestionsPayload {
    /** Previously asked questions the AI should avoid duplicating. */
    previousQuestions?: string[];
    /**
     * Difficulty level (1–100). Defaults to 1.
     * Higher values prompt the AI to generate more obscure, technical, and nuanced questions.
     */
    level?: number;
}

export interface GenerateQuestionsResponse {
    success: boolean;
    count: number;
    data: Question[];
}

export interface UserPointsTokensData {
    points: number;
    skrTokens: number;
}

export interface UpdatePointsPayload {
    points: number;
}

export interface UpdateTokensPayload {
    tokens: number;
}

export interface UpdateBothPayload {
    points: number;
    tokens: number;
}

export interface UpdateResponse {
    success: boolean;
    data: UserPointsTokensData;
}

// ─── Game API ─────────────────────────────────────────────────────────────────

export const gameApi = {
    /**
     * POST /game/generate-questions
     * Uses Groq AI to generate 20 unique trivia questions.
     * Optionally accepts a list of previous questions to avoid duplicating.
     * Requires JWT.
     */
    generateQuestions: (payload?: GenerateQuestionsPayload) =>
        apiClient.post<GenerateQuestionsResponse>("/game/generate-questions", payload ?? {}),

    /**
     * POST /game/add-to-user-points
     * Atomically increments the authenticated user's points.
     * Requires JWT.
     */
    addToUserPoints: (payload: UpdatePointsPayload) =>
        apiClient.post<UpdateResponse>("/game/add-to-user-points", payload),

    /**
     * POST /game/add-to-user-tokens
     * Atomically increments the authenticated user's $SKR tokens.
     * Requires JWT.
     */
    addToUserTokens: (payload: UpdateTokensPayload) =>
        apiClient.post<UpdateResponse>("/game/add-to-user-tokens", payload),

    /**
     * POST /game/add-to-user-both
     * Atomically increments both the user's points and $SKR tokens in one operation.
     * Requires JWT.
     */
    addToUserBoth: (payload: UpdateBothPayload) =>
        apiClient.post<UpdateResponse>("/game/add-to-user-both", payload),
};
