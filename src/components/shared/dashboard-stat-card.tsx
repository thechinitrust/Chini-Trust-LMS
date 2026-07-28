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
    <Card tone={resolvedTone === "primary" ? "brand" : resolvedTone === "accent" ? "accent" : "default"} interactive>
      <CardContent className="flex items-center gap-4 p-6">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            resolvedTone === "primary" && "bg-primary text-primary-foreground shadow-soft",
            resolvedTone === "accent" && "bg-accent text-accent-foreground shadow-soft",
            resolvedTone === "neutral" && "bg-primary/10 text-primary-text"
          )}
        >
          <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div>
          <p className="font-serif text-2xl leading-none text-foreground">{value}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
