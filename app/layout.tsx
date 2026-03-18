import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "./providers";
import ClarityScript from "@/components/ClarityScript";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Data & AI Career Roadmap Generator",
    url: "https://navigator.codebasics.io",
    description:
        "Answer 6 questions and get a personalized, week-by-week learning roadmap for Data & AI careers. Free PDF plan tailored to your background, goals, and schedule.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: {
        "@type": "Organization",
        name: "Codebasics",
        url: "https://codebasics.io",
    },
};

export const metadata: Metadata = {
    metadataBase: new URL("https://navigator.codebasics.io"),
    title: "Data & AI Career Roadmap Generator — Codebasics",
    description:
        "Answer 6 questions and get a personalized, week-by-week learning roadmap for Data Analyst, Data Engineer, Data Scientist, ML Engineer, or AI Engineer careers. Free PDF plan tailored to your background, goals, and schedule.",
    alternates: {
        canonical: "/",
    },
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    },
    openGraph: {
        title: "Data & AI Career Roadmap Generator — Codebasics",
        description:
            "Get a personalized, week-by-week learning plan for Data & AI careers. Free PDF download in under 2 minutes.",
        url: "https://navigator.codebasics.io",
        siteName: "Codebasics Career Navigator",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Data & AI Career Roadmap Generator — Codebasics",
        description:
            "Personalized week-by-week plan for Data & AI careers. Free PDF in 2 minutes.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body
                className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground min-h-screen selection:bg-blue-500/30`}
                suppressHydrationWarning
            >
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium"
                >
                    Skip to main content
                </a>
                <ClarityScript />
                <Providers>{children}</Providers>
                <CookieConsent />
            </body>
        </html>
    );
}
