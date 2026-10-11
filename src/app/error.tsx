"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Home, LayoutDashboard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected errors for monitoring
    console.error("Unhandled client error in CHINI Learn:", error);
  }, [error]);

  return (
    <div className="relative min-h-[calc(100vh-10rem)] flex items-center justify-center px-6 py-20 lg:px-12 overflow-hidden">
      {/* Subtle brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-destructive/5 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        {/* Soft Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/10 px-4 py-1.5 text-xs font-medium tracking-widest text-destructive uppercase">
          <AlertCircle className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          Temporary Issue
        </div>

        {/* Headline */}
        <h1 className="mt-6 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground">
          Something didn&apos;t load quite right
        </h1>

        {/* Calm explanation */}
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
          A temporary glitch prevented this page from displaying properly. Don&apos;t worry &mdash;
          your account, course enrollments, and learning progress remain completely safe.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="rounded-full shadow-soft hover:shadow-glow-brand"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Try again
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" strokeWidth={1.5} aria-hidden="true" />
              My Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/">
              <Home className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Diagnostic info if available */}
        {error.digest && (
          <Card tone="brand" className="mt-12 text-left bg-card/60 backdrop-blur-sm border-border">
            <CardContent className="p-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Diagnostic Reference Code</span>
              <code className="font-mono bg-muted/60 px-2 py-0.5 rounded text-[11px] text-foreground">
                {error.digest}
              </code>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
