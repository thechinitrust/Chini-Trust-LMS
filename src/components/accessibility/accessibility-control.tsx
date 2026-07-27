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
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="shrink-0 pt-1">{control}</div>
      </CardContent>
    </Card>
  );
}
