import { logger } from "@/lib/logger";

export type LeadData = {
    fullName: string;
    email: string;
    targetRoleLabel: string;
    weeklyHours: string;
    timelineLabel: string;
    learnerType?: string;
};

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

export async function captureLead(data: LeadData): Promise<boolean> {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
        logger.warn("GOOGLE_SHEETS_WEBHOOK_URL is not defined. Skipping lead capture.");
        return false;
    }

    try {
        const payload = {
            timestamp: getISTTimestamp(),
            ...data,
        };

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            logger.error("Failed to capture lead", { status: response.status, statusText: response.statusText });
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Error capturing lead to Google Sheets", { error: error instanceof Error ? error.message : String(error) });
        return false;
    }
}

// ─── Feedback Capture ───────────────────────────────────────────────

export type FeedbackData = {
    rating: number;
    comment: string;
};

export async function captureFeedback(data: FeedbackData): Promise<boolean> {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
        logger.warn("GOOGLE_SHEETS_WEBHOOK_URL is not defined. Skipping feedback capture.");
        return false;
    }

    try {
        const payload = {
            type: "feedback",
            timestamp: getISTTimestamp(),
            rating: data.rating,
            comment: data.comment,
        };

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            logger.error("Failed to capture feedback", { status: response.status, statusText: response.statusText });
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Error capturing feedback to Google Sheets", { error: error instanceof Error ? error.message : String(error) });
        return false;
    }
}
