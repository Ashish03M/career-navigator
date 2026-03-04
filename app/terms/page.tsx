import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — Codebasics Career Navigator",
    description: "Terms of service for the Codebasics Career Navigator tool.",
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">
                    &larr; Back to Career Navigator
                </Link>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
                <p className="text-slate-500 text-sm mb-10">
                    Last updated: {new Date().getFullYear()}
                </p>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Career Navigator tool operated by{" "}
                            <strong>Codebasics</strong>{" "}
                            (<a href="https://codebasics.io" className="text-blue-600 hover:underline">codebasics.io</a>),
                            you agree to be bound by these Terms of Service. If you do not agree
                            to these terms, please do not use the tool.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
                        <p>
                            Codebasics Career Navigator is a free planning tool that generates
                            personalized, week-by-week learning roadmaps for Data and AI careers.
                            The tool collects your preferences through a short questionnaire and
                            produces a downloadable PDF roadmap tailored to your background, goals,
                            and schedule.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Acceptable Use</h2>
                        <p>You agree to use the Career Navigator only for lawful purposes. You shall not:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Use automated scripts, bots, or crawlers to access the tool</li>
                            <li>Attempt to gain unauthorized access to the admin panel or backend systems</li>
                            <li>Submit false, misleading, or fraudulent information</li>
                            <li>Interfere with or disrupt the service or its infrastructure</li>
                            <li>Reverse-engineer, decompile, or disassemble any part of the application</li>
                            <li>Use the tool to collect data about other users</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Intellectual Property</h2>
                        <p>
                            All content, design, code, syllabus data, roadmap generation algorithms,
                            and branding associated with the Career Navigator and Codebasics are the
                            exclusive property of Codebasics and are protected by copyright and
                            intellectual property laws.
                        </p>
                        <p className="mt-3">
                            You are granted a limited, non-exclusive, non-transferable right to use the
                            generated roadmap PDF for your personal, non-commercial learning purposes.
                            You may not reproduce, distribute, sell, or publicly display the roadmap or
                            any other content from the tool without prior written consent from Codebasics.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Disclaimers</h2>
                        <p>
                            The Career Navigator is provided <strong>&quot;as is&quot;</strong> and{" "}
                            <strong>&quot;as available&quot;</strong> without warranties of any kind,
                            whether express or implied, including but not limited to implied warranties
                            of merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>
                                Roadmaps are generated algorithmically based on your inputs. They are
                                recommendations, not guarantees of learning outcomes or career placement.
                            </li>
                            <li>
                                Codebasics does not guarantee that the tool will be uninterrupted,
                                error-free, or free of harmful components.
                            </li>
                            <li>
                                Estimated timelines are approximate and depend on individual effort,
                                prior experience, and learning pace.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by applicable law, Codebasics and its
                            directors, employees, and affiliates shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages, including but not
                            limited to loss of profits, data, use, or goodwill, arising out of or
                            related to your use of or inability to use the Career Navigator, even if
                            Codebasics has been advised of the possibility of such damages.
                        </p>
                        <p className="mt-3">
                            In no event shall the total liability of Codebasics exceed the amount you
                            paid to use the tool (which, for the free tier, is zero).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Practices</h2>
                        <p>
                            Your use of the Career Navigator is also governed by our{" "}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                                Privacy Policy
                            </Link>
                            , which describes how we collect, use, and protect your personal data.
                            By using the tool, you consent to the data practices described in the
                            Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Third-Party Links</h2>
                        <p>
                            The Career Navigator may contain links to third-party websites, including
                            Codebasics course pages, YouTube, and social media platforms. Codebasics
                            is not responsible for the content or practices of any linked third-party
                            sites.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Modifications</h2>
                        <p>
                            Codebasics reserves the right to modify these Terms of Service at any
                            time. Changes will be effective immediately upon posting the updated terms
                            on this page. Your continued use of the Career Navigator after any
                            changes constitutes acceptance of the revised terms.
                        </p>
                        <p className="mt-3">
                            We may also modify, suspend, or discontinue the Career Navigator (or any
                            part of it) at any time without prior notice or liability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Governing Law</h2>
                        <p>
                            These Terms of Service shall be governed by and construed in accordance
                            with the laws of India. Any disputes arising out of or in connection with
                            these terms shall be subject to the exclusive jurisdiction of the courts
                            in Bangalore, Karnataka, India.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact</h2>
                        <p>
                            For any questions about these Terms of Service, contact{" "}
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
