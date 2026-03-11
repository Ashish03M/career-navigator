import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Derive the expected admin token using Web Crypto API (Edge-compatible) */
async function getExpectedToken(): Promise<string> {
    const secret = process.env.ADMIN_PASSWORD;
    if (!secret) return "";
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("admin-session-v1"));
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/** Timing-safe string comparison */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip the login page itself
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    // Check for admin_token cookie and validate its value
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    const expected = await getExpectedToken();
    if (!expected || !timingSafeEqual(token, expected)) {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
