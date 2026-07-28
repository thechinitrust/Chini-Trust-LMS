"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  /** Which brand color leads this card — alternate these across a grid so it doesn't read as all-olive. */
  tone?: "primary" | "accent";
}

export function FeatureCard({ icon, title, description, href, tone = "primary" }: FeatureCardProps) {
  const isAccent = tone === "accent";

  return (
    <div className="h-full">
      <Link href={href} className="group block h-full">
        <Card tone={isAccent ? "accent" : "brand"} interactive className="flex h-full flex-row overflow-hidden">
          <div
            className={cn(
              "flex w-24 shrink-0 flex-col items-center justify-center bg-gradient-to-br text-primary-foreground transition-all duration-500 group-hover:brightness-110",
              isAccent ? "from-accent to-ink" : "from-primary to-ink"
            )}
          >
            <span className="drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
              {icon}
            </span>
          </div>
          <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
            <h3 className="font-serif text-xl text-foreground">{title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            <span
              className={cn(
                "mt-4 inline-flex items-center gap-1.5 text-sm font-medium",
                isAccent ? "text-accent-text" : "text-primary-text"
              )}
            >
              Explore
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
