"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-[var(--ease-swift)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border shadow-inner data-[state=checked]:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)]",
      className
    )}
    {...props}
  >
    {/* size-5 thumb inside the 24px content box (28px track − 2px border ×
        2) leaves a symmetric 2px gap on every side in both states —
        translate-x-6 lands it flush against the far edge, matching the
        2px inherent to the near edge. */}
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-5 rounded-full bg-background shadow-soft-lg ring-0 transition-transform duration-300 ease-[var(--ease-swift)] data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
