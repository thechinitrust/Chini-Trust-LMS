import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({ value, label, showPercent = true, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-primary">{clamped}%</span>}
        </div>
      )}
      <Progress value={clamped} aria-label={label ?? "Progress"} />
    </div>
  );
}
