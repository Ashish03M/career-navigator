"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Structured error logging — JSON format for log aggregators
        const entry = {
            timestamp: new Date().toISOString(),
            level: "error",
            message: "Unhandled error boundary hit",
            errorMessage: error.message,
            digest: error.digest,
            stack: error.stack?.slice(0, 500),
        };
        console.error(JSON.stringify(entry));
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                    <span className="text-3xl">⚠️</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                    <p className="text-slate-500 text-sm">
                        An unexpected error occurred. Please try again, or contact support if the problem persists.
                    </p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => window.location.href = "/"} className="rounded-xl">
                        Go Home
                    </Button>
                    <Button onClick={reset} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}
