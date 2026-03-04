/**
 * CareerRoadmapPdf — Premium Codebasics-branded PDF template.
 *
 * RENDERING ONLY — no business logic. All data comes from PlanResult.
 *
 * Structure:
 *   Page 1  — Cover (logo, title, greeting, metadata, journey overview)
 *   Page 2  — Summary (stats grid, "Why this plan for you")
 *   Page 3+ — Content (weekly roadmap with compact module cards)
 *
 * Design principles (Codebasics Brand Style Guide v2.0):
 *   - Sage archetype: clean, reliable, authoritative
 *   - Colors: Blue #3B82F6, Purple #6F53C1, Lime #D7EF3F accents
 *   - Fonts: SairaCondensed (headings), Kanit (body)
 *   - Always "learner" not "user", always "Codebasics"
 */
import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    Image,
    Link,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import { type PlanResult, type Phase } from "@/lib/types";
import { type Chapter } from "@/lib/bootcampData";
import { COLORS, FONTS, SIZES, SPACING, CARD, PHASE_PALETTE } from "../designTokens";

// ─── Types ───────────────────────────────────────────────────────────

export type PdfUserInfo = {
    name: string;
    email: string;
};

export type PdfMeta = {
    targetRoleLabel: string;
    durationLabel: string;
    weeklyHoursLabel: string;
    sourceLabel?: string;
};

export type PdfInput = {
    user: PdfUserInfo;
    plan: PlanResult;
    meta: PdfMeta;
};

// ─── Constants ───────────────────────────────────────────────────────

const MAX_TOPICS = 15;
const MAX_RESOURCES = 3;
const MAX_JOURNEY_ITEMS = 14;
const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const LOGO_PATH = isNode ? `${process.cwd()}/public/logo.png` : "/logo.png";
const SITE_URL = "https://codebasics.io";
const FOOTER_DISPLAY = "codebasics.io";
const COPYRIGHT = "\u00A9 Codebasics";

// ─── Helpers ─────────────────────────────────────────────────────────

function getPhaseColor(phaseIndex: number): string {
    return PHASE_PALETTE[(phaseIndex - 1) % PHASE_PALETTE.length];
}

function formatModuleDuration(weeks: number): string {
    if (weeks <= 0) return "";
    if (weeks < 1) return "< 1 week";
    const rounded = Math.round(weeks * 2) / 2;
    if (rounded === 1) return "1 week";
    return `~${rounded} weeks`;
}

// ─── Styles ──────────────────────────────────────────────────────────

