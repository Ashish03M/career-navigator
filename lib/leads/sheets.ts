import { google } from "googleapis";
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

// ─── Google Sheets API Client ───────────────────────────────────────

function getSheetsClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
        return null;
    }

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return { sheets: google.sheets({ version: "v4", auth }), sheetId };
}

/** Format current time in IST (Asia/Kolkata) */
function getISTTimestamp(): string {
    return new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

/**
 * Find a row by sessionId in column G.
 * Returns the 1-indexed row number, or -1 if not found.
 */
async function findRowBySessionId(
    sheets: ReturnType<typeof google.sheets>,
    spreadsheetId: string,
    sessionId: string,
): Promise<number> {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!G:G",
    });
    const rows = res.data.values || [];
    for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i]?.[0] === sessionId) {
            return i + 1; // Sheets API is 1-indexed
        }
    }
    return -1;
}

// ─── Lead Capture ───────────────────────────────────────────────────
// Columns: A=Timestamp, B=Name, C=Email, D=Target Role,
//          E=Rating, F=Feedback, G=SessionId

export async function captureLead(data: LeadData): Promise<boolean> {
    const client = getSheetsClient();
    if (!client) {
        logger.warn("Google Sheets API credentials not configured. Skipping lead capture.");
        return false;
    }

    try {
        // Check if a row already exists for this session (feedback submitted first)
        if (data.sessionId) {
            const targetRow = await findRowBySessionId(client.sheets, client.sheetId, data.sessionId);
            if (targetRow > 0) {
                // Read existing E-F (feedback) before overwriting
                const existing = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sheetId,
                    range: `Sheet1!E${targetRow}:F${targetRow}`,
                });
                const [rating, comment] = existing.data.values?.[0] || ["", ""];

                // Write lead data (A-D) + preserve feedback (E-F) + clear sessionId (G)
                await client.sheets.spreadsheets.values.update({
                    spreadsheetId: client.sheetId,
                    range: `Sheet1!A${targetRow}:G${targetRow}`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [[
                            getISTTimestamp(),
                            data.fullName,
                            data.email,
                            data.targetRoleLabel,
                            rating, comment, "",
                        ]],
                    },
                });
                return true;
            }
        }

        // No existing row — append new row
        await client.sheets.spreadsheets.values.append({
            spreadsheetId: client.sheetId,
            range: "Sheet1!A:G",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    getISTTimestamp(),
                    data.fullName,
                    data.email,
                    data.targetRoleLabel,
                    "",  // Rating (filled by feedback)
                    "",  // Feedback (filled by feedback)
                    data.sessionId || "",
                ]],
            },
        });

        return true;
    } catch (error) {
        logger.error("Failed to capture lead", { error: error instanceof Error ? error.message : String(error) });
        return false;
    }
}

// ─── Feedback Capture ───────────────────────────────────────────────

export async function captureFeedback(data: FeedbackData): Promise<boolean> {
    const client = getSheetsClient();
    if (!client) {
        logger.warn("Google Sheets API credentials not configured. Skipping feedback capture.");
        return false;
    }

    try {
        // Check if a row already exists for this session (lead submitted first)
        if (data.sessionId) {
            const targetRow = await findRowBySessionId(client.sheets, client.sheetId, data.sessionId);
            if (targetRow > 0) {
                // Update feedback (E-F) and clear sessionId (G)
                await client.sheets.spreadsheets.values.update({
                    spreadsheetId: client.sheetId,
                    range: `Sheet1!E${targetRow}:G${targetRow}`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [[data.rating, data.comment, ""]],
                    },
                });
                return true;
            }
        }

        // No existing row — append new row with feedback + sessionId
        await client.sheets.spreadsheets.values.append({
            spreadsheetId: client.sheetId,
            range: "Sheet1!A:G",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    getISTTimestamp(),
                    "", "", "",
                    data.rating,
                    data.comment,
                    data.sessionId || "",
                ]],
            },
        });

        return true;
    } catch (error) {
        logger.error("Failed to capture feedback", { error: error instanceof Error ? error.message : String(error) });
        return false;
    }
}
