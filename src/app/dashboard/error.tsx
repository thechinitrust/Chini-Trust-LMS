"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="container-page px-6 py-20 lg:px-12 max-w-[800px] text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="size-8" strokeWidth={1.5} />
      </div>
      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
        Unable to load dashboard
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md mx-auto">
        We encountered a problem while retrieving your learning progress. Please try refreshing or reloading your session.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="size-4" /> Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  );
}
