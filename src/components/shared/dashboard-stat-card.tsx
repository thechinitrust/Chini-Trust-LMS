import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone = "neutral" | "primary" | "accent";

interface DashboardStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** @deprecated use `tone="primary"` instead — kept so existing call sites keep working. */
  accent?: boolean;
  /** Which brand color highlights this card, if any. */
  tone?: StatTone;
}

export function DashboardStatCard({ icon: Icon, label, value, accent, tone }: DashboardStatCardProps) {
  const resolvedTone: StatTone = tone ?? (accent ? "primary" : "neutral");

  return (
    <Card tone={resolvedTone === "primary" ? "brand" : resolvedTone === "accent" ? "accent" : "default"} interactive className="h-full">
      <CardContent className="flex h-full items-center gap-5 p-6 sm:p-6">
        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-xl",
            resolvedTone === "primary" && "bg-primary text-primary-foreground shadow-soft",
            resolvedTone === "accent" && "bg-accent text-accent-foreground shadow-soft",
            resolvedTone === "neutral" && "bg-primary/10 text-primary-text"
          )}
        >
          <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="flex flex-col justify-center">
          <p className="font-serif text-3xl leading-none text-foreground">{value}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
