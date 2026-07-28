"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

import { AuthProvider } from "@/context/auth-context";
import { AccessibilityProvider } from "@/context/accessibility-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <AuthProvider>
            <AccessibilityProvider>
              {children}
              <Toaster position="bottom-right" />
            </AccessibilityProvider>
          </AuthProvider>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
