import { z } from "zod";
import { captureLead } from "@/lib/leads/sheets";
import { checkRateLimit } from "@/lib/rateLimit";
import { verifyCsrfOrigin } from "@/lib/auth";
import { logger } from "@/lib/logger";

const leadSchema = z.object({
    fullName: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    targetRoleLabel: z.string(),
    sessionId: z.string().max(100).optional().default(""),
    honeypot: z.string().optional(), // Hidden field for bot protection
});

export async function POST(request: Request) {
    if (!verifyCsrfOrigin(request)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(`leads:${ip}`, 10);
    if (!rl.allowed) {
        return Response.json(
            { error: "Too many requests" },
            { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const body = await request.json();
        const validation = leadSchema.safeParse(body);

        if (!validation.success) {
            return Response.json(
                { error: "Invalid data", details: validation.error.format() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Simple honeypot check
        if (data.honeypot && data.honeypot.trim() !== "") {
            // Silently reject bots (return success to confuse them)
            return Response.json({ success: true });
        }

        const success = await captureLead({
            fullName: data.fullName,
            email: data.email,
            targetRoleLabel: data.targetRoleLabel,
            sessionId: data.sessionId,
        });

        if (!success) {
            logger.error("leads:capture failed", { ip });
        }

        return Response.json({ success: true });

    } catch (error) {
        logger.error("leads:POST failed", { error: error instanceof Error ? error.message : String(error) });
        return Response.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
