"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/context/auth-context";
import { AccessibilityProvider } from "@/context/accessibility-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <AccessibilityProvider>
          {children}
          <Toaster position="bottom-right" />
        </AccessibilityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
