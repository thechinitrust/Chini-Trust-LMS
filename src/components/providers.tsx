"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

import { AuthProvider } from "@/context/auth-context";
import { AccessibilityProvider, useAccessibility } from "@/context/accessibility-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function DynamicMotionConfig({ children }: { children: React.ReactNode }) {
  const { focusMode } = useAccessibility();
  return (
    <MotionConfig reducedMotion={focusMode ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        <AuthProvider>
          <AccessibilityProvider>
            <DynamicMotionConfig>
              {children}
              <Toaster position="bottom-right" />
            </DynamicMotionConfig>
          </AccessibilityProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
