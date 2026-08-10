"use client";

import * as React from "react";

export type TextScale = "default" | "lg" | "xl";
/** How the read-aloud control sources the text it speaks. */
export type ReadAloudMode = "page" | "selection";
/** Reading font applied site-wide — each maps to a `.font-{value}` class in globals.css. */
export type FontChoice = "default" | "dyslexic" | "lato" | "atkinson" | "lexend";

interface AccessibilityState {
  fontChoice: FontChoice;
  textScale: TextScale;
  focusMode: boolean;
  readAloud: boolean;
  readAloudMode: ReadAloudMode;
}

interface AccessibilityContextValue extends AccessibilityState {
  setFontChoice: (value: FontChoice) => void;
  setTextScale: (value: TextScale) => void;
  setFocusMode: (value: boolean) => void;
  setReadAloud: (value: boolean) => void;
  setReadAloudMode: (value: ReadAloudMode) => void;
  reset: () => void;
}

const DEFAULT_STATE: AccessibilityState = {
  fontChoice: "default",
  textScale: "default",
  focusMode: false,
  readAloud: false,
  readAloudMode: "page",
};

const FONT_CLASSES = ["font-dyslexic", "font-lato", "font-atkinson", "font-lexend"];

const STORAGE_KEY = "chini-learn.accessibility";

const AccessibilityContext = React.createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AccessibilityState>(DEFAULT_STATE);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      // Migrate the old binary `dyslexiaFont` flag to `fontChoice`.
      if (parsed.fontChoice === undefined && parsed.dyslexiaFont) parsed.fontChoice = "dyslexic";
      delete parsed.dyslexiaFont;
      setState({ ...DEFAULT_STATE, ...parsed });
    } catch {
      // ignore malformed storage
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const root = document.documentElement;
    root.classList.remove(...FONT_CLASSES);
    if (state.fontChoice !== "default") root.classList.add(`font-${state.fontChoice}`);
    root.classList.toggle("focus-mode", state.focusMode);
    root.classList.remove("text-scale-lg", "text-scale-xl");
    if (state.textScale === "lg") root.classList.add("text-scale-lg");
    if (state.textScale === "xl") root.classList.add("text-scale-xl");
  }, [state]);

  const value: AccessibilityContextValue = {
    ...state,
    setFontChoice: (fontChoice) => setState((s) => ({ ...s, fontChoice })),
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
