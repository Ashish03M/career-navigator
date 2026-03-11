import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "admin_token";

/** Derives an unpredictable session token from the admin password.
 *  Changes automatically if ADMIN_PASSWORD is rotated. */
function getTokenValue(): string {
    const secret = process.env.ADMIN_PASSWORD;
    if (!secret) throw new Error("ADMIN_PASSWORD env var is not set");
    return createHmac("sha256", secret).update("admin-session-v1").digest("hex");
}

/** Check password against the env var using a timing-safe comparison */
export function verifyPassword(password: string): boolean {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || !password) return false;
    const hmacKey = process.env.AUTH_SECRET || expected;
    // Hash both sides to ensure equal buffer lengths before timingSafeEqual
    const a = Buffer.from(createHmac("sha256", hmacKey).update(password).digest("hex"), "utf8");
    const b = Buffer.from(createHmac("sha256", hmacKey).update(expected).digest("hex"), "utf8");
    return timingSafeEqual(a, b);
}

/** Set the admin auth cookie */
export async function setAuthCookie(): Promise<void> {
    const store = await cookies();
    store.set(ADMIN_COOKIE, getTokenValue(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
    });
}

/** Clear the admin auth cookie */
export async function clearAuthCookie(): Promise<void> {
    const store = await cookies();
    store.delete(ADMIN_COOKIE);
}

/** Check if the current request is authenticated (for API routes) */
export function isAuthenticatedFromRequest(req: Request): boolean {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.split(";").find(c => c.trim().startsWith(`${ADMIN_COOKIE}=`));
    const value = match?.split("=")[1]?.trim() ?? "";
    if (!value) return false;
    const expected = getTokenValue();
    const a = Buffer.from(value, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

/** Verify request origin to prevent CSRF attacks.
 *  Returns true if the request comes from the same origin. */
export function verifyCsrfOrigin(req: Request): boolean {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    if (!origin && !referer) return false;

    const host = req.headers.get("host");
    if (!host) return false;

    const source = origin || referer;
    if (!source) return false;

    try {
        const url = new URL(source);
        return url.host === host;
    } catch {
        return false;
    }
}

/** Check if the current cookies indicate authentication (for server components / route handlers) */
export async function isAuthenticated(): Promise<boolean> {
    const store = await cookies();
    const cookie = store.get(ADMIN_COOKIE);
    if (!cookie?.value) return false;
    const expected = getTokenValue();
    const a = Buffer.from(cookie.value, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}