const s = StyleSheet.create({
    // ── Shared page base ────────────────────────────────────────────
    page: {
        fontFamily: FONTS.body,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.pageH,
        paddingVertical: SPACING.pageV,
        paddingBottom: 50,
        color: COLORS.text,
        fontSize: SIZES.body,
        lineHeight: 1.45,
    },

    // ── Cover Page ──────────────────────────────────────────────────
    coverPage: {
        fontFamily: FONTS.body,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.pageH + 4,
        paddingVertical: SPACING.pageV,
        color: COLORS.text,
        flexDirection: "column",
    },
    coverContent: {
        flex: 1,
        justifyContent: "center",
        gap: SPACING.xl,
    },
    logo: {
        width: 130,
        marginBottom: SPACING.md,
    },
    coverTitleBlock: {
        marginBottom: SPACING.sm,
    },
    coverTitle: {
        fontSize: SIZES.coverTitle,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.dark,
        lineHeight: 1.05,
    },
    accentBar: {
        width: 50,
        height: 3,
        backgroundColor: COLORS.highlight,
        marginTop: SPACING.sm,
        marginBottom: SPACING.md,
    },
    coverSubtitle: {
        fontSize: SIZES.coverSubtitle,
        color: COLORS.navy,
        letterSpacing: 0.3,
    },
    greetingBlock: {
        marginBottom: SPACING.lg,
    },
    greetingText: {
        fontSize: SIZES.coverGreeting,
        color: COLORS.textSecondary,
        lineHeight: 1.6,
        marginBottom: SPACING.xs,
    },
    greetingName: {
        fontWeight: 600,
        color: COLORS.text,
    },
    // Metadata chips
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.sm,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.blueTint,
        borderRadius: 100,
        paddingVertical: SPACING.xs + 1,
        paddingHorizontal: SPACING.lg,
    },
    chipLabel: {
        fontSize: SIZES.small,
        color: COLORS.muted,
        marginRight: SPACING.xs,
        fontWeight: 500,
    },
    chipValue: {
        fontSize: SIZES.small,
        fontWeight: 700,
        color: COLORS.primaryDark,
        fontFamily: FONTS.heading,
    },
    // Journey overview (replaces "Starting Steps" preview)
    journeySection: {
        marginTop: SPACING.xxl,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    journeySectionTitle: {
        fontSize: SIZES.small,
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: SPACING.md,
        fontWeight: 700,
    },
    journeyItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    journeyDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: SPACING.sm,
    },
    journeyLabel: {
        fontSize: SIZES.small,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.primary,
    },
    journeyName: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    // Watermark
    watermark: {
        position: "absolute",
        bottom: 80,
        right: 36,
        fontSize: 60,
        color: COLORS.dark,
        opacity: 0.03,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        letterSpacing: 4,
        zIndex: -1,
    },
    // Cover footer
    coverFooter: {
        position: "absolute",
        bottom: SPACING.pageV,
        left: SPACING.pageH + 4,
        right: SPACING.pageH + 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
    },
    footerText: {
        fontSize: SIZES.nano,
        color: COLORS.muted,
    },
    footerLink: {
        fontSize: SIZES.nano,
        color: COLORS.primary,
        textDecoration: "none",
    },

    // ── Summary Page ────────────────────────────────────────────────
    summaryTitle: {
        fontSize: SIZES.sectionTitle,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.dark,
        marginBottom: SPACING.xl,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: 155,
        backgroundColor: COLORS.backgroundAlt,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: CARD.borderRadius,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.sm,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
    },
    statValue: {
        fontSize: SIZES.statValue,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.primary,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: SIZES.statLabel,
        color: COLORS.muted,
        textTransform: "uppercase" as const,
        letterSpacing: 0.8,
        textAlign: "center",
        fontWeight: 600,
    },
    whySection: {
        marginTop: SPACING.md,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    whyTitle: {
        fontSize: SIZES.weekTitle,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.dark,
        marginBottom: SPACING.md,
    },
    whyItem: {
        flexDirection: "row",
        marginBottom: SPACING.sm,
    },
    whyBullet: {
        fontSize: SIZES.body,
        color: COLORS.accent,
        marginRight: SPACING.sm,
        lineHeight: 1.45,
    },
    whyText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        lineHeight: 1.45,
        flex: 1,
    },

    // ── Content Pages ───────────────────────────────────────────────
    weekHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.sm,
        marginTop: SPACING.lg,
        paddingBottom: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    // Remove extra top margin on the very first week header
    weekHeaderFirst: {
        marginTop: 0,
    },
    weekBadge: {
        fontSize: 8,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.background,
        backgroundColor: COLORS.primary,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 3,
        marginRight: SPACING.sm,
    },
    weekName: {
        fontSize: SIZES.weekTitle,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.dark,
        flex: 1,
    },
    weekDuration: {
        fontSize: SIZES.small,
        color: COLORS.muted,
        fontWeight: 600,
    },
    // Module card — compact with colored left border
    moduleCard: {
        backgroundColor: COLORS.backgroundAlt,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderLeftWidth: 3,
        borderRadius: CARD.borderRadius,
        padding: CARD.padding,
        marginBottom: SPACING.sm,
    },
    moduleTitle: {
        fontSize: SIZES.moduleTitle,
        fontWeight: 600,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    moduleMeta: {
        flexDirection: "row",
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    badge: {
        fontSize: SIZES.nano,
        color: COLORS.primaryDark,
        backgroundColor: COLORS.blueTint,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontWeight: 600,
    },
    projectBadge: {
        fontSize: SIZES.nano,
        color: COLORS.successDark,
        backgroundColor: COLORS.greenTint,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontWeight: 600,
    },
    topicsList: {
        marginTop: 2,
        paddingLeft: 2,
    },
    topicItem: {
        flexDirection: "row",
        marginBottom: 3,
    },
    topicBullet: {
        fontSize: 9,
        color: COLORS.primary,
        marginRight: SPACING.xs,
        lineHeight: 1.35,
    },
    topicText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        lineHeight: 1.35,
        flex: 1,
    },
    // Resources
    resourcesSection: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        flexDirection: "row",
        gap: SPACING.md,
        flexWrap: "wrap",
    },
    resourceLink: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        textDecoration: "none",
        fontWeight: 500,
    },

    // ── Fixed footer elements ───────────────────────────────────────
    footerBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: COLORS.primary,
    },
    footerRow: {
        position: "absolute",
        bottom: 18,
        left: SPACING.pageH,
        right: SPACING.pageH,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pageNumber: {
        fontSize: SIZES.nano,
        color: COLORS.muted,
        textAlign: "center",
    },
    contentFooter: {
        fontSize: SIZES.nano,
        color: COLORS.border,
    },
    contentFooterRight: {
        fontSize: SIZES.nano,
        color: COLORS.primary,
        textDecoration: "none",
    },
});

