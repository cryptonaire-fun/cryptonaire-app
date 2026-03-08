import { apiClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthVerifyPayload {
    /** Base58 wallet public key */
    address: string;
    /** Base64-encoded bytes of the signed SIWS message */
    signedMessage: string;
    /** Base64-encoded bytes of the Ed25519 signature */
    signature: string;
}

export interface AuthUser {
    walletAddress: string;
    username?: string;
    avatar?: string;
    createdAt: string;
    lastLoginAt?: string;
}

export interface AuthVerifyResponse {
    token: string;
    user: AuthUser;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
    /**
     * POST /auth/verify
     * Verifies a SIWS signature and returns a JWT + user object.
     */
    verify: (payload: AuthVerifyPayload) =>
        apiClient.post<AuthVerifyResponse>("/auth/verify", payload),
};
