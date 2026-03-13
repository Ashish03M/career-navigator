import mysql, { Pool } from "mysql2/promise";
import { logger } from "@/lib/logger";

// ─── Types ──────────────────────────────────────────────────────────

export type LeadData = {
    fullName: string;
    email: string;
    targetRoleLabel: string;
    sessionId?: string;
};

export type FeedbackData = {
    rating: number;
    comment: string;
    sessionId?: string;
};

// ─── Connection Pool ────────────────────────────────────────────────

let pool: Pool | null = null;

function getPool(): Pool | null {
    if (pool) return pool;

    const url = process.env.MYSQL_URL;
    if (!url) return null;

    pool = mysql.createPool({
        uri: url,
        waitForConnections: true,
        connectionLimit: 5,
        idleTimeout: 60_000,
        enableKeepAlive: true,
    });
    return pool;
}

// ─── Auto-migration ─────────────────────────────────────────────────

let tableEnsured = false;

async function ensureTable(db: Pool): Promise<void> {
    if (tableEnsured) return;
    await db.execute(`
        CREATE TABLE IF NOT EXISTS submissions (
            id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            full_name   VARCHAR(255) NULL,
            email       VARCHAR(255) NULL,
            target_role VARCHAR(255) NULL,
            rating      TINYINT UNSIGNED NULL,
            comment     TEXT         NULL,
            session_id  VARCHAR(100) NULL,
            INDEX idx_session_id (session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    tableEnsured = true;
}

// ─── Lead Capture ───────────────────────────────────────────────────

export async function captureLead(data: LeadData): Promise<boolean> {
    const db = getPool();
    if (!db) {
        logger.warn("MySQL not configured. Skipping lead capture.");
        return false;
    }

    try {
        await ensureTable(db);

        if (data.sessionId) {
            const [rows] = await db.execute<mysql.RowDataPacket[]>(
                "SELECT id FROM submissions WHERE session_id = ? LIMIT 1",
                [data.sessionId],
            );
            if (rows.length > 0) {
                await db.execute(
                    `UPDATE submissions
                     SET full_name = ?, email = ?, target_role = ?, session_id = NULL
                     WHERE id = ?`,
                    [data.fullName, data.email, data.targetRoleLabel, rows[0].id],
                );
                return true;
            }
        }

        await db.execute(
            `INSERT INTO submissions (full_name, email, target_role, session_id)
             VALUES (?, ?, ?, ?)`,
            [data.fullName, data.email, data.targetRoleLabel, data.sessionId || null],
        );
        return true;
    } catch (error) {
        logger.error("Failed to capture lead", {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

// ─── Feedback Capture ───────────────────────────────────────────────

export async function captureFeedback(data: FeedbackData): Promise<boolean> {
    const db = getPool();
    if (!db) {
        logger.warn("MySQL not configured. Skipping feedback capture.");
        return false;
    }

    try {
        await ensureTable(db);

        if (data.sessionId) {
            const [rows] = await db.execute<mysql.RowDataPacket[]>(
                "SELECT id FROM submissions WHERE session_id = ? LIMIT 1",
                [data.sessionId],
            );
            if (rows.length > 0) {
                await db.execute(
                    `UPDATE submissions
                     SET rating = ?, comment = ?, session_id = NULL
                     WHERE id = ?`,
                    [data.rating, data.comment, rows[0].id],
                );
                return true;
            }
        }

        await db.execute(
            `INSERT INTO submissions (rating, comment, session_id)
             VALUES (?, ?, ?)`,
            [data.rating, data.comment, data.sessionId || null],
        );
        return true;
    } catch (error) {
        logger.error("Failed to capture feedback", {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}
