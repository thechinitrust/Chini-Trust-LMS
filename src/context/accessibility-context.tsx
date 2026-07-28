"use client";

import * as React from "react";

export type TextScale = "default" | "lg" | "xl";
/** How the read-aloud control sources the text it speaks. */
export type ReadAloudMode = "page" | "selection";

interface AccessibilityState {
  dyslexiaFont: boolean;
  textScale: TextScale;
  focusMode: boolean;
  readAloud: boolean;
  readAloudMode: ReadAloudMode;
}

interface AccessibilityContextValue extends AccessibilityState {
  setDyslexiaFont: (value: boolean) => void;
  setTextScale: (value: TextScale) => void;
  setFocusMode: (value: boolean) => void;
  setReadAloud: (value: boolean) => void;
  setReadAloudMode: (value: ReadAloudMode) => void;
  reset: () => void;
}

const DEFAULT_STATE: AccessibilityState = {
  dyslexiaFont: false,
  textScale: "default",
  focusMode: false,
  readAloud: false,
  readAloudMode: "page",
};

const STORAGE_KEY = "neurobridge.accessibility";

const AccessibilityContext = React.createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AccessibilityState>(DEFAULT_STATE);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setState({ ...DEFAULT_STATE, ...JSON.parse(stored) });
    } catch {
      // ignore malformed storage
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const root = document.documentElement;
    root.classList.toggle("font-dyslexic", state.dyslexiaFont);
    root.classList.toggle("focus-mode", state.focusMode);
    root.classList.remove("text-scale-lg", "text-scale-xl");
    if (state.textScale === "lg") root.classList.add("text-scale-lg");
    if (state.textScale === "xl") root.classList.add("text-scale-xl");
  }, [state]);

  const value: AccessibilityContextValue = {
    ...state,
    setDyslexiaFont: (dyslexiaFont) => setState((s) => ({ ...s, dyslexiaFont })),
    setTextScale: (textScale) => setState((s) => ({ ...s, textScale })),
    setFocusMode: (focusMode) => setState((s) => ({ ...s, focusMode })),
    setReadAloud: (readAloud) => setState((s) => ({ ...s, readAloud })),
    setReadAloudMode: (readAloudMode) => setState((s) => ({ ...s, readAloudMode })),
    reset: () => setState(DEFAULT_STATE),
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = React.useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within an AccessibilityProvider");
  return ctx;
}
