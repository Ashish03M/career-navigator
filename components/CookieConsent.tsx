"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_KEY = "cookie_consent_expiry";
const EXPIRY_DAYS = 365;

type ConsentStatus = "accepted" | "rejected" | null;

export function getConsentStatus(): ConsentStatus {
    if (typeof window === "undefined") return null;
    const status = localStorage.getItem(CONSENT_KEY) as ConsentStatus;
    const expiry = localStorage.getItem(CONSENT_EXPIRY_KEY);
    if (status && expiry && Date.now() < Number(expiry)) return status;
    return null;
}

function setConsent(status: "accepted" | "rejected") {
    localStorage.setItem(CONSENT_KEY, status);
    localStorage.setItem(
        CONSENT_EXPIRY_KEY,
        String(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    );
    window.dispatchEvent(new Event("cookie-consent-change"));
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const status = getConsentStatus();
        if (status === null) {
            // Use requestAnimationFrame to avoid synchronous setState in effect
            requestAnimationFrame(() => setVisible(true));
        }
    }, []);

    if (!visible) return null;

    const handleAccept = () => {
        setConsent("accepted");
        setVisible(false);
    };

    const handleReject = () => {
        setConsent("rejected");
        setVisible(false);
    };

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-slate-200 bg-white p-4 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6"
        >
            <p className="text-sm text-slate-600">
                We use cookies and analytics (Microsoft Clarity) to improve
                your experience.{" "}
                <a
                    href="/privacy"
                    className="underline text-blue-600 hover:text-blue-700"
                >
                    Privacy Policy
                </a>
            </p>
            <div className="mt-3 flex gap-2 sm:mt-0 sm:shrink-0">
                <button
                    onClick={handleReject}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Reject
                </button>
                <button
                    onClick={handleAccept}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                    Accept
                </button>
            </div>
        </div>
    );
}
