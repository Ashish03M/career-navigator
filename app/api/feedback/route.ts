import { z } from "zod";
import { captureFeedback } from "@/lib/leads/sheets";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

const feedbackSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(""),
});

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(`feedback:${ip}`, 10);
    if (!rl.allowed) {
        return Response.json(
            { error: "Too many requests" },
            { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const body = await request.json();
        const validation = feedbackSchema.safeParse(body);

        if (!validation.success) {
            return Response.json(
                { error: "Invalid data", details: validation.error.format() },
                { status: 400 }
            );
        }

        const data = validation.data;

        const success = await captureFeedback({
            rating: data.rating,
            comment: data.comment,
        });

        if (!success) {
            logger.error("feedback:capture failed", { ip });
        }

        return Response.json({ success: true });
    } catch (error) {
        logger.error("feedback:POST failed", { error: error instanceof Error ? error.message : String(error) });
        return Response.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
