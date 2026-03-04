"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { User, Mail } from "lucide-react";

type UserDetailsStepProps = {
    name: string;
    email: string;
    onChangeName: (val: string) => void;
    onChangeEmail: (val: string) => void;
    onBack?: () => void;
    onGenerate: () => void;
};

export default function UserDetailsStep({
    name, email, onChangeName, onChangeEmail, onBack, onGenerate
}: UserDetailsStepProps) {
    const isValid = name.trim().length > 0 && email.trim().length > 0 && email.includes("@");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg mx-auto"
        >
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
                Final Step
            </h2>
            <p className="text-center text-slate-500 mb-8">
                Enter your details to save your personalized roadmap.
            </p>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" /> Name
                    </Label>
                    <Input
                        id="name"
                        placeholder="e.g. Alex Chen"
                        value={name}
                        onChange={(e) => onChangeName(e.target.value)}
                        className="h-12 text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="e.g. alex@example.com"
                        value={email}
                        onChange={(e) => onChangeEmail(e.target.value)}
                        className="h-12 text-lg"
                    />
                </div>

                <p className="text-xs text-slate-400 text-center pt-2">
                    Your plan will be saved locally on this device.
                </p>
            </div>

            <div className="flex items-center gap-4 mt-8">
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
                    size="lg"
                    className={cn(
                        "rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-all transform w-full md:w-auto",
                        isValid
                            ? "bg-[#181830] text-white hover:bg-blue-600 hover:shadow-xl hover:-translate-y-0.5"
                            : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                    )}
                >
                    Generate Roadmap →
                </Button>
            </div>
        </motion.div>
    );
}
