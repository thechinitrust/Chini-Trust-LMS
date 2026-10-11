import Link from "next/link";
import { BookOpen, FileQuestion, Home, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] flex items-center justify-center px-6 py-20 lg:px-12 overflow-hidden">
      {/* Ambient brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary-text uppercase">
          <FileQuestion className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          404 &middot; Page Not Found
        </div>

        {/* Headline */}
        <h1 className="mt-6 font-serif text-4xl sm:text-5xl font-normal tracking-tight text-foreground">
          We couldn&apos;t find that page
        </h1>

        {/* Reassuring description */}
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
          The page or resource you are looking for might have been moved, renamed, or is temporarily
          unavailable. All of our course content and resources remain accessible from the links below.
        </p>

        {/* Primary actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full shadow-soft hover:shadow-glow-brand">
            <Link href="/learn">
              <BookOpen className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Explore Courses
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/">
              <Home className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/resources">
              <Library className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Resource Library
            </Link>
          </Button>
        </div>

        {/* Helpful card */}
        <Card tone="brand" className="mt-12 text-left bg-card/60 backdrop-blur-sm border-primary/15">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Looking for a specific course?</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              If you enrolled in a course recently, check your{" "}
              <Link href="/dashboard" className="text-primary-text font-medium underline underline-offset-4 hover:opacity-80">
                learning dashboard
              </Link>{" "}
              to resume where you left off, or browse our full catalogue under{" "}
              <Link href="/learn" className="text-primary-text font-medium underline underline-offset-4 hover:opacity-80">
                Learn
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
