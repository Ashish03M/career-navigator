import { Chapter } from "./bootcampData";
import { type Subject } from "./syllabusTypes";
import { type ReactNode } from "react";

export type StepOption = {
    id: string;
    name: string;
    desc: string;
    icon: ReactNode;
    duration?: string;
    urgent?: boolean;
    subtext?: string;
};

export type ExperienceState = {
    python: boolean;
    sql: boolean;
    statistics: boolean;
    ml: boolean;
    dl: boolean;
    nlp: boolean;
    genai: boolean;
    mlops: boolean;
    excel_bi: boolean;
    data_engineering: boolean;
    big_data: boolean;
};

export type Phase = {
    id: string;               // stable identity (subjectId)
    name: string;             // clean title (normalized, no "Week N:" prefix)
    phaseIndex: number;       // 1-based sequential position after skip filtering
    displayLabel: string;     // engine-generated label, e.g. "Week 1"
    chapters: Chapter[];
    color: string;
    isCareerPhase: boolean;   // engine-computed, not UI string-matched
    isOptional: boolean;      // engine-computed
    durationWeeks: number;
    formattedDuration: string;
};

export type PlanResult = {
    phases: Phase[];
    totalModules: number;
    totalWeeks: number;
    estimatedMonths: number;
    projectCount: number;
    internshipCount: number;
    hoursPerWeek: number;
    whyThisPlan: string[];
    warnings?: string[];
    diagnostics?: {
        effectiveFlags: Record<string, boolean>;
        appliedSkips: {
            moduleId: string;
            reason: string;
            reasonCode: string;
            flagUsed: string;
        }[];
        syllabusVersion?: string;
    };
};

export type PlanInput = {
    learnerType: string;
    background: string;
    goal: string;
    careerOutcome: string;
    availability: string;
    learningPreference: string;
    realWorldApp: string[];
    experience: ExperienceState;
    syllabusChapters: Chapter[];
    syllabusSubjects: Subject[];
    // Skill Flags (Optional - defaults derived from background)
    hasPythonBasics?: boolean;
    hasgitBasics?: boolean;
    hasDSABasics?: boolean;
    hasAIIntro?: boolean;
};

export interface SavedProfile {
    version: number;
    timestamp: number;
    userInfo: {
        name: string;
        email: string;
    };
    planInput: PlanInput;
    planResult?: PlanResult;
}

export const INITIAL_EXPERIENCE: ExperienceState = {
    python: false,
    sql: false,
    statistics: false,
    ml: false,
    dl: false,
    nlp: false,
    genai: false,
    mlops: false,
    excel_bi: false,
    data_engineering: false,
    big_data: false,
};
