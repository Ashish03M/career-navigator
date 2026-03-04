"use client";

import { cn } from "@/lib/utils";
import { type ExperienceState } from "@/lib/types";
import { EXPERIENCE_OPTIONS, EXPERIENCE_CATEGORIES } from "@/lib/stepOptions";
import { Check, CheckCircle2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExperienceStepProps = {
    experience: ExperienceState;
    onChange: (updated: ExperienceState) => void;
    onBack: () => void;
    onGenerate: () => void;
    nextLabel?: string;
};

export default function ExperienceStep({ experience, onChange, onBack, onGenerate, nextLabel }: ExperienceStepProps) {
    const toggle = (key: string) => {
        onChange({ ...experience, [key]: !experience[key as keyof ExperienceState] });
    };

    const selectedCount = Object.values(experience).filter(Boolean).length;

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
                <Code className="text-blue-600" /> Prior Knowledge
            </h2>
            <p className="mb-6 text-slate-500">Select what you already know — we&apos;ll skip those topics.</p>

            <div className="space-y-5">
                {EXPERIENCE_CATEGORIES.map((cat) => {
                    const items = EXPERIENCE_OPTIONS.filter((o) => o.group === cat.id);
                    if (items.length === 0) return null;

                    return (
                        <div key={cat.id}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                                {cat.label}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                {items.map((item) => {
                                    const isChecked = experience[item.key as keyof ExperienceState];
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => toggle(item.key)}
                                            className={cn(
                                                "relative rounded-xl p-3.5 text-left border-2 transition-all active:scale-[0.98] group",
                                                isChecked
                                                    ? "bg-gradient-to-br from-blue-500 to-[#6F53C1] text-white border-transparent shadow-lg shadow-[#6F53C1]/15"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={cn(
                                                    "w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                                                    isChecked
                                                        ? "bg-white/90 border-white/60"
                                                        : "border-slate-300 group-hover:border-blue-300"
                                                )}>
                                                    {isChecked && <Check className="w-3 h-3 text-[#6F53C1]" strokeWidth={3} />}
                                                </div>
                                                <span className="font-semibold text-sm leading-tight">{item.label}</span>
                                            </div>
                                            <p className={cn(
                                                "text-[11px] leading-snug pl-6",
                                                isChecked ? "text-white/75" : "text-slate-400"
                                            )}>
                                                {item.desc}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedCount > 0 && (
                <p className="text-sm text-emerald-600 font-medium mt-5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedCount} skill{selectedCount !== 1 ? 's' : ''} selected — we&apos;ll skip these topics to save you time
                </p>
            )}

            <div className="flex items-center gap-4 mt-6">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 pl-0 hover:pl-2 transition-all"
                >
                    ← Back
                </Button>
                <div className="flex-1" />
                <Button
                    data-testid="step-next"
                    onClick={onGenerate}
                    size="lg"
                    className="rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-all transform bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                >
                    {nextLabel || "Continue →"}
                </Button>
            </div>
        </div>
    );
}
