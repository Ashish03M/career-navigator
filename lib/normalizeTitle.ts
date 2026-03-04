/**
 * Strips schedule-numbering prefixes from raw syllabus display names.
 *
 * Handles patterns like:
 *   "Week 3: Advanced Python"        → "Advanced Python"
 *   "Week 12, 13: DevOps..."         → "DevOps..."
 *   "Week 6, 7, 8: Math & Stats..."  → "Math & Stats..."
 *   "Week 6-8: Math & Stats..."      → "Math & Stats..."
 *   "Week 33+: Career & Branding"    → "Career & Branding"
 *   "Module 1: Python"               → "Python"
 *   "Module 3: Math & Statistics"    → "Math & Statistics"
 *   "1. Python Fundamentals"         → "Python Fundamentals"
 *   "2) SQL Basics"                  → "SQL Basics"
 *   "Already clean title"            → "Already clean title"
 *
 * The returned string is the clean MODULE title, free of any
 * source-specific schedule numbering.
 */
export function normalizeTitle(raw: string): string {
    return raw
        .trim()
        // "Week 3: ...", "Week 6, 7, 8: ...", "Week 6-8: ...", "Week 33+: ..."
        .replace(/^Week\s+[\d,\s\-+]+:\s*/i, "")
        // "Module 1: ...", "Module 12: ..."
        .replace(/^Module\s+\d+:\s*/i, "")
        // "1. ...", "12. ..."
        .replace(/^\d+\.\s+/, "")
        // "1) ...", "12) ..."
        .replace(/^\d+\)\s+/, "")
        .trim();
}