// ─── Sub-Components ──────────────────────────────────────────────────

function MetadataChip({ label, value }: { label: string; value: string }) {
    return (
        <View style={s.chip}>
            <Text style={s.chipLabel}>{label}</Text>
            <Text style={s.chipValue}>{value}</Text>
        </View>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <View style={s.statCard}>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
        </View>
    );
}

function ModuleCard({ chapter, phaseColor }: { chapter: Chapter; phaseColor: string }) {
    const visibleTopics = chapter.topics.slice(0, MAX_TOPICS);
    const extraCount = Math.max(0, chapter.topics.length - MAX_TOPICS);
    const visibleResources = (chapter.resources || []).slice(0, MAX_RESOURCES);
    const duration = formatModuleDuration(chapter.durationWeeks);

    return (
        <View style={[s.moduleCard, { borderLeftColor: phaseColor }]} minPresenceAhead={120}>
            <Text style={s.moduleTitle}>{chapter.title}</Text>

            <View style={s.moduleMeta}>
                {duration !== "" && <Text style={s.badge}>{duration}</Text>}
                {chapter.isProject && <Text style={s.projectBadge}>Project</Text>}
                {chapter.isInternship && <Text style={s.projectBadge}>Internship</Text>}
            </View>

            {visibleTopics.length > 0 && (
                <View style={s.topicsList}>
                    {visibleTopics.map((topic, i) => (
                        <View key={i} style={s.topicItem}>
                            <Text style={s.topicBullet}>{"\u2022"}</Text>
                            <Text style={s.topicText}>{topic}</Text>
                        </View>
                    ))}
                    {extraCount > 0 && (
                        <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 2, paddingLeft: 12 }}>
                            + {extraCount} more topics
                        </Text>
                    )}
                </View>
            )}

            {visibleResources.length > 0 && (
                <View style={s.resourcesSection}>
                    {visibleResources.map((res, i) => (
                        <Link key={i} src={res.url} style={s.resourceLink}>
                            {"\u2197"} {res.label}
                        </Link>
                    ))}
                </View>
            )}
        </View>
    );
}

function WeekSection({ phase, isFirst }: { phase: Phase; isFirst: boolean }) {
    const phaseColor = getPhaseColor(phase.phaseIndex);

    return (
        <View minPresenceAhead={100}>
            <View style={isFirst ? [s.weekHeader, s.weekHeaderFirst] : s.weekHeader}>
                <Text style={s.weekBadge}>{phase.displayLabel}</Text>
                <Text style={s.weekName}>{phase.name}</Text>
                {phase.durationWeeks > 0 && (
                    <Text style={s.weekDuration}>{phase.formattedDuration}</Text>
                )}
            </View>
            {phase.chapters.map((ch) => (
                <ModuleCard key={ch.id} chapter={ch} phaseColor={phaseColor} />
            ))}
        </View>
    );
}

