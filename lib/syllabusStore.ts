import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { SyllabusData } from "./syllabusTypes";

const DATA_PATH = path.join(process.cwd(), "data", "syllabus_v3.json");

export async function readSyllabus(): Promise<SyllabusData> {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as SyllabusData;
}

// In-process write lock to prevent concurrent writes from corrupting data
let writeLock: Promise<void> = Promise.resolve();

export async function writeSyllabus(data: SyllabusData): Promise<void> {
    const previous = writeLock;
    let resolve: () => void;
    writeLock = new Promise<void>((r) => { resolve = r; });
    await previous;
    try {
        // Backup current file before overwriting
        const backupPath = DATA_PATH.replace(".json", ".backup.json");
        try {
            await fs.copyFile(DATA_PATH, backupPath);
        } catch {
            // First write — no existing file to back up
        }

        // Atomic write: write to temp file then rename
        const tmpPath = `${DATA_PATH}.${randomUUID()}.tmp`;
        await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
        await fs.rename(tmpPath, DATA_PATH);
    } finally {
        resolve!();
    }
}
