import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Sample 100% of errors, 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Filter out noisy errors
    ignoreErrors: [
        "ResizeObserver loop",
        "Non-Error promise rejection",
        "Load failed",
        "Failed to fetch",
    ],
});
