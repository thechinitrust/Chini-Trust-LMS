import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            The Chini Trust
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Empowering Neurodiverse Minds Through{" "}
            <span className="text-primary">Learning, Inclusion, and AI</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            A centralized platform for education, support, and accessible resources tailored to
            every learning journey.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/learn">
                Start Learning
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/ai-neuroguide">Try AI NeuroGuide</Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-3">
              <div className="h-3 w-2/3 rounded-full bg-secondary" />
              <div className="h-3 w-1/2 rounded-full bg-secondary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-2xl font-bold text-primary">1 in 7</p>
                <p className="text-xs text-muted-foreground">people are neurodivergent</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-2xl font-bold text-primary">100+</p>
                <p className="text-xs text-muted-foreground">resources available</p>
              </div>
            </div>
            <div className="rounded-xl bg-accent/10 p-4 text-sm text-foreground">
              &ldquo;Structured, evidence-based learning that meets people where they are.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
