/**
 * Simple in-memory rate limiter.
 * Works for single-instance deployments (Docker, single Node process).
 * For multi-instance / serverless deployments, replace with a Redis-backed solution.
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string, maxAttempts: number = MAX_ATTEMPTS): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
} {
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, remaining: maxAttempts - 1, resetAt: now + WINDOW_MS };
    }

    if (record.count >= maxAttempts) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}

export function resetRateLimit(key: string): void {
    store.delete(key);
}
