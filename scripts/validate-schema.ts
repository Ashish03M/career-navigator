/**
 * Schema Validation for Syllabus JSON files
 * Validates: required fields, ids, tags, chapter/subject shape, referential integrity
 *
 * Run: npx tsx scripts/validate-schema.ts
 */
import freeSyllabus from "../data/free_syllabus.json";
import bootcampSyllabus from "../data/syllabus_v3.json";

let passed = 0;
let failed = 0;
const failMessages: string[] = [];

function assert(condition: boolean, label: string, detail?: string) {
    if (condition) {
        passed++;
    } else {
        failed++;
        const msg = detail ? `${label} — ${detail}` : label;
        failMessages.push(msg);
        console.error(`  FAIL: ${label}${detail ? ` (${detail})` : ""}`);
    }
}

function section(name: string) {
    console.log(`\n--- ${name} ---`);
}

type RawSubject = {
    id?: unknown;
    name?: unknown;
    displayName?: unknown;
    color?: unknown;
    category?: unknown;
    chapterIds?: unknown;
    tags?: unknown;
};

type RawChapter = {
    id?: unknown;
    title?: unknown;
    subjectId?: unknown;
    topics?: unknown;
    durationWeeks?: unknown;
    isProject?: unknown;
    isInternship?: unknown;
    resources?: unknown;
};

function validateSubject(sub: RawSubject, idx: number, fileLabel: string): boolean {
    const prefix = `${fileLabel}.subjects[${idx}]`;
    let ok = true;

    if (typeof sub.id !== "string" || sub.id.length === 0) {
        assert(false, `${prefix}.id`, `must be non-empty string, got ${JSON.stringify(sub.id)}`);
        ok = false;
    } else {
        assert(true, `${prefix}.id is valid`);
    }

    if (typeof sub.name !== "string" || sub.name.length === 0) {
        assert(false, `${prefix}.name`, `must be non-empty string`);
        ok = false;
    } else {
        assert(true, `${prefix}.name is valid`);
    }

    if (typeof sub.displayName !== "string" || sub.displayName.length === 0) {
        assert(false, `${prefix}.displayName`, `must be non-empty string`);
        ok = false;
    } else {
        assert(true, `${prefix}.displayName is valid`);
    }

    if (typeof sub.color !== "string") {
        assert(false, `${prefix}.color`, `must be string`);
        ok = false;
    } else {
        assert(true, `${prefix}.color is valid`);
    }

    const validCategories = ["foundation", "core-ai", "specialization", "career"];
    if (typeof sub.category !== "string" || !validCategories.includes(sub.category)) {
        assert(false, `${prefix}.category`, `must be one of ${validCategories.join("|")}, got ${JSON.stringify(sub.category)}`);
        ok = false;
    } else {
        assert(true, `${prefix}.category is valid`);
    }

    if (!Array.isArray(sub.chapterIds) || sub.chapterIds.length === 0) {
        assert(false, `${prefix}.chapterIds`, `must be non-empty array`);
        ok = false;
    } else {
        const allStrings = (sub.chapterIds as unknown[]).every(id => typeof id === "string" && id.length > 0);
        assert(allStrings, `${prefix}.chapterIds all non-empty strings`);
        if (!allStrings) ok = false;
    }

    // Tags validation (optional on bootcamp, required on free)
    if (sub.tags !== undefined) {
        const tags = sub.tags as any;
        if (typeof tags !== "object" || tags === null) {
            assert(false, `${prefix}.tags`, `must be object if present`);
            ok = false;
        } else {
            if (typeof tags.category !== "string" || tags.category.length === 0) {
                assert(false, `${prefix}.tags.category`, `must be non-empty string`);
                ok = false;
            } else {
                assert(true, `${prefix}.tags.category is valid`);
            }
            const validLevels = ["intro", "intermediate", "advanced"];
            if (typeof tags.level !== "string" || !validLevels.includes(tags.level)) {
                assert(false, `${prefix}.tags.level`, `must be one of ${validLevels.join("|")}, got ${JSON.stringify(tags.level)}`);
                ok = false;
            } else {
                assert(true, `${prefix}.tags.level is valid`);
            }
        }
    }

    return ok;
}

function validateChapter(ch: RawChapter, idx: number, fileLabel: string): boolean {
    const prefix = `${fileLabel}.chapters[${idx}]`;
    let ok = true;

    if (typeof ch.id !== "string" || ch.id.length === 0) {
        assert(false, `${prefix}.id`, `must be non-empty string`);
        ok = false;
    } else {
        assert(true, `${prefix}.id is valid`);
    }

    if (typeof ch.title !== "string" || ch.title.length === 0) {
        assert(false, `${prefix}.title`, `must be non-empty string`);
        ok = false;
    } else {
        assert(true, `${prefix}.title is valid`);
    }

    if (typeof ch.subjectId !== "string" || ch.subjectId.length === 0) {
        assert(false, `${prefix}.subjectId`, `must be non-empty string`);
        ok = false;
    } else {
        assert(true, `${prefix}.subjectId is valid`);
    }

    if (!Array.isArray(ch.topics)) {
        assert(false, `${prefix}.topics`, `must be array`);
        ok = false;
    } else {
        assert(ch.topics.length > 0, `${prefix}.topics non-empty`);
    }

    if (typeof ch.durationWeeks !== "number" || ch.durationWeeks <= 0 || !isFinite(ch.durationWeeks)) {
        assert(false, `${prefix}.durationWeeks`, `must be positive finite number, got ${ch.durationWeeks}`);
        ok = false;
    } else {
        assert(true, `${prefix}.durationWeeks is valid`);
    }

    // Optional booleans
    if (ch.isProject !== undefined && typeof ch.isProject !== "boolean") {
        assert(false, `${prefix}.isProject`, `must be boolean if present`);
        ok = false;
    }
    if (ch.isInternship !== undefined && typeof ch.isInternship !== "boolean") {
        assert(false, `${prefix}.isInternship`, `must be boolean if present`);
        ok = false;
    }

    // Resources (optional array)
    if (ch.resources !== undefined) {
        if (!Array.isArray(ch.resources)) {
            assert(false, `${prefix}.resources`, `must be array if present`);
            ok = false;
        } else {
            (ch.resources as any[]).forEach((res, ri) => {
                if (typeof res.label !== "string" || typeof res.url !== "string") {
                    assert(false, `${prefix}.resources[${ri}]`, `must have string label and url`);
                    ok = false;
                }
            });
        }
    }

    return ok;
}

