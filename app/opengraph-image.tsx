import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Codebasics Data & AI Career Roadmap Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #181830 100%)",
                    fontFamily: "sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative gradient circles */}
                <div
                    style={{
                        position: "absolute",
                        top: "-100px",
                        right: "-100px",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
                        display: "flex",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-80px",
                        left: "-80px",
                        width: "350px",
                        height: "350px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(111,83,193,0.3) 0%, transparent 70%)",
                        display: "flex",
                    }}
                />

                {/* Codebasics icon (text-based fallback) */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "24px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #3B82F6, #6F53C1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "24px",
                            fontWeight: 800,
                        }}
                    >
                        CB
                    </div>
                    <span
                        style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#93c5fd",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Codebasics
                    </span>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: "56px",
                        fontWeight: 800,
                        color: "white",
                        textAlign: "center",
                        lineHeight: 1.15,
                        maxWidth: "900px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <span>Data & AI Career</span>
                    <span
                        style={{
                            background: "linear-gradient(90deg, #3B82F6, #6F53C1)",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        Roadmap Generator
                    </span>
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: "24px",
                        color: "#94a3b8",
                        textAlign: "center",
                        maxWidth: "700px",
                        marginTop: "20px",
                        lineHeight: 1.4,
                        display: "flex",
                    }}
                >
                    Personalized week-by-week learning plan for your Data & AI career. Free PDF in 2 minutes.
                </div>

                {/* Role pills */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "32px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {["Data Analyst", "Data Engineer", "Data Scientist", "ML Engineer", "AI Engineer"].map(
                        (role) => (
                            <div
                                key={role}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: "999px",
                                    border: "1px solid rgba(59,130,246,0.4)",
                                    background: "rgba(59,130,246,0.1)",
                                    color: "#93c5fd",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    display: "flex",
                                }}
                            >
                                {role}
                            </div>
                        )
                    )}
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        height: "4px",
                        background: "linear-gradient(90deg, #3B82F6, #6F53C1, #3B82F6)",
                        display: "flex",
                    }}
                />
            </div>
        ),
        { ...size }
    );
}
