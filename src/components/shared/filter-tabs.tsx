"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  layoutId?: string;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  className,
  layoutId = "filter-tabs-pill",
}: FilterTabsProps<T>) {
  return (
    <div role="tablist" className={cn("flex flex-wrap gap-2", className)} aria-label="Filter">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active ? "border-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
