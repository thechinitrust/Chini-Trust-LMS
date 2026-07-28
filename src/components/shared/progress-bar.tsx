import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
  tone?: "primary" | "accent";
}

export function ProgressBar({ value, label, showPercent = true, className, tone = "primary" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className={tone === "accent" ? "text-accent-text" : "text-primary-text"}>{clamped}%</span>
          )}
        </div>
      )}
      <Progress value={clamped} tone={tone} aria-label={label ?? "Progress"} />
    </div>
  );
}
