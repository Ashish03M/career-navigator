"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { type PlanResult, type ExperienceState } from "@/lib/types";
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Rocket, Sparkles, Star, Briefcase, Repeat, ExternalLink, Download, Zap, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PdfMeta, type PdfPersonalization } from "@/lib/pdf/generateBrandedPdf";
import { BACKGROUND_OPTIONS, CAREER_OUTCOMES, AVAILABILITY_OPTIONS, LEARNING_PREFERENCES, EXPERIENCE_OPTIONS } from "@/lib/stepOptions";

import { PdfErrorBoundary } from "./PdfErrorBoundary";

const PdfDownloadModal = dynamic(() => import("./PdfDownloadModal"), { ssr: false });

type RoadmapResultProps = {
    plan: PlanResult;
    goalLabel: string;
    goalId: string;
    learnerType: string;
    onReset: () => void;
    userName?: string;
    userEmail?: string;
    sessionId: string;
    background?: string;
    careerOutcome?: string;
    availability?: string;
    learningPreference?: string;
    experience?: ExperienceState;
};

function getBootcampUrl(goalId: string): string {
    switch (goalId) {
        case 'data-analyst':
            return 'https://codebasics.io/bootcamps/data-analytics-bootcamp-with-practical-job-assistance';
        case 'data-engineer':
            return 'https://codebasics.io/bootcamps/data-engineering-bootcamp-with-virtual-internship';
        default:
            return 'https://codebasics.io/bootcamps/gen-ai-data-science-bootcamp-with-virtual-internship';
    }
}

// ... (getAccentClasses helper remains same) ...
const getAccentClasses = (colorClass: string) => {
    const color = colorClass.toLowerCase();
    if (color.includes('blue')) return { border: 'border-l-blue-600', icon: 'bg-blue-100 text-blue-700', bullet: 'bg-blue-400' };
    if (color.includes('cyan')) return { border: 'border-l-cyan-500', icon: 'bg-cyan-100 text-cyan-700', bullet: 'bg-cyan-400' };
    if (color.includes('indigo')) return { border: 'border-l-indigo-600', icon: 'bg-indigo-100 text-indigo-700', bullet: 'bg-indigo-400' };
    if (color.includes('green')) return { border: 'border-l-emerald-600', icon: 'bg-emerald-100 text-emerald-700', bullet: 'bg-emerald-400' };
    if (color.includes('emerald')) return { border: 'border-l-emerald-600', icon: 'bg-emerald-100 text-emerald-700', bullet: 'bg-emerald-400' };
    if (color.includes('purple')) return { border: 'border-l-purple-600', icon: 'bg-purple-100 text-purple-700', bullet: 'bg-purple-400' };
    if (color.includes('pink')) return { border: 'border-l-pink-600', icon: 'bg-pink-100 text-pink-700', bullet: 'bg-pink-400' };
    if (color.includes('rose')) return { border: 'border-l-rose-600', icon: 'bg-rose-100 text-rose-700', bullet: 'bg-rose-400' };
    if (color.includes('amber')) return { border: 'border-l-amber-500', icon: 'bg-amber-100 text-amber-700', bullet: 'bg-amber-400' };
    return { border: 'border-l-slate-400', icon: 'bg-slate-100 text-slate-700', bullet: 'bg-slate-400' };
};

