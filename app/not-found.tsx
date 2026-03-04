import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div>
                    <p className="text-7xl font-black text-slate-200 tracking-tight">404</p>
                    <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-2">Page not found</h1>
                    <p className="text-slate-500 text-sm">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full px-8 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    Back to Career Navigator
                </Link>
            </div>
        </div>
    );
}
