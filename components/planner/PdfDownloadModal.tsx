"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { type PlanResult } from "@/lib/types";
import { type PdfMeta, type PdfPersonalization } from "@/lib/pdf/generateBrandedPdf";

type PdfDownloadModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: PlanResult;
    meta: PdfMeta;
    learnerType?: string;
    bootcampUrl?: string;
    sessionId?: string;
    initialName?: string;
    initialEmail?: string;
    personalization?: PdfPersonalization;
};

type ModalState = "form" | "loading" | "success" | "error";

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function PdfDownloadModal({
    open,
    onOpenChange,
    plan,
    meta,
    learnerType,
    bootcampUrl = "https://codebasics.io/bootcamps/gen-ai-data-science-bootcamp-with-virtual-internship",
    sessionId,
    initialName,
    initialEmail,
    personalization,
}: PdfDownloadModalProps) {
    const [name, setName] = useState(initialName ?? "");
    const [email, setEmail] = useState(initialEmail ?? "");
    const [honeypot, setHoneypot] = useState("");
    const [state, setState] = useState<ModalState>("form");
    const [errorMsg, setErrorMsg] = useState("");

    const isValid = name.trim().length >= 2 && isValidEmail(email);
    const firstName = name.trim().split(" ")[0];

    const handleDownload = useCallback(async () => {
        if (!isValid) return;

        setState("loading");
        setErrorMsg("");

        try {
            // Lead data is already captured at roadmap generation time (page.tsx).
            // Dynamic import to code-split react-pdf (~100KB) — only loaded when user actually downloads
            const [{ generateBrandedPdf }, { pdfFilename }] = await Promise.all([
                import("@/lib/pdf/generateBrandedPdf"),
                import("@/lib/pdf/designTokens"),
            ]);

            const pdfPromise = generateBrandedPdf({
                user: { name: name.trim(), email: email.trim() },
                plan,
                meta,
                personalization,
            });
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("PDF generation timed out. Your plan may be too large. Try reducing scope.")), 30000)
            );
            const blob = await Promise.race([pdfPromise, timeoutPromise]);

            // Trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = pdfFilename(name.trim(), meta.targetRoleLabel);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Delay revocation to ensure browser has started the download
            setTimeout(() => URL.revokeObjectURL(url), 10000);

            setState("success");
        } catch (err) {
            console.error(JSON.stringify({ event: "pdf_generation_failed", error: err instanceof Error ? err.message : String(err) }));
            setErrorMsg(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
            setState("error");
        }
    }, [isValid, name, email, plan, meta, honeypot, sessionId, personalization]);

    // Auto-trigger download when modal opens with pre-filled valid data
    const hasAutoTriggered = useRef(false);
    useEffect(() => {
        if (open && isValid && state === "form" && !hasAutoTriggered.current) {
            hasAutoTriggered.current = true;
            handleDownload();
        }
        if (!open) {
            hasAutoTriggered.current = false;
        }
    }, [open, isValid, state, handleDownload]);

    const handleReset = () => {
        setState("form");
        setErrorMsg("");
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            // Reset state when closing
            setState("form");
            setErrorMsg("");
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {state === "form" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Download Your Roadmap
                            </DialogTitle>
                            <DialogDescription className="space-y-1">
                                <span className="block">Your branded PDF includes your name, personalized timeline, and all resources in one printable document.</span>
                                <span className="block text-xs text-slate-400">Built by industry experts at Codebasics</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="pdf-name" className="text-sm font-semibold">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="pdf-name"
                                    placeholder="e.g. Ash Sharma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                <Label htmlFor="pdf-email" className="text-sm font-semibold">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="pdf-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="rounded-xl"
                                />
                                {email.length > 0 && !isValidEmail(email) && (
                                    <p className="text-xs text-red-500">
                                        Enter a valid email address.
                                    </p>
                                )}
                            </div>

                            <div className="hidden">
                                <Label htmlFor="hp-field">Ignore this field</Label>
                                <Input
                                    id="hp-field"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            <p className="text-xs text-slate-500">
                                By downloading, you agree that Codebasics may
                                use your name and email to personalize your
                                roadmap and send you relevant course updates.
                                See our{" "}
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

                        <DialogFooter>
                            <Button
                                onClick={handleDownload}
                                disabled={!isValid}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-[#6F53C1] hover:from-blue-700 hover:to-[#5d44a8] text-white font-bold py-3 h-auto text-base gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Generate & Download PDF
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {state === "loading" && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-lg font-semibold text-gray-700">
                            Hi {firstName}, your roadmap is being prepared…
                        </p>
                        <p className="text-sm text-gray-400">
                            This may take a few seconds.
                        </p>
                    </div>
                )}

                {state === "success" && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        <p className="text-lg font-bold text-gray-800">
                            Your PDF is ready!
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                            Hi {firstName}, your career roadmap has been
                            downloaded. Check your downloads folder.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2 text-center w-full">
                            <p className="text-sm font-semibold text-blue-800 mb-2">Ready to start learning?</p>
                            <a
                                href={bootcampUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                                Explore the Codebasics Bootcamp →
                            </a>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => handleClose(false)}
                            className="rounded-xl mt-2"
                        >
                            Close
                        </Button>
                    </div>
                )}

                {state === "error" && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <p className="text-lg font-bold text-gray-800">
                            Generation Failed
                        </p>
                        <p className="text-sm text-red-500 text-center max-w-xs">
                            {errorMsg}
                        </p>
                        <Button
                            onClick={handleReset}
                            className="rounded-xl mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
