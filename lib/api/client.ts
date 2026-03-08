import { useAuthStore } from "@/lib/store/auth.store";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://cryptonaire-app-backend.onrender.com"
        : process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly body?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = useAuthStore.getState().token;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    // Parse body regardless of status so we can include it in errors
    let body: unknown;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        body = await res.json();
    } else {
        body = await res.text();
    }

    if (!res.ok) {
        const message =
            typeof body === "object" &&
                body !== null &&
                "message" in body &&
                typeof (body as { message: unknown }).message === "string"
                ? (body as { message: string }).message
                : `HTTP ${res.status}`;

        throw new ApiError(res.status, message, body);
    }

    return body as T;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const apiClient = {
    get: <T>(path: string, options?: RequestInit) =>
        apiFetch<T>(path, { ...options, method: "GET" }),

    post: <T>(path: string, data?: unknown, options?: RequestInit) =>
        apiFetch<T>(path, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        }),

    put: <T>(path: string, data?: unknown, options?: RequestInit) =>
        apiFetch<T>(path, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    patch: <T>(path: string, data?: unknown, options?: RequestInit) =>
        apiFetch<T>(path, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: <T>(path: string, options?: RequestInit) =>
        apiFetch<T>(path, { ...options, method: "DELETE" }),
};
