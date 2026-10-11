"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafaf9] text-[#1c1917] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700 uppercase tracking-widest">
            System Notice
          </div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-[#1c1917]">
            Something went wrong
          </h1>
          <p className="text-sm text-[#78716c] leading-relaxed">
            The application encountered a critical error while starting up. Please try reloading the page.
          </p>
          <div>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-full bg-[#0f4c3a] text-white px-6 py-2.5 text-sm font-medium transition hover:bg-[#0b382b]"
            >
              Reload application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
