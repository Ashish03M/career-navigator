"use client";

import React from "react";

type Props = {
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
};

export class PdfErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error(JSON.stringify({
            event: "pdf_error_boundary",
            message: error.message,
            stack: error.stack?.slice(0, 500),
        }));
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-red-700 font-medium">
                        PDF download is temporarily unavailable. Please refresh the page and try again.
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}
