import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — Codebasics Career Navigator",
    description: "Privacy policy for the Codebasics Career Navigator tool.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">
                    ← Back to Career Navigator
                </Link>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                <p className="text-slate-500 text-sm mb-10">
                    Last updated: {new Date().getFullYear()}
                </p>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Who We Are</h2>
                        <p>
                            This Career Navigator tool is operated by <strong>Codebasics</strong>
                            {" "}(<a href="https://codebasics.io" className="text-blue-600 hover:underline">codebasics.io</a>).
                            We provide personalized learning roadmaps for data and AI careers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">2. What Data We Collect</h2>
                        <p>When you download a personalized roadmap PDF, we collect:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Full name</strong> — to personalise your PDF</li>
                            <li><strong>Email address</strong> — to send you relevant learning resources</li>
                            <li><strong>Career preferences</strong> — target role, weekly availability, background level</li>
                        </ul>
                        <p className="mt-3">
                            We do <strong>not</strong> collect payment information, passwords, or sensitive personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Data</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>To generate and personalise your career roadmap PDF</li>
                            <li>To send you information about Codebasics courses relevant to your goals</li>
                            <li>To improve our curriculum and learning recommendations</li>
                        </ul>
                        <p className="mt-3">We do <strong>not</strong> sell your data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Storage</h2>
                        <p>
                            Your data is stored securely in Google Sheets, accessible only to Codebasics staff.
                            Data is retained for up to 3 years or until you request deletion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Request access to the data we hold about you</li>
                            <li>Request deletion of your data</li>
                            <li>Opt out of marketing communications at any time</li>
                        </ul>
                        <p className="mt-3">
                            To exercise these rights, email us at{" "}
                            <a href="mailto:info@codebasics.io" className="text-blue-600 hover:underline">
                                info@codebasics.io
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Cookies</h2>
                        <p>
                            This tool uses a single session cookie (<code className="bg-slate-100 px-1 rounded text-sm">admin_token</code>)
                            only for admin panel authentication. No tracking or advertising cookies are used.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact</h2>
                        <p>
                            For any privacy questions, contact{" "}
                            <a href="mailto:info@codebasics.io" className="text-blue-600 hover:underline">
                                info@codebasics.io
                            </a>{" "}
                            or visit{" "}
                            <a href="https://codebasics.io" className="text-blue-600 hover:underline">
                                codebasics.io
                            </a>.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
