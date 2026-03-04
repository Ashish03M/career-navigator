/**
 * PDF Design System — Codebasics Brand
 *
 * Contains all visual tokens for @react-pdf/renderer.
 * Decoupled from Tailwind / globals.css — PDF-only values.
 *
 * Colors: Codebasics palette (#3B82F6, #6F53C1, #181830, #D7EF3F)
 * Fonts:  Saira Condensed (headings) + Kanit (body)
 *
 * Font registration is handled lazily in registerFonts.ts
 * to avoid loading @react-pdf/renderer on initial page load.
 */

// ─── Colors ──────────────────────────────────────────────────────────

export const COLORS = {
    // Brand primaries
    primary: "#3B82F6",        // Blue — main brand color
    primaryDark: "#2563EB",    // Hover/darker blue
    accent: "#6F53C1",         // Purple accent
    highlight: "#D7EF3F",      // Lime yellow — for highlights
    navy: "#3F4C78",           // Navy muted
    dark: "#181830",           // Near-black dark

    // Surfaces
    background: "#FFFFFF",
    backgroundAlt: "#F8FAFC",  // Card backgrounds
    backgroundDark: "#0B0F19", // Dark mode surface

    // Text
    text: "#0F172A",           // Primary body text
    textSecondary: "#475569",  // Secondary text (slate-600)
    textOnDark: "#E5E7EB",     // Text on dark surfaces
    muted: "#64748B",          // De-emphasis

    // Borders
    border: "#E2E8F0",         // Slate-200
    borderLight: "#F1F5F9",    // Slate-100

    // Tints
    blueTint: "#EFF6FF",       // Blue-50
    greenTint: "#F0FDF4",      // Green-50
    purpleTint: "#F5F3FF",     // Violet-50
    highlightTint: "#F7FDE0",

    // Semantic
    success: "#22C55E",        // Green-500
    successDark: "#15803D",    // Green-700
} as const;

/**
 * Phase accent palette — cycles for left-border colors on module cards.
 * Drawn from Codebasics brand primary + secondary colors.
 */
export const PHASE_PALETTE = [
    "#3B82F6", // Blue (brand primary)
    "#6F53C1", // Purple (brand accent)
    "#3F4C78", // Navy
    "#20C997", // Green (secondary)
    "#2563EB", // Blue dark
    "#FD7E15", // Orange (secondary)
    "#D63384", // Pink (secondary)
    "#7C3AED", // Violet
] as const;

// ─── Typography ──────────────────────────────────────────────────────

export const FONTS = {
    heading: "SairaCondensed",      // Bold headings
    body: "Kanit",                  // Body text
    bodyBold: "Kanit",              // Semibold variant (use fontWeight: 600)
    fallback: "Helvetica",          // Built-in fallback
} as const;

export const SIZES = {
    // Cover page
    coverTitle: 44,
    coverSubtitle: 16,
    coverGreeting: 13,

    // Content pages
    sectionTitle: 22,
    weekTitle: 15,
    moduleTitle: 11,

    // Body
    body: 11,
    small: 10,
    nano: 8,

    // Stats
    statValue: 22,
    statLabel: 9,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────

export const SPACING = {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    xxl: 28,
    xxxl: 36,
    pageH: 36,   // Horizontal page padding
    pageV: 36,   // Vertical page padding
} as const;

// ─── Card Presets ────────────────────────────────────────────────────

export const CARD = {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundAlt,
    padding: SPACING.md,
    paddingSm: SPACING.sm,
} as const;

// ─── Filename Utilities ──────────────────────────────────────────────

/**
 * Sanitize a string for use in filenames.
 * Removes special chars, replaces spaces with underscores.
 */
export function sanitizeFilename(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").trim();
}

/**
 * Generate a standardized PDF filename.
 * Format: Career_Roadmap_<FirstName>_<RoleLabel>.pdf
 */
export function pdfFilename(fullName: string, roleLabel: string): string {
    const firstName = sanitizeFilename(fullName.split(" ")[0]);
    const role = sanitizeFilename(roleLabel);
    return `Career_Roadmap_${firstName}_${role}.pdf`;
}
