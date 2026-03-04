"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Focus the password input on mount (client-side only to avoid hydration mismatch)
        passwordRef.current?.focus();
    }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4">
                        <Lock className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                    <p className="text-slate-400">Bootcamp Syllabus Manager</p>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 space-y-6 backdrop-blur-sm"
                >
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">
                            Admin Password
                        </Label>
                        <Input
                            id="password"
                            ref={passwordRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 focus:text-white focus:bg-slate-900"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Authenticating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
