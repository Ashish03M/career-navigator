"use client";

import { cn } from "@/lib/utils";
import { type StepOption } from "@/lib/types";
import { type ReactNode, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

type SelectionStepProps = {
    title: string;
    icon: ReactNode;
    options: StepOption[];
    selected: string;
    onSelect: (id: string) => void;
    columns?: 1 | 2;
    onBack?: () => void;
    onNext: () => void;
    nextLabel?: string;
};

export default function SelectionStep({
    title, icon, options, selected, onSelect,
    columns = 2, onBack, onNext, nextLabel = "Continue →"
}: SelectionStepProps) {
    const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSelect = useCallback((id: string) => {
        onSelect(id);
        // Auto-advance after 500ms on selection
        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = setTimeout(() => {
            onNext();
        }, 500);
    }, [onSelect, onNext]);

    // Cleanup timer on unmount to prevent firing after navigation
    useEffect(() => {
        return () => {
            if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        };
    }, []);

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
                {icon} {title}
            </h2>
            <div className={cn("grid gap-4", columns === 2 ? "md:grid-cols-2" : "grid-cols-1")}>
                {options.map((opt, idx) => {
                    const isSelected = selected === opt.id;
                    return (
                        <button
                            key={opt.id}
                            data-testid={`option-${opt.id}`}
                            onClick={() => handleSelect(opt.id)}
                            className={cn(
                                "relative p-6 rounded-xl border-2 transition-all duration-300 text-left flex flex-col gap-3 group overflow-hidden hover:-translate-y-1 active:scale-[0.98]",
                                columns === 2 && options.length % 2 !== 0 && idx === options.length - 1 ? "md:col-span-2" : "",
                                isSelected
                                    ? "scale-[1.02] border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-600 offset-2"
                                    : "border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 hover:shadow-lg hover:scale-[1.01]"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300",
                                isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 rotate-3" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                            )}>
                                {opt.icon ? opt.icon : <span className="text-xl">⚡</span>}
                            </div>

                            <div>
                                <h3 className={cn("text-xl font-bold mb-2 transition-colors", isSelected ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900")}>
                                    {opt.name}
                                </h3>
                                <p className={cn("text-sm leading-relaxed", isSelected ? "text-blue-700/80" : "text-slate-400 group-hover:text-slate-500")}>
                                    {opt.desc || opt.duration}
                                </p>
                                {opt.subtext && (
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-3 font-semibold">
                                        {opt.subtext}
                                    </p>
                                )}
                            </div>

                            {/* Selection Checkmark */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 text-blue-600">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center p-1">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6 pt-0">
                {onBack && (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 pl-0 hover:pl-2 transition-all"
                    >
                        ← Back
                    </Button>
                )}
                <div className="flex-1" />

                <Button
                    data-testid="step-next"
                    onClick={() => selected && onNext()}
                    disabled={!selected}
                    size="lg"
                    className={cn(
                        "rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-all transform",
                        selected
                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
                            : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                    )}
                >
                    {nextLabel}
                </Button>
            </div>
        </div>
    );
}
