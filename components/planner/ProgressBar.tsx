"use client";

import { Progress } from "@/components/ui/progress";

type ProgressBarProps = {
    currentStep: number;
    totalSteps: number;
};

const STEP_LABELS = [
    "Background",
    "Prior Knowledge",
    "Target Goal",
    "Career Outcome",
    "Availability",
    "Learning Style",
];

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const pct = (currentStep / totalSteps) * 100;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                <span>Step {currentStep} of {totalSteps}</span>
                <span className="text-blue-600 normal-case tracking-normal">
                    {STEP_LABELS[currentStep - 1]}
                </span>
            </div>
            <Progress value={pct} />
            {/* Step dots */}
            <div className="flex justify-between mt-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i + 1 <= currentStep
                            ? 'bg-blue-500 scale-125'
                            : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

