import { verifyPassword, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password, action } = body;

        if (action === "logout") {
            await clearAuthCookie();
            return Response.json({ ok: true });
        }

        // Rate limit login attempts by IP
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";
        const { allowed, remaining, resetAt } = checkRateLimit(ip);

        if (!allowed) {
            const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
            return Response.json(
                { error: "Too many login attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        if (!password || typeof password !== "string") {
            return Response.json(
                { error: "Password is required", attemptsRemaining: remaining },
                { status: 400 }
            );
        }

        if (!verifyPassword(password)) {
            return Response.json(
                { error: "Invalid password", attemptsRemaining: remaining },
                { status: 401 }
            );
        }

        // Successful login — clear rate limit record
        resetRateLimit(ip);
        await setAuthCookie();
        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: "Invalid request" }, { status: 400 });
    }
}
