import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface AccessibilityControlProps {
  icon: LucideIcon;
  title: string;
  description: string;
  control: React.ReactNode;
}

export function AccessibilityControl({ icon: Icon, title, description, control }: AccessibilityControlProps) {
  return (
    <Card className="transition-shadow duration-500 hover:shadow-soft-lg">
      <CardContent className="flex items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="shrink-0">{control}</div>
      </CardContent>
    </Card>
  );
}
