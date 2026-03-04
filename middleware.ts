import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip the login page itself
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    // Check for admin_token cookie
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
