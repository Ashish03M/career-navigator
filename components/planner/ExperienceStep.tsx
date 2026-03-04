"use client";

import { cn } from "@/lib/utils";
import { type ExperienceState } from "@/lib/types";
import { EXPERIENCE_OPTIONS } from "@/lib/stepOptions";
import { CheckCircle2, Code, Rocket } from "lucide-react";
import { motion } from "framer-motion";
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
                <Code className="text-blue-600" /> Prior Knowledge
            </h2>
            <p className="mb-6 text-slate-500">Select what you already know well enough to skip or fast-track.</p>

            <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map((item, idx) => {
                    const isChecked = experience[item.key as keyof ExperienceState];

                    return (
                        <motion.button
                            key={item.key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => toggle(item.key)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "w-full p-5 rounded-xl border-2 transition-all text-left flex items-start gap-4 group",
                                isChecked
                                    ? "bg-gradient-to-r from-blue-500 to-[#6F53C1] text-white shadow-lg shadow-[#6F53C1]/20"
                                    : "border-gray-200 hover:border-blue-300 bg-white hover:bg-gray-50/50"
                            )}
                            suppressHydrationWarning
                        >
                            <div className={cn(
                                "mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                                isChecked
                                    ? "bg-white border-white"
                                    : "border-gray-300 group-hover:border-blue-300"
                            )}>
                                {isChecked && <CheckCircle2 className="w-4 h-4 text-[#6F53C1]" />}
                            </div>
                            <div>
                                <h4 className={cn("font-semibold", isChecked ? "text-white" : "text-gray-800")}>
                                    {item.label}
                                </h4>
                                <p className={cn("text-sm", isChecked ? "text-white/90" : "text-gray-500")}>{item.desc}</p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {Object.values(experience).filter(Boolean).length > 0 && (
                <p className="text-sm text-emerald-600 font-medium mt-4 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {Object.values(experience).filter(Boolean).length} skill{Object.values(experience).filter(Boolean).length !== 1 ? 's' : ''} selected — we&apos;ll skip these topics to save you time
                </p>
            )}

            <div className="flex gap-3 mt-4">
                <Button variant="outline" size="lg" onClick={onBack} className="rounded-xl px-6">
                    ← Back
                </Button>
                <Button
                    variant="premium"
                    size="lg"
                    data-testid="step-next"
                    onClick={onGenerate}
                    className="flex-1 rounded-xl py-4 h-auto text-lg font-bold"
                >
                    <Rocket className="w-5 h-5 mr-2" /> {nextLabel || "Continue →"}
                </Button>
            </div>
        </motion.div>
    );
}
