"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

type UserDetailsStepProps = {
    name: string;
    email: string;
    onChangeName: (val: string) => void;
    onChangeEmail: (val: string) => void;
    onBack?: () => void;
    onGenerate: () => void;
};

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function UserDetailsStep({
    name, email, onChangeName, onChangeEmail, onBack, onGenerate
}: UserDetailsStepProps) {
    const isValid = name.trim().length >= 2 && isValidEmail(email);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
                    Almost There!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Let us know who we're building this roadmap for.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                        Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="e.g. Ash Sharma"
                        value={name}
                        onChange={(e) => onChangeName(e.target.value)}
                        autoComplete="name"
                        className="rounded-xl"
                    />
                    {name.length > 0 && name.trim().length < 2 && (
                        <p className="text-xs text-red-500">
                            Name must be at least 2 characters.
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                        Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => onChangeEmail(e.target.value)}
                        autoComplete="email"
                        className="rounded-xl"
                    />
                    {email.length > 0 && !isValidEmail(email) && (
                        <p className="text-xs text-red-500">
                            Enter a valid email address.
                        </p>
                    )}
                </div>

                <p className="text-xs text-slate-500 pt-1">
                    By continuing, you agree that Codebasics may use your
                    name and email to personalize your roadmap and send
                    you relevant course updates. See our{" "}
                    <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-slate-700"
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>

            <div className="flex items-center gap-4 mt-6">
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
                    onClick={onGenerate}
                    disabled={!isValid}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-[#6F53C1] hover:from-blue-700 hover:to-[#5d44a8] text-white font-bold py-3 h-auto text-base gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Sparkles className="w-4 h-4" />
                    Generate Roadmap
                </Button>
            </div>
        </div>
    );
}
