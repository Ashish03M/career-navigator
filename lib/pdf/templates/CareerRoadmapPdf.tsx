/**
 * CareerRoadmapPdf — Premium Codebasics-branded PDF template.
 *
 * RENDERING ONLY — no business logic. All data comes from PlanResult.
 *
 * Structure:
 *   Page 1  — Cover (logo, hero name, profile card, stats)
 *   Page 2+ — Continuous flow (roadmap overview → why this plan → all phases)
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

export type PdfPersonalization = {
    backgroundLabel: string;
    careerOutcomeLabel: string;
    availabilityLabel: string;
    learningPreferenceLabel: string;
    knownSkills: string[];
};

export type PdfInput = {
    user: PdfUserInfo;
    plan: PlanResult;
    meta: PdfMeta;
    personalization?: PdfPersonalization;
};

// ─── Constants ───────────────────────────────────────────────────────

const MAX_TOPICS = 15;
const MAX_RESOURCES = 3;
const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const LOGO_PATH = isNode ? `${process.cwd()}/public/logo.png` : "/logo.png";
const SITE_URL = "https://codebasics.io";
const FOOTER_DISPLAY = "codebasics.io";
const COPYRIGHT = "\u00A9 Codebasics";

// ─── Helpers ─────────────────────────────────────────────────────────

function getPhaseColor(phaseIndex: number): string {
    return PHASE_PALETTE[(phaseIndex - 1) % PHASE_PALETTE.length];
}

function titleCase(str: string): string {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
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
        paddingHorizontal: 28,
        paddingVertical: 24,
        paddingBottom: 36,
        color: COLORS.text,
        fontSize: SIZES.body,
        lineHeight: 1.4,
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
    journeyMeta: {
        fontSize: 8,
        color: COLORS.muted,
        textAlign: "right",
    },
    // Skills section
    skillsSection: {
        marginTop: SPACING.md,
    },
    skillsSectionTitle: {
        fontSize: 9,
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: SPACING.xs,
        fontWeight: 600,
    },
    skillsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    skillPill: {
        backgroundColor: COLORS.greenTint,
        borderRadius: 100,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    skillPillText: {
        fontSize: 8,
        color: COLORS.successDark,
        fontWeight: 600,
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
        bottom: 24,
        left: 28,
        right: 28,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
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
        marginBottom: SPACING.lg,
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
        marginTop: 12,
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
        padding: 8,
        marginBottom: 5,
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
        marginBottom: 2,
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
        gap: 8,
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
        bottom: 12,
        left: 28,
        right: 28,
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

// ─── Cover Page Styles (handbook layout) ────────────────────────────

const cv = StyleSheet.create({
    page: {
        fontFamily: FONTS.body,
        backgroundColor: COLORS.background,
        paddingHorizontal: 28,
        paddingTop: 24,
        paddingBottom: 36,
        color: COLORS.text,
        flexDirection: "column",
    },
    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.xl,
    },
    logo: {
        width: 110,
    },
    brandTag: {
        fontSize: 10,
        color: COLORS.muted,
        marginLeft: "auto",
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    // Hero box
    heroBox: {
        backgroundColor: COLORS.dark,
        borderRadius: 10,
        paddingVertical: 18,
        paddingHorizontal: 18,
        marginBottom: 10,
    },
    heroLabel: {
        fontSize: 10,
        color: COLORS.highlight,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontWeight: 700,
        marginBottom: SPACING.xs,
    },
    heroName: {
        fontSize: 36,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.background,
        lineHeight: 1.1,
    },
    heroAccent: {
        width: 40,
        height: 3,
        backgroundColor: COLORS.highlight,
        marginTop: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    heroRole: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    heroSubtext: {
        fontSize: 10,
        color: COLORS.textOnDark,
        letterSpacing: 0.3,
    },
    // Profile card
    profileCard: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        backgroundColor: COLORS.backgroundAlt,
    },
    profileCardTitle: {
        fontSize: 11,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.dark,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },
    profileGrid: {
        flexDirection: "row",
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    profileItem: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderRadius: 6,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    profileItemLabel: {
        fontSize: 7,
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        fontWeight: 700,
        marginBottom: 2,
    },
    profileItemValue: {
        fontSize: 11,
        fontWeight: 600,
        color: COLORS.dark,
    },
    skillsBlock: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    skillsLabel: {
        fontSize: 8,
        color: COLORS.muted,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: SPACING.xs,
    },
    // Quick stats row
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.blueTint,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: SPACING.lg,
        marginBottom: 8,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statNum: {
        fontSize: 22,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.primary,
        lineHeight: 1.1,
    },
    statLbl: {
        fontSize: 8,
        color: COLORS.muted,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        fontWeight: 600,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    // Visual roadmap — snake/zigzag flow
    roadmapBox: {
        borderRadius: 10,
        padding: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.dark,
    },
    roadmapTitle: {
        fontSize: 9,
        color: COLORS.highlight,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontWeight: 700,
        marginBottom: SPACING.sm,
    },
    // Each row of 5 phase cards
    snakeRow: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 2,
    },
    snakeRowReverse: {
        flexDirection: "row-reverse",
        gap: 4,
        marginBottom: 2,
    },
    // Individual phase card in the snake
    snakeCard: {
        flex: 1,
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 5,
    },
    snakeCardName: {
        fontSize: 7,
        fontFamily: FONTS.heading,
        fontWeight: 700,
        color: COLORS.background,
        lineHeight: 1.15,
    },
    // Connector between rows — vertical bar on the correct side
    snakeConnector: {
        height: 4,
        justifyContent: "center",
        marginBottom: 2,
    },
    snakeConnectorBar: {
        width: 2,
        height: 4,
        borderRadius: 1,
    },
    // Inline start/finish labels
    snakeInlineLabel: {
        fontSize: 6,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    snakeFinishLabel: {
        fontSize: 6,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginTop: 3,
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

function ModuleCard({ chapter, phaseColor }: { chapter: Chapter; phaseColor: string }) {
    const visibleTopics = chapter.topics.slice(0, MAX_TOPICS);
    const extraCount = Math.max(0, chapter.topics.length - MAX_TOPICS);
    const visibleResources = (chapter.resources || []).slice(0, MAX_RESOURCES);
    const duration = formatModuleDuration(chapter.durationWeeks);

    const bgColor = chapter.isProject ? COLORS.amberTint
        : chapter.isInternship ? COLORS.internshipTint
        : COLORS.backgroundAlt;

    const borderColor = chapter.isProject ? COLORS.amberBorder
        : chapter.isInternship ? COLORS.internshipBorder
        : phaseColor;

    return (
        <View style={[s.moduleCard, { borderLeftColor: borderColor, backgroundColor: bgColor }]}>
            <Text style={s.moduleTitle}>{chapter.title}</Text>

            <View style={s.moduleMeta}>
                {duration !== "" && <Text style={s.badge}>{duration}</Text>}
                {chapter.isProject && <Text style={s.projectBadge}>{"\u2605"} Project</Text>}
                {chapter.isInternship && <Text style={s.projectBadge}>{"\u25C6"} Internship</Text>}
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

function PhaseConnector({ color }: { color: string }) {
    return (
        <View style={{ alignItems: "center", marginVertical: 4 }}>
            <View style={{ width: 1, height: 12, backgroundColor: COLORS.border }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginTop: 2 }} />
        </View>
    );
}

function WeekSection({ phase, isFirst }: { phase: Phase; isFirst: boolean }) {
    const phaseColor = getPhaseColor(phase.phaseIndex);

    return (
        <View>
            {!isFirst && <PhaseConnector color={phaseColor} />}
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

function SkillPill({ label }: { label: string }) {
    return (
        <View style={s.skillPill}>
            <Text style={s.skillPillText}>{label}</Text>
        </View>
    );
}

function CoverProfileItem({ label, value }: { label: string; value: string }) {
    return (
        <View style={cv.profileItem}>
            <Text style={cv.profileItemLabel}>{label}</Text>
            <Text style={cv.profileItemValue}>{value}</Text>
        </View>
    );
}

function CoverPage({ user, plan, meta, personalization }: PdfInput) {
    const p = personalization;
    const visibleSkills = p?.knownSkills.slice(0, 8) ?? [];
    const extraSkillCount = Math.max(0, (p?.knownSkills.length ?? 0) - 8);

    return (
        <Page size="A4" style={cv.page}>
            {/* ── Top bar: logo + branding ── */}
            <View style={cv.topBar}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={LOGO_PATH} style={cv.logo} />
                <Text style={cv.brandTag}>Career Roadmap</Text>
            </View>

            {/* ── Hero: Name + Role ── */}
            <View style={cv.heroBox}>
                <Text style={cv.heroLabel}>Prepared for</Text>
                <Text style={cv.heroName}>{titleCase(user.name)}</Text>
                <View style={cv.heroAccent} />
                <Text style={cv.heroRole}>{meta.targetRoleLabel}</Text>
                <Text style={cv.heroSubtext}>
                    Personalized Learning Path {"\u00B7"} {meta.durationLabel} {"\u00B7"} {meta.weeklyHoursLabel}
                </Text>
            </View>

            {/* ── Profile Card ── */}
            {p && (
                <View style={cv.profileCard}>
                    <Text style={cv.profileCardTitle}>Your Profile</Text>
                    <View style={cv.profileGrid}>
                        <CoverProfileItem label="Background" value={p.backgroundLabel} />
                        <CoverProfileItem label="Career Outcome" value={p.careerOutcomeLabel} />
                    </View>
                    <View style={cv.profileGrid}>
                        <CoverProfileItem label="Learning Style" value={p.learningPreferenceLabel} />
                        <CoverProfileItem label="Weekly Commitment" value={p.availabilityLabel} />
                    </View>
                    {visibleSkills.length > 0 && (
                        <View style={cv.skillsBlock}>
                            <Text style={cv.skillsLabel}>Skills You Already Have</Text>
                            <View style={s.skillsRow}>
                                {visibleSkills.map((skill) => (
                                    <SkillPill key={skill} label={skill} />
                                ))}
                                {extraSkillCount > 0 && (
                                    <Text style={{ fontSize: 8, color: COLORS.muted, alignSelf: "center" }}>
                                        +{extraSkillCount} more
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* ── Quick Stats Row ── */}
            <View style={cv.statsRow}>
                <View style={cv.statItem}>
                    <Text style={cv.statNum}>{plan.totalModules}</Text>
                    <Text style={cv.statLbl}>Modules</Text>
                </View>
                <View style={cv.statDivider} />
                <View style={cv.statItem}>
                    <Text style={cv.statNum}>{plan.projectCount}</Text>
                    <Text style={cv.statLbl}>Projects</Text>
                </View>
                <View style={cv.statDivider} />
                <View style={cv.statItem}>
                    <Text style={cv.statNum}>{plan.estimatedMonths}</Text>
                    <Text style={cv.statLbl}>Months</Text>
                </View>
                {plan.internshipCount > 0 && (
                    <>
                        <View style={cv.statDivider} />
                        <View style={cv.statItem}>
                            <Text style={cv.statNum}>{plan.internshipCount}</Text>
                            <Text style={cv.statLbl}>Internships</Text>
                        </View>
                    </>
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

// ─── Flow Page (roadmap + why + all phases — continuous flow) ────────

function FlowPage({ plan }: { plan: PlanResult }) {
    const journeyPhases = plan.phases;
    const COLS = 5;
    const rows: typeof journeyPhases[] = [];
    for (let i = 0; i < journeyPhases.length; i += COLS) {
        rows.push(journeyPhases.slice(i, i + COLS));
    }

    return (
        <Page size="A4" style={s.page} wrap>
            {/* ── Visual Roadmap — Snake Flow ── */}
            {journeyPhases.length > 0 && (
                <View style={cv.roadmapBox}>
                    <Text style={cv.roadmapTitle}>Your Learning Journey</Text>
                    <Text style={[cv.snakeInlineLabel, { color: COLORS.success }]}>
                        {"\u25B6"} Start here
                    </Text>
                    {rows.map((row, rowIdx) => {
                        const isReversed = rowIdx % 2 === 1;
                        const lastInRow = row[row.length - 1];
                        const connectorColor = getPhaseColor(lastInRow.phaseIndex);
                        return (
                            <React.Fragment key={rowIdx}>
                                <View style={isReversed ? cv.snakeRowReverse : cv.snakeRow}>
                                    {row.map((phase) => {
                                        const color = getPhaseColor(phase.phaseIndex);
                                        return (
                                            <View key={phase.id} style={[cv.snakeCard, { backgroundColor: color }]}>
                                                <Text style={cv.snakeCardName}>
                                                    {phase.phaseIndex}. {phase.name}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                    {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, i) => (
                                        <View key={`pad-${i}`} style={{ flex: 1 }} />
                                    ))}
                                </View>
                                {rowIdx < rows.length - 1 && (
                                    <View style={[
                                        cv.snakeConnector,
                                        { alignItems: isReversed ? "flex-start" : "flex-end", paddingHorizontal: 14 }
                                    ]}>
                                        <View style={[cv.snakeConnectorBar, { backgroundColor: connectorColor }]} />
                                    </View>
                                )}
                            </React.Fragment>
                        );
                    })}
                    <Text style={[cv.snakeFinishLabel, {
                        color: COLORS.highlight,
                        alignSelf: rows.length % 2 === 1 ? "flex-end" : "flex-start",
                    }]}>
                        {"\u2605"} Goal reached
                    </Text>
                </View>
            )}

            {/* ── Why This Plan ── */}
            {plan.whyThisPlan && plan.whyThisPlan.length > 0 && (
                <View style={{ marginTop: SPACING.lg }}>
                    <Text style={s.summaryTitle}>Why This Plan for You</Text>
                    {plan.whyThisPlan.map((reason, i) => (
                        <View key={i} style={s.whyItem}>
                            <Text style={s.whyBullet}>{"\u2713"}</Text>
                            <Text style={s.whyText}>{reason}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* ── All Phases — continuous flow ── */}
            {plan.phases.map((phase, idx) => (
                <WeekSection
                    key={phase.id}
                    phase={phase}
                    isFirst={idx === 0}
                />
            ))}

            <PageFooterWithNumbers />
        </Page>
    );
}

// ─── Document ────────────────────────────────────────────────────────

export function CareerRoadmapPdf({ user, plan, meta, personalization }: PdfInput) {
    return (
        <Document
            title={`Career Roadmap \u2014 ${user.name}`}
            author="Codebasics"
            subject={`${meta.targetRoleLabel} Learning Roadmap`}
        >
            <CoverPage user={user} plan={plan} meta={meta} personalization={personalization} />
            <FlowPage plan={plan} />
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
