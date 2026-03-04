"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { type PlanResult } from "@/lib/types";
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Rocket, Sparkles, Star, Briefcase, Repeat, ExternalLink, Download, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type PdfMeta } from "@/lib/pdf/generateBrandedPdf";

import { PdfErrorBoundary } from "./PdfErrorBoundary";

const PdfDownloadModal = dynamic(() => import("./PdfDownloadModal"), { ssr: false });

type RoadmapResultProps = {
    plan: PlanResult;
    goalLabel: string;
    goalId: string;
    learnerType: string;
    onReset: () => void;
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

export default function RoadmapResult({ plan, goalLabel, goalId, learnerType, onReset }: RoadmapResultProps) {
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);

    const pdfMeta: PdfMeta = {
        targetRoleLabel: goalLabel,
        durationLabel: `${plan.estimatedMonths} months`,
        weeklyHoursLabel: `${plan.hoursPerWeek}h/week`,
        sourceLabel: learnerType === "free" ? "100% Free Resources" : "Codebasics Bootcamp",
    };

    const toggleModule = (id: string) => {
        setExpandedModule(expandedModule === id ? null : id);
    };

    // Refactor: Use derived values from plan (Single Source of Truth)
    const { projectCount, internshipCount, warnings } = plan;

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div>
                {/* HEADER */}
                <div className="bg-white text-slate-900 border-b border-gray-100 pb-8">
                    <div className="flex justify-between items-start">
                        <h2 data-testid="roadmap-heading" className="text-3xl md:text-5xl font-extrabold mb-4 font-[family-name:var(--font-outfit)] tracking-tight">Your Career Roadmap</h2>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center text-slate-500 mb-8">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100 font-sans">
                            {goalLabel}
                        </span>
                        <span>•</span>
                        <span>{plan.estimatedMonths} Months</span>
                        <span>•</span>
                        <span>{plan.hoursPerWeek}h / week</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Modules" value={`${plan.totalModules}`} />
                        <StatCard label="Projects" value={`${projectCount}`} />
                        <StatCard label="Internships" value={`${internshipCount}`} />
                        <StatCard label="Timeline" value={`${plan.estimatedMonths} Mo`} />
                    </div>
                </div>

                {/* PERSONALIZATION DELTA */}
                {plan.diagnostics?.appliedSkips && plan.diagnostics.appliedSkips.length > 0 && (
                    <motion.div
                        className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mt-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
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
                                    you already know — saving you weeks of redundant learning.
                                </p>
                            </div>
                        </div>
                    </motion.div>
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
                            'free-math': 'Foundation Complete — You now have the math and coding basics for AI',
                            'free-ml-projects': 'ML Milestone — You can now build and deploy ML models',
                            'free-genai-projects': 'GenAI Milestone — You can build production AI applications',
                            'free-powerbi': 'Analytics Ready — You can build dashboards and analyze business data',
                            'free-data-modeling': 'DE Foundations Complete — You understand data modeling and warehousing',
                            'free-de-projects': 'DE Milestone — You can build end-to-end data pipelines',
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
                    <h3 className="text-2xl font-bold mb-2">Want structured learning with job support?</h3>
                    <p className="text-blue-100 mb-6 max-w-lg">
                        The Codebasics Bootcamp includes everything in this roadmap plus
                        virtual internships, live problem-solving sessions, and job assistance.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={getBootcampUrl(goalId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all text-sm"
                        >
                            Explore Bootcamp
                        </a>
                        <a
                            href="https://www.youtube.com/@codebasics"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all text-sm"
                        >
                            Free YouTube Course
                        </a>
                    </div>
                </div>
            </div>

            {/* FEEDBACK CAPTURE */}
            <FeedbackWidget />

            {/* FOOTER CTA */}
            <div className="bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 text-white p-8 rounded-2xl text-center border border-white/10 shadow-3xl relative overflow-hidden">
                <Rocket className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-slate-400 mb-6">Download your personalized, branded PDF roadmap or adjust your settings to create a new plan.</p>
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
                />
            </PdfErrorBoundary>
        </motion.div>
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

function FeedbackWidget() {
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
                }),
            });

            if (!res.ok) throw new Error("Failed");
            setSubmitted(true);
        } catch {
            console.error("Feedback submission failed");
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

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-blue-200 uppercase tracking-wider font-bold mb-1">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