/** Shared footer for summary + content pages */
function PageFooter() {
    return (
        <>
            <View style={s.footerBar} fixed />
            <View style={s.footerRow} fixed>
                <Text style={s.contentFooter}>
                    {COPYRIGHT}
                </Text>
                <Text style={s.pageNumber}>{" "}</Text>
                <Link src={SITE_URL} style={s.contentFooterRight}>
                    {FOOTER_DISPLAY}
                </Link>
            </View>
        </>
    );
}

/** Footer variant with page numbers — only safe for pages with limited wrapping */
function PageFooterWithNumbers() {
    return (
        <>
            <View style={s.footerBar} fixed />
            <View style={s.footerRow} fixed>
                <Text style={s.contentFooter}>
                    {COPYRIGHT}
                </Text>
                <Text
                    style={s.pageNumber}
                    render={({ pageNumber, totalPages }) =>
                        `${pageNumber} / ${totalPages}`
                    }
                />
                <Link src={SITE_URL} style={s.contentFooterRight}>
                    {FOOTER_DISPLAY}
                </Link>
            </View>
        </>
    );
}

// ─── Cover Page ──────────────────────────────────────────────────────

function CoverPage({ user, plan, meta }: PdfInput) {
    const firstName = user.name.split(" ")[0];
    const journeyPhases = plan.phases.slice(0, MAX_JOURNEY_ITEMS);
    const hasMorePhases = plan.phases.length > MAX_JOURNEY_ITEMS;

    return (
        <Page size="A4" style={s.coverPage}>
            <View style={s.coverContent}>
                <View>
                    {/* Logo */}
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image src={LOGO_PATH} style={s.logo} />

                    {/* Title with brand accent */}
                    <View style={s.coverTitleBlock}>
                        <Text style={s.coverTitle}>Your Career</Text>
                        <Text style={[s.coverTitle, { color: COLORS.primary }]}>
                            Roadmap
                        </Text>
                        <View style={s.accentBar} />
                        <Text style={s.coverSubtitle}>
                            Personalized Learning Plan {"\u00B7"} {meta.targetRoleLabel}
                        </Text>
                    </View>

                    {/* Greeting — brand guide: "Dear [Name]" */}
                    <View style={s.greetingBlock}>
                        <Text style={s.greetingText}>
                            Dear <Text style={s.greetingName}>{firstName}</Text>,
                        </Text>
                        <Text style={s.greetingText}>
                            We{"\u2019"}ve analyzed your background and goals to create this
                            personalized learning path. It{"\u2019"}s designed to be practical,
                            project-based, and efficient.
                        </Text>
                    </View>

                    {/* Metadata chips */}
                    <View style={s.chipsRow}>
                        <MetadataChip label="Goal" value={meta.targetRoleLabel} />
                        <MetadataChip label="Est. Time" value={meta.durationLabel} />
                        <MetadataChip label="Pace" value={meta.weeklyHoursLabel} />
                    </View>
                </View>

                {/* Learning Journey overview */}
                {journeyPhases.length > 0 && (
                    <View style={s.journeySection}>
                        <Text style={s.journeySectionTitle}>
                            Your Learning Journey
                        </Text>
                        {journeyPhases.map((phase) => (
                            <View key={phase.id} style={s.journeyItem}>
                                <View
                                    style={[
                                        s.journeyDot,
                                        { backgroundColor: getPhaseColor(phase.phaseIndex) },
                                    ]}
                                />
                                <Text style={s.journeyName}>
                                    <Text style={s.journeyLabel}>
                                        Phase {phase.phaseIndex}
                                    </Text>
                                    {"  "}
                                    {phase.name}
                                </Text>
                            </View>
                        ))}
                        {hasMorePhases && (
                            <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 2, paddingLeft: 12 }}>
                                + {plan.phases.length - MAX_JOURNEY_ITEMS} more phases
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* Watermark */}
            <Text style={s.watermark}>codebasics</Text>

            {/* Footer */}
            <View style={s.coverFooter}>
                <Text style={s.footerText}>{COPYRIGHT}</Text>
                <Link src={SITE_URL} style={s.footerLink}>
                    {FOOTER_DISPLAY}
                </Link>
            </View>
        </Page>
    );
}

// ─── Summary Page ────────────────────────────────────────────────────

function SummaryPage({ plan, meta }: { plan: PlanResult; meta: PdfMeta }) {
    const stats: { value: string; label: string }[] = [
        { value: String(plan.totalModules), label: "Modules" },
        { value: String(plan.projectCount), label: "Projects" },
        { value: meta.durationLabel, label: "Timeline" },
    ];

    if (plan.internshipCount > 0) {
        stats.push({ value: String(plan.internshipCount), label: "Internships" });
    }

    stats.push(
        { value: `${plan.hoursPerWeek}h/week`, label: "Commitment" },
        { value: String(Math.round(plan.totalWeeks)), label: "Weeks" },
    );

    return (
        <Page size="A4" style={s.page}>
            <Text style={s.summaryTitle}>Plan Summary</Text>

            {/* Stats grid — 3 per row */}
            <View style={s.statsGrid}>
                {stats.map((stat, i) => (
                    <StatCard key={i} value={stat.value} label={stat.label} />
                ))}
            </View>

            {/* Why this plan */}
            {plan.whyThisPlan && plan.whyThisPlan.length > 0 && (
                <View style={s.whySection}>
                    <Text style={s.whyTitle}>Why This Plan for You</Text>
                    {plan.whyThisPlan.map((reason, i) => (
                        <View key={i} style={s.whyItem}>
                            <Text style={s.whyBullet}>{"\u2713"}</Text>
                            <Text style={s.whyText}>{reason}</Text>
                        </View>
                    ))}
                </View>
            )}

            <PageFooter />
        </Page>
    );
}

// ─── Content Pages ───────────────────────────────────────────────────

/** Group phases into chunks to balance page density vs @react-pdf stability.
 *  Each chunk becomes one wrapping <Page>. Keeping chunks small (~4 phases)
 *  prevents the exponential layout bug that crashes on 13+ page splits. */
const PHASES_PER_PAGE = 4;

function ContentPages({ plan }: { plan: PlanResult }) {
    const chunks: Phase[][] = [];
    for (let i = 0; i < plan.phases.length; i += PHASES_PER_PAGE) {
        chunks.push(plan.phases.slice(i, i + PHASES_PER_PAGE));
    }

    return (
        <>
            {chunks.map((chunk, ci) => (
                <Page key={ci} size="A4" style={s.page} wrap>
                    {chunk.map((phase, idx) => (
                        <WeekSection
                            key={phase.id}
                            phase={phase}
                            isFirst={ci === 0 && idx === 0}
                        />
                    ))}
                    <PageFooterWithNumbers />
                </Page>
            ))}
        </>
    );
}

// ─── Document ────────────────────────────────────────────────────────

export function CareerRoadmapPdf({ user, plan, meta }: PdfInput) {
    return (
        <Document
            title={`Career Roadmap \u2014 ${user.name}`}
            author="Codebasics"
            subject={`${meta.targetRoleLabel} Learning Roadmap`}
        >
            <CoverPage user={user} plan={plan} meta={meta} />
            <SummaryPage plan={plan} meta={meta} />
            <ContentPages plan={plan} />
        </Document>
    );
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Generate a premium branded PDF as a Blob.
 * This is the single entry point — call from UI, not from engine.
 */
export async function generateBrandedPdf(input: PdfInput): Promise<Blob> {
    // Lazily register fonts only when actually generating a PDF
    const { ensureFontsRegistered } = await import("../registerFonts");
    ensureFontsRegistered();

    const doc = <CareerRoadmapPdf {...input} />;
    const blob = await pdf(doc).toBlob();
    return blob;
}
