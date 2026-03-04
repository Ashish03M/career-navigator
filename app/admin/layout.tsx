"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) {
            setChecking(false);
            setAuthenticated(false);
            return;
        }

        async function checkAuth() {
            try {
                const res = await fetch("/api/admin/check");
                const data = await res.json();
                if (!data.authenticated) {
                    router.replace("/admin/login");
                } else {
                    setAuthenticated(true);
                }
            } catch {
                router.replace("/admin/login");
            } finally {
                setChecking(false);
            }
        }
        checkAuth();
    }, [isLoginPage, router]);

    async function handleLogout() {
        await fetch("/api/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
        });
        router.replace("/admin/login");
    }

    // Login page: no shell
    if (isLoginPage) return <>{children}</>;

    // Loading state
    if (checking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    // Not authenticated (will redirect)
    if (!authenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-lg hidden md:inline-block">Admin Panel</span>
                                <p className="text-xs text-slate-500">Manage subjects & chapters</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="/"
                                target="_blank"
                                className="inline-flex items-center px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                View Planner →
                            </a>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="text-slate-600"
                            >
                                <LogOut className="w-4 h-4 mr-1" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
