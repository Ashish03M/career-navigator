import fs from "fs/promises";
import path from "path";

export async function GET() {
    const dataFile = path.join(process.cwd(), "data", "syllabus_v3.json");
    try {
        await fs.access(dataFile);
    } catch {
        return Response.json(
            { status: "degraded", timestamp: new Date().toISOString(), error: "Data file inaccessible" },
            { status: 503 }
        );
    }

    return Response.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
}
