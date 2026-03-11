import { readSyllabus, writeSyllabus } from "@/lib/syllabusStore";
import { isAuthenticatedFromRequest, verifyCsrfOrigin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const chapterSchema = z.object({
    id: z.string(),
    title: z.string(),
    subjectId: z.string(),
    topics: z.array(z.string()),
    durationWeeks: z.number(),
    isProject: z.boolean().optional(),
    isInternship: z.boolean().optional(),
    resources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
});

const subjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    color: z.string(),
    category: z.enum(["foundation", "core-ai", "specialization", "career"]),
    chapterIds: z.array(z.string()),
    tags: z.object({ category: z.string(), level: z.string() }).optional(),
});

const syllabusSchema = z.object({
    subjects: z.array(subjectSchema),
    chapters: z.array(chapterSchema),
});

export async function GET(req: Request) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(`syllabus:${ip}`, 30);
    if (!rl.allowed) {
        return Response.json(
            { error: "Too many requests" },
            { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        if (type === "free") {
            const filePath = path.join(process.cwd(), "data", "free_syllabus.json");
            const fileContent = await fs.readFile(filePath, "utf-8");
            const data = JSON.parse(fileContent);
            return Response.json(data);
        }

        const data = await readSyllabus();
        return Response.json(data);
    } catch (err) {
        logger.error("syllabus:GET failed", { error: err instanceof Error ? err.message : String(err) });
        return Response.json({ error: "Failed to read syllabus" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // CSRF protection: verify request comes from same origin
    if (!verifyCsrfOrigin(req)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAuthenticatedFromRequest(req)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = syllabusSchema.safeParse(body);

        if (!result.success) {
            return Response.json(
                { error: "Invalid syllabus data", details: result.error.format() },
                { status: 400 }
            );
        }

        await writeSyllabus(result.data);
        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}
