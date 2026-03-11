"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f8fafc" }}>
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
                    <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>&#9888;&#65039;</div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                            A critical error occurred. Please try again.
                            {error.digest && (
                                <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.75rem", color: "#94a3b8" }}>
                                    Error ID: {error.digest}
                                </span>
                            )}
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: "0.625rem 1.5rem",
                                backgroundColor: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: "0.75rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
