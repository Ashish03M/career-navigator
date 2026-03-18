"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { getConsentStatus } from "./CookieConsent";

export default function ClarityScript() {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    const [consented, setConsented] = useState(false);

    useEffect(() => {
        const check = () => setConsented(getConsentStatus() === "accepted");
        check();
        window.addEventListener("cookie-consent-change", check);
        return () =>
            window.removeEventListener("cookie-consent-change", check);
    }, []);

    if (!clarityId || !consented) return null;

    return (
        <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
        >{`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${clarityId}");
        `}</Script>
    );
}
