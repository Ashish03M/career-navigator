"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Target, TrendingUp, Award, Users, Youtube, Linkedin, Instagram, Facebook, Twitter, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePlan } from "@/lib/generatePlan";
import { INITIAL_EXPERIENCE, type ExperienceState, type PlanResult, type PlanInput } from "@/lib/types";
import type { SyllabusData } from "@/lib/syllabusTypes";
import {
    BACKGROUND_OPTIONS,
    GOALS,
    CAREER_OUTCOMES,
    AVAILABILITY_OPTIONS,
    LEARNING_PREFERENCES,
} from "@/lib/stepOptions";
import ProgressBar from "@/components/planner/ProgressBar";
import SelectionStep from "@/components/planner/SelectionStep";
import ExperienceStep from "@/components/planner/ExperienceStep";
import RoadmapResult from "@/components/planner/RoadmapResult";
import { Button } from "@/components/ui/button";

// Steps:
// 1. Current Background
// 2. Prior Knowledge (multi-select)
// 3. Target Goal
// 4. Career Outcome
// 5. Weekly Availability
// 6. Learning Style

const TOTAL_STEPS = 6;

// Learner type is fixed to 'free' — no longer a user-facing step
const LEARNER_TYPE = "free";

export default function BootcampPlanner() {
    const [step, setStep] = useState(1);
    const [showPlan, setShowPlan] = useState(false);

    const [background, setBackground] = useState("");
    const [experience, setExperience] = useState<ExperienceState>(INITIAL_EXPERIENCE);
    const [goal, setGoal] = useState("");
    const [careerOutcome, setCareerOutcome] = useState("");
    const [availability, setAvailability] = useState("");
    const [learningPreference, setLearningPreference] = useState("");

    const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
    const [syllabusLoading, setSyllabusLoading] = useState(false);
    const [syllabusError, setSyllabusError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSyllabus() {
            setSyllabus(null);
            setSyllabusLoading(true);
            setSyllabusError(null);
            try {
                const res = await fetch(`/api/syllabus?type=${LEARNER_TYPE}`);
                if (!res.ok) {
                    throw new Error(`Failed to load syllabus (${res.status})`);
                }
                const data: SyllabusData = await res.json();
                setSyllabus(data);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to load syllabus";
                setSyllabusError(msg);
                console.error("[Telemetry] Syllabus fetch failed:", msg);
            } finally {
                setSyllabusLoading(false);
            }
        }
        fetchSyllabus();
    }, []);

    const plan: PlanResult | null = useMemo(() => {
        if (!showPlan || !syllabus) return null;

        const input: PlanInput = {
            learnerType: LEARNER_TYPE,
            background,
            goal,
            careerOutcome,
            availability,
            learningPreference,
            realWorldApp: [],
            experience,
            syllabusChapters: syllabus.chapters,
            syllabusSubjects: syllabus.subjects,
        };

        const result = generatePlan(input);

        // === Lightweight Telemetry ===
        const expReduced = (result.diagnostics?.appliedSkips?.length ?? 0) > 0;
        console.log("[Telemetry] Plan generated:", {
            goal,
            totalWeeks: result.totalWeeks,
            totalModules: result.totalModules,
            estimatedMonths: result.estimatedMonths,
            experienceReducedModules: expReduced,
            skippedCount: result.diagnostics?.appliedSkips?.length ?? 0,
            background,
            availability,
        });

        return result;
    }, [showPlan, background, goal, careerOutcome, availability,
        learningPreference, experience, syllabus]);

    const goBack = step > 1 ? () => setStep(step - 1) : undefined;
    const goNext = (nextStep: number) => () => setStep(nextStep);

    const handleReset = () => {
        setShowPlan(false);
        setStep(1);
        setBackground("");
        setExperience(INITIAL_EXPERIENCE);
        setGoal("");
        setCareerOutcome("");
        setAvailability("");
        setLearningPreference("");
    };

    const stepConfig = [
        { id: 1, title: "What best describes you right now?", icon: <Users className="text-blue-500" />, options: BACKGROUND_OPTIONS, value: background, setter: setBackground, columns: 1 as const },
        { id: 2, isSpecial: true, specialType: "experience" },
        { id: 3, title: "Target Goal", icon: <Target className="text-green-500" />, options: GOALS, value: goal, setter: setGoal, columns: 2 as const },
        { id: 4, title: "Career Outcome", icon: <Award className="text-orange-500" />, options: CAREER_OUTCOMES, value: careerOutcome, setter: setCareerOutcome, columns: 1 as const },
        { id: 5, title: "Weekly Availability", icon: <Clock className="text-purple-500" />, options: AVAILABILITY_OPTIONS, value: availability, setter: setAvailability, columns: 1 as const },
        { id: 6, title: "Learning Style", icon: <TrendingUp className="text-yellow-500" />, options: LEARNING_PREFERENCES, value: learningPreference, setter: setLearningPreference, columns: 1 as const },
    ];

    const renderStep = () => {
        const cfg = stepConfig.find(c => c.id === step);
        if (!cfg) return null;

        // Step 2: Prior Knowledge (multi-select)
        if (cfg.specialType === "experience") {
            return (
                <ExperienceStep
                    key="step-2"
                    experience={experience}
                    onChange={setExperience}
                    onBack={goBack || (() => {})}
                    onGenerate={() => setStep(3)}
                    nextLabel="Continue →"
                />
            );
        }

        // Standard single-select steps
        if (!cfg.options || !cfg.setter) return null;
        const isLastStep = step === TOTAL_STEPS;
        const handleNext = isLastStep ? () => setShowPlan(true) : goNext(step + 1);

        return (
            <SelectionStep
                key={`step-${step}`}
                title={cfg.title ?? ""}
                icon={cfg.icon}
                options={cfg.options}
                selected={cfg.value ?? ""}
                onSelect={cfg.setter}
                columns={cfg.columns ?? 1}
                onBack={goBack}
                onNext={handleNext}
                nextLabel={isLastStep ? "Generate Roadmap →" : "Continue →"}
            />
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* LEFT PANEL */}
            <aside className="hidden lg:flex w-[40%] bg-slate-900 text-white relative flex-col justify-between p-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#6F53C1]/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

                <div className="flex-1 flex flex-col relative z-10">
                    <div>
                        <Image src="/logo.png" alt="Codebasics" width={160} height={40} className="h-10 w-auto mb-20 brightness-0 invert opacity-90" />
                        <div className="mb-12">
                            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6 font-[family-name:var(--font-outfit)]">
                                Your Personal <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                    Data & AI Career Roadmap
                                </span>
                            </h1>
                            <div className="space-y-3 max-w-md">
                                <h2 className="text-2xl font-bold text-white leading-tight">
                                    Stop guessing what to learn next.
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Answer 6 questions. Get a week-by-week plan to break into Data & AI — tailored to your background, goals, and schedule.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                "See exactly what to learn week-by-week",
                                "Skip what you already know — save months",
                                "Download a free PDF plan in under 2 minutes"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 relative z-10">
                    <p className="text-[10px] text-slate-500/80 font-medium mb-4 uppercase tracking-wider">
                        6 questions • Under 90 seconds • Free PDF download
                    </p>
                    <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <div className="flex -space-x-3">
                                {["/learner1.jpg", "/learner2.jpg", "/learner3.jpg", "/learner4.jpg"].map((src, i) => (
                                    <Image key={i} src={src} alt={`Learner ${i + 1}`} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                                ))}
                            </div>
                            <span className="font-medium text-slate-300">Join 25K+ learners who built career with us</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {[
                                { Icon: Facebook, color: "hover:bg-blue-600", href: "https://www.facebook.com/codebasics", label: "Follow us on Facebook" },
                                { Icon: Youtube, color: "hover:bg-red-600", href: "https://www.youtube.com/@codebasics", label: "Subscribe on YouTube" },
                                { Icon: Linkedin, color: "hover:bg-blue-700", href: "https://www.linkedin.com/company/codebasics", label: "Connect on LinkedIn" },
                                { Icon: Twitter, color: "hover:bg-sky-500", href: "https://twitter.com/codebasics", label: "Follow on Twitter" },
                                { Icon: Instagram, color: "hover:bg-gradient-to-tr", href: "https://www.instagram.com/codebasics/", label: "Follow on Instagram" }
                            ].map((social, i) => (
                                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                                    className={cn("w-8 h-8 rounded-md flex items-center justify-center text-white transition-all duration-300 bg-white/10 group", social.color)}>
                                    <social.Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                        {/* Authority markers */}
                        <p className="text-xs text-slate-400 mt-8">
                            25,000+ learners | 1.5M+ subscribers | Free & trusted since 2022
                        </p>
                    </div>
                </div>
            </aside>

            {/* RIGHT PANEL */}
            <main id="main-content" className="flex-1 flex flex-col relative overflow-y-auto">
                {/* MOBILE HEADER — expanded on step 1, compact on steps 2+ */}
                <div className="lg:hidden sticky top-0 z-50">
                    {step === 1 && !showPlan ? (
                        <div className="bg-slate-900 text-white px-6 py-6 space-y-4">
                            <Image src="/logo.png" alt="Codebasics" width={100} height={25} className="h-6 w-auto brightness-0 invert opacity-90" />
                            <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-outfit)]">
                                Your Personal{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                    Data & AI Career Roadmap
                                </span>
                            </h1>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Answer 6 questions. Get a week-by-week plan to break into Data & AI — tailored to your background, goals, and schedule.
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {["/learner1.jpg", "/learner2.jpg", "/learner3.jpg", "/learner4.jpg"].map((src, i) => (
                                        <Image key={i} src={src} alt="" width={28} height={28} className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover" />
                                    ))}
                                </div>
                                <span className="text-slate-300 text-xs">Join 25K+ learners who built career with us</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                25,000+ learners | 1.5M+ subscribers | Free & trusted since 2022
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                            <span className="font-bold text-base font-[family-name:var(--font-outfit)]">Data & AI Career Roadmap</span>
                            {!showPlan && (
                                <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">Step {step}/{TOTAL_STEPS}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 p-6 md:p-12 lg:p-20 flex flex-col justify-center max-w-4xl mx-auto w-full">
                    <>
                        {showPlan && plan ? (
                            <RoadmapResult
                                key="roadmap"
                                plan={plan}
                                goalLabel={GOALS.find(g => g.id === goal)?.name ?? ""}
                                goalId={goal}
                                learnerType={LEARNER_TYPE}
                                onReset={handleReset}
                            />
                        ) : showPlan && syllabusLoading ? (
                            <div key="loading" className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-lg font-semibold text-slate-600">Building your roadmap...</p>
                                <p className="text-sm text-slate-400">Loading curriculum data</p>
                            </div>
                        ) : showPlan && syllabusError ? (
                            <div key="error" className="flex flex-col items-center justify-center py-20 gap-4 max-w-md mx-auto text-center">
                                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                    <span className="text-2xl">!</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Unable to load curriculum</h3>
                                <p className="text-sm text-slate-500">{syllabusError}</p>
                                <div className="flex gap-3 mt-2">
                                    <Button onClick={() => { setSyllabusError(null); setShowPlan(false); }} variant="outline" className="rounded-xl">
                                        Go Back
                                    </Button>
                                    <Button onClick={() => { setSyllabusError(null); setShowPlan(true); }} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        ) : showPlan && !syllabus ? (
                            <div key="no-data" className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-lg font-semibold text-slate-600">Preparing your plan...</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                {!showPlan && (
                                    <div className="mb-8 lg:hidden">
                                        <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
                                    </div>
                                )}
                                {renderStep()}
                            </div>
                        )}
                    </>
                </div>
                <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-100">
                    <a href="/privacy" className="hover:text-slate-600 underline">Privacy Policy</a>
                    {" · "}
                    <a href="/terms" className="hover:text-slate-600 underline">Terms of Service</a>
                </footer>
            </main>
        </div>
    );
}