function validateSyllabus(data: any, fileLabel: string, requireTags: boolean) {
    section(`${fileLabel}: Structure`);

    assert(Array.isArray(data.subjects), `${fileLabel} has subjects array`);
    assert(Array.isArray(data.chapters), `${fileLabel} has chapters array`);
    assert(data.subjects.length > 0, `${fileLabel} has at least 1 subject`);
    assert(data.chapters.length > 0, `${fileLabel} has at least 1 chapter`);

    section(`${fileLabel}: Subject Validation`);
    const subjectIds = new Set<string>();
    (data.subjects as RawSubject[]).forEach((sub, idx) => {
        validateSubject(sub, idx, fileLabel);
        if (typeof sub.id === "string") {
            assert(!subjectIds.has(sub.id), `${fileLabel}.subjects[${idx}].id unique`, `duplicate: ${sub.id}`);
            subjectIds.add(sub.id);
        }

        if (requireTags && sub.tags === undefined) {
            assert(false, `${fileLabel}.subjects[${idx}].tags required`, `subject "${sub.id}" missing tags (needed for skip logic)`);
        }
    });

    section(`${fileLabel}: Chapter Validation`);
    const chapterIds = new Set<string>();
    (data.chapters as RawChapter[]).forEach((ch, idx) => {
        validateChapter(ch, idx, fileLabel);
        if (typeof ch.id === "string") {
            assert(!chapterIds.has(ch.id), `${fileLabel}.chapters[${idx}].id unique`, `duplicate: ${ch.id}`);
            chapterIds.add(ch.id);
        }
    });

    section(`${fileLabel}: Referential Integrity`);

    // All chapter.subjectId must reference a valid subject
    (data.chapters as RawChapter[]).forEach((ch, idx) => {
        if (typeof ch.subjectId === "string") {
            assert(subjectIds.has(ch.subjectId),
                `${fileLabel}.chapters[${idx}].subjectId "${ch.subjectId}" references valid subject`);
        }
    });

    // All subject.chapterIds must reference valid chapters
    (data.subjects as RawSubject[]).forEach((sub, idx) => {
        if (Array.isArray(sub.chapterIds)) {
            (sub.chapterIds as string[]).forEach(cid => {
                assert(chapterIds.has(cid),
                    `${fileLabel}.subjects[${idx}].chapterIds: "${cid}" references valid chapter`);
            });
        }
    });

    // Every chapter must be referenced by exactly one subject
    const referencedChapterIds = new Set<string>();
    (data.subjects as RawSubject[]).forEach(sub => {
        if (Array.isArray(sub.chapterIds)) {
            (sub.chapterIds as string[]).forEach(cid => {
                assert(!referencedChapterIds.has(cid),
                    `chapter "${cid}" referenced by only one subject`,
                    referencedChapterIds.has(cid) ? `duplicate reference` : undefined);
                referencedChapterIds.add(cid);
            });
        }
    });

    // Check for orphan chapters (in chapters array but not in any subject.chapterIds)
    chapterIds.forEach(cid => {
        assert(referencedChapterIds.has(cid),
            `chapter "${cid}" is referenced by at least one subject`);
    });
}

// =============================
// RUN
// =============================
console.log("=== SYLLABUS SCHEMA VALIDATION ===\n");

validateSyllabus(freeSyllabus, "free_syllabus", true);
validateSyllabus(bootcampSyllabus, "syllabus_v3", false);

// P0 WARNING: Check if bootcamp syllabus is missing tags (skip logic won't work)
section("P0 CHECK: Bootcamp tags presence");
const bootcampSubsWithTags = (bootcampSyllabus.subjects as any[]).filter(s => s.tags !== undefined);
const bootcampSubsWithoutTags = (bootcampSyllabus.subjects as any[]).filter(s => s.tags === undefined);
if (bootcampSubsWithoutTags.length > 0) {
    console.warn(`\n  WARNING [P0]: ${bootcampSubsWithoutTags.length}/${bootcampSyllabus.subjects.length} bootcamp subjects MISSING tags.`);
    console.warn(`  Skip logic (experience-based filtering) will NOT work for these subjects.`);
    console.warn(`  Affected: ${bootcampSubsWithoutTags.map((s: any) => s.id).join(", ")}`);
    // This is a known P0 issue — we warn but don't fail the schema check
    // because the schema says tags are optional for bootcamp.
    // To make it strict, uncomment:
    // assert(false, `bootcamp tags P0`, `${bootcampSubsWithoutTags.length} subjects missing tags`);
}

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failMessages.length > 0) {
    console.log("\nFAILURES:");
    failMessages.forEach(m => console.log(`  - ${m}`));
}
process.exit(failed > 0 ? 1 : 0);