export default function RoadmapResult({ plan, goalLabel, goalId, learnerType, onReset, userName, userEmail, sessionId, background, careerOutcome, availability, learningPreference, experience }: RoadmapResultProps) {
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);

    const pdfMeta: PdfMeta = {
        targetRoleLabel: goalLabel,
        durationLabel: `${plan.estimatedMonths} months`,
        weeklyHoursLabel: `${plan.hoursPerWeek}h/week`,
        sourceLabel: learnerType === "free" ? "100% Free Resources" : "Codebasics Bootcamp",
    };

    const pdfPersonalization: PdfPersonalization | undefined = background ? {
        backgroundLabel: BACKGROUND_OPTIONS.find(o => o.id === background)?.name ?? background,
        careerOutcomeLabel: CAREER_OUTCOMES.find(o => o.id === careerOutcome)?.name ?? careerOutcome ?? "",
        availabilityLabel: AVAILABILITY_OPTIONS.find(o => o.id === availability)?.name ?? availability ?? "",
        learningPreferenceLabel: LEARNING_PREFERENCES.find(o => o.id === learningPreference)?.name ?? learningPreference ?? "",
        knownSkills: EXPERIENCE_OPTIONS.filter(o => experience?.[o.key as keyof ExperienceState]).map(o => o.label),
    } : undefined;

    const toggleModule = (id: string) => {
        setExpandedModule(expandedModule === id ? null : id);
    };

    // Refactor: Use derived values from plan (Single Source of Truth)
    const { projectCount, internshipCount, warnings } = plan;

    return (
        <div className="space-y-8">
            <div>
                {/* HEADER */}
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    {/* Top section — dark hero */}
                    <div className="bg-[#181830] text-white px-8 pt-10 pb-8 md:px-10 md:pt-12 md:pb-10 relative">
                        {/* Subtle gradient mesh */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_60%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)]" />

                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    {userName ? (
                                        <p className="text-sm md:text-base font-medium text-slate-400 mb-2">
                                            <span className="text-lg md:text-xl font-bold text-[#20C997] capitalize">{userName.trim().split(" ")[0]}&apos;s</span> Roadmap to
                                        </p>
                                    ) : (
                                        <p className="text-sm md:text-base font-medium text-slate-400 mb-2">Your Roadmap to</p>
                                    )}
                                    <h2 data-testid="roadmap-heading" className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-outfit)] tracking-tight leading-none">{goalLabel}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 bg-white/[0.07] text-slate-300 pl-2.5 pr-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.06]">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        {plan.estimatedMonths} months
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 bg-white/[0.07] text-slate-300 pl-2.5 pr-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.06]">
                                        <Layers className="w-3 h-3 text-slate-500" />
                                        {plan.hoursPerWeek}h / week
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats grid — light glass cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50/80">
                        <StatCard label="Modules" value={plan.totalModules} icon={<BookOpen className="w-4 h-4" />} accent="blue" />
                        <StatCard label="Projects" value={projectCount} icon={<Star className="w-4 h-4" />} accent="amber" />
                        <StatCard label="Internships" value={internshipCount} icon={<Briefcase className="w-4 h-4" />} accent="emerald" />
                        <StatCard label="Timeline" value={`${plan.estimatedMonths} Mo`} icon={<Rocket className="w-4 h-4" />} accent="violet" />
                    </div>
                </div>

                {/* PERSONALIZATION DELTA */}
                {plan.diagnostics?.appliedSkips && plan.diagnostics.appliedSkips.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mt-8">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                <Zap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900 mb-1">
                                    Your plan is personalized
                                </h3>
                                <p className="text-sm text-emerald-700">
                                    Based on your existing skills, we removed{" "}
                                    <span className="font-bold">{plan.diagnostics.appliedSkips.length} module{plan.diagnostics.appliedSkips.length !== 1 ? "s" : ""}</span>{" "}
                                    you already know, saving you weeks of redundant learning.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* WARNINGS */}
                {warnings && warnings.length > 0 && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Sparkles className="h-5 w-5 text-amber-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    {warnings[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* WHY THIS PLAN */}
                {plan.whyThisPlan && plan.whyThisPlan.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 border-l-4 border-l-indigo-500 mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Why this plan for you
                        </h3>
                        <ul className="space-y-3">
                            {plan.whyThisPlan.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="text-gray-600 text-sm leading-relaxed">{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* WHY THIS ORDER */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mt-8">
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Why this order?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Your roadmap follows a proven learning sequence: foundations first, then core skills,
                        followed by specialization and projects. Each module builds on what you learned before.
                    </p>
                </div>

                {/* CURRICULUM */}
                <div className="space-y-6 mt-4">
                    {plan.phases.map((phase, phaseIdx) => {
                        const milestones: Record<string, string> = {
                            'free-math': 'Foundation Complete: You now have the math and coding basics for AI',
                            'free-ml-projects': 'ML Milestone: You can now build and deploy ML models',
                            'free-genai-projects': 'GenAI Milestone: You can build production AI applications',
                            'free-powerbi': 'Analytics Ready: You can build dashboards and analyze business data',
                            'free-data-modeling': 'DE Foundations Complete: You understand data modeling and warehousing',
                            'free-de-projects': 'DE Milestone: You can build end-to-end data pipelines',
                        };
                        const milestone = milestones[phase.id];

                        return (<div key={phase.id}>
                        {phaseIdx > 0 && milestones[plan.phases[phaseIdx - 1]?.id] && (
                            <div className="flex items-center gap-3 py-3 px-4 mb-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 to-transparent" />
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> {milestones[plan.phases[phaseIdx - 1].id]}
                                </span>
                                <div className="flex-1 h-px bg-gradient-to-l from-emerald-300 to-transparent" />
                            </div>
                        )}
                        <div key={phase.id} className={`rounded-2xl border-2 ${phase.color} shadow-sm hover:shadow-md transition-shadow break-inside-avoid`}>
                            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-t-[calc(1rem-2px)]">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-700 shadow-sm text-sm font-bold border border-gray-100">
                                        {phase.phaseIndex}
                                    </span>
                                    {phase.name}
                                </h3>
                                {(() => {
                                    if (phase.isOptional) {
                                        return (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-200 font-medium shadow-sm">
                                                Optional
                                            </span>
                                        );
                                    }

                                    if (phase.isCareerPhase) {
                                        return (
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                                                <Repeat className="w-4 h-4" />
                                            </span>
                                        );
                                    }

                                    return phase.durationWeeks > 0 ? (
                                        <span className="text-sm font-semibold bg-white/80 px-3 py-1 rounded-full text-gray-600 shadow-sm">
                                            {phase.formattedDuration}
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                                            <Repeat className="w-4 h-4" />
                                        </span>
                                    );
                                })()}
                            </div>

                            <div className="divide-y divide-black/5 bg-white/40 rounded-b-[calc(1rem-2px)]">
                                {phase.chapters.map(ch => (
                                    <div key={ch.id} className="group transition-colors hover:bg-white/60">
                                        <div className="w-full text-left p-5 flex items-start gap-4 outline-none">
                                            <div className={`mt-1 p-2 rounded-lg ${ch.isProject ? 'bg-amber-100 text-amber-700' : ch.isInternship ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {ch.isProject
                                                    ? <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                                                    : ch.isInternship
                                                        ? <Briefcase className="w-5 h-5" />
                                                        : <BookOpen className="w-5 h-5" />
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className={`font-bold text-lg ${ch.isProject ? 'text-amber-800' : ch.isInternship ? 'text-emerald-800' : 'text-gray-800'}`}>
                                                        {ch.title}
                                                    </h4>
                                                    {/* Expand/Collapse Chevron (Hidden in Print) */}
                                                    <button
                                                        onClick={() => toggleModule(ch.id)}
                                                        aria-expanded={expandedModule === ch.id}
                                                        aria-label={expandedModule === ch.id ? `Collapse ${ch.title}` : `Expand ${ch.title}`}
                                                    >
                                                        {expandedModule === ch.id
                                                            ? <ChevronUp className="text-gray-400" />
                                                            : <ChevronDown className="text-gray-400" />
                                                        }
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {ch.topics.slice(0, 3).join(" • ")}
                                                    {ch.topics.length > 3 && ` + ${ch.topics.length - 3} more`}
                                                </p>

                                                {/* Always expand topics in print if desired, or keep as summary. 
                                                    Current logic: Only show if expanded. 
                                                    Better for PDF: Maybe show specific key items or keep it summary to save pages. 
                                                    Let's keep it consistent with screen for now, but ensure the *container* prints. 
                                                */}
                                            </div>
                                        </div>

                                        {/* Expanded topics */}
                                        {expandedModule === ch.id && (
                                            <div className="px-5 pb-6 pl-[4.5rem]">
                                                <div className="bg-white/70 rounded-xl p-4 border border-black/5 shadow-inner">
                                                    <h5 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">
                                                        Syllabus Covered
                                                    </h5>
                                                    <ul className="grid md:grid-cols-2 gap-2">
                                                        {ch.topics.map(t => (
                                                            <li key={t} className="flex items-start gap-2 text-sm text-gray-700">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                                                {t}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Learning Resources (For Free Roadmap) */}
                                                {ch.resources && ch.resources.length > 0 && (
                                                    <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-100 shadow-inner mt-4">
                                                        <h5 className="text-xs font-bold uppercase text-emerald-600 mb-3 tracking-wider flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3" />
                                                            Learning Resources
                                                        </h5>
                                                        <ul className="grid gap-2">
                                                            {ch.resources.map((res, i) => (
                                                                <li key={i}>
                                                                    <a
                                                                        href={res.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-sm text-emerald-800 hover:text-emerald-950 hover:underline font-medium group/link"
                                                                    >
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/link:bg-emerald-600 transition-colors shrink-0" />
                                                                        {res.label}
                                                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>);
                    })}
                </div>
            </div>

            {/* ENROLLMENT CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-[#6F53C1] text-white p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Supercharge this roadmap with expert guidance</h3>
                    <p className="text-blue-100 mb-4 max-w-lg">
                        The Codebasics Bootcamp turns this plan into a guided experience — you learn with accountability, build with feedback, and graduate job-ready.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["Real Business Projects", "Guided Learning Path", "Live Sessions with Industry Experts", "Virtual Internships", "Job Assistance"].map((feature) => (
                            <span key={feature} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-green-300" />
                                {feature}
                            </span>
                        ))}
                    </div>
                    <a
                        href={getBootcampUrl(goalId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all text-sm"
                    >
                        Explore Bootcamp
                    </a>
                </div>
            </div>

            {/* FEEDBACK CAPTURE */}
            <FeedbackWidget sessionId={sessionId} />

            {/* FOOTER CTA */}
            <div className="bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 text-white p-8 rounded-2xl text-center border border-white/10 shadow-3xl relative overflow-hidden">
                <Rocket className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-slate-500 mb-6">Download your personalized, branded PDF roadmap or adjust your settings to create a new plan.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        data-testid="download-pdf-btn"
                        onClick={() => setPdfModalOpen(true)}
                        size="lg"
                        className="px-8 bg-white text-black font-bold rounded-xl hover:bg-gray-100 gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onReset}
                        className="px-8 border-white/20 bg-transparent text-white font-bold rounded-xl hover:bg-white/10 hover:text-white"
                    >
                        Create New Plan
                    </Button>
                </div>


            </div>

            {/* PDF personalization modal */}
            <PdfErrorBoundary>
                <PdfDownloadModal
                    open={pdfModalOpen}
                    onOpenChange={setPdfModalOpen}
                    plan={plan}
                    meta={pdfMeta}
                    learnerType={learnerType}
                    bootcampUrl={getBootcampUrl(goalId)}
                    sessionId={sessionId}
                    initialName={userName}
                    initialEmail={userEmail}
                    personalization={pdfPersonalization}
                />
            </PdfErrorBoundary>
        </div>
    );
}
const SimpleTooltip = ({ children, content, id }: { children: React.ReactNode; content: string; id?: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipId = id || "tooltip";

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            {children}
            {isVisible && (
                <div id={tooltipId} role="tooltip" className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-white text-slate-700 text-xs font-medium rounded-xl shadow-xl border border-slate-100 z-50 pointer-events-none text-center backdrop-blur-sm">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                </div>
            )}
        </div>
    );
};

function FeedbackWidget({ sessionId }: { sessionId?: string }) {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async () => {
        if (rating === null || submitting) return;
        setSubmitting(true);
        setError(false);

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    comment: comment.trim() || "",
                    sessionId: sessionId || "",
                }),
            });

            if (!res.ok) throw new Error("Failed");
            setSubmitted(true);
        } catch {
            console.error(JSON.stringify({ event: "feedback_submission_failed" }));
            setError(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Thanks for your feedback!</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Was this roadmap personalized enough?</h3>
            <div className="flex gap-2 mb-4" role="group" aria-label="Rate from 1 to 5">
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        onClick={() => setRating(n)}
                        disabled={submitting}
                        aria-label={`Rate ${n} out of 5`}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                            rating === n
                                ? "bg-blue-600 text-white shadow-md scale-110"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What felt confusing? (optional)"
                disabled={submitting}
                aria-label="Feedback comment"
                maxLength={2000}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder:text-gray-400 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {error && (
                <p className="text-xs text-red-500 mt-1">Something went wrong. Please try again.</p>
            )}
            <button
                onClick={handleSubmit}
                disabled={rating === null || submitting}
                className={`mt-3 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                    rating !== null && !submitting
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
                {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
        </div>
    );
}

const STAT_ACCENTS = {
    blue:    { icon: 'bg-blue-50 text-blue-600', ring: 'group-hover:ring-blue-100' },
    amber:   { icon: 'bg-amber-50 text-amber-600', ring: 'group-hover:ring-amber-100' },
    emerald: { icon: 'bg-emerald-50 text-emerald-600', ring: 'group-hover:ring-emerald-100' },
    violet:  { icon: 'bg-violet-50 text-violet-600', ring: 'group-hover:ring-violet-100' },
} as const;

function StatCard({ label, value, icon, accent = 'blue' }: { label: string; value: string | number; icon?: React.ReactNode; accent?: keyof typeof STAT_ACCENTS }) {
    const a = STAT_ACCENTS[accent];
    return (
        <div className={`group relative bg-white p-5 md:p-6 border-r border-b border-slate-200/60 last:border-r-0 md:[&:nth-child(4)]:border-r-0 md:[&:nth-child(n+3)]:border-b-0 transition-all hover:bg-slate-50/50`}>
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${a.icon} mb-3 ring-1 ring-transparent ${a.ring} transition-all`}>
                {icon}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">{label}</div>
            <div className="text-3xl md:text-[2.25rem] font-extrabold tracking-tight text-slate-900 leading-none tabular-nums">{value}</div>
        </div>
    );
}
