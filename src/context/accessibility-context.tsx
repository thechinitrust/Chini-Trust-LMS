"use client";

import * as React from "react";

import { usePathname } from "next/navigation";

export type TextScale = "default" | "lg" | "xl";
/** How the read-aloud control sources the text it speaks. */
export type ReadAloudMode = "page" | "selection";
/** Reading font applied site-wide — each maps to a `.font-{value}` class in globals.css. */
export type FontChoice = "default" | "dyslexic" | "lato" | "atkinson" | "lexend";

export function isLearningRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/learn") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/lessons")
  );
}

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

const SESSION_FOCUS_KEY = "chini-learn.focusMode";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLearning = isLearningRoute(pathname);
  const [state, setState] = React.useState<AccessibilityState>(DEFAULT_STATE);

  // Load persistent preferences ONCE on mount
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      if (parsed.fontChoice === undefined && parsed.dyslexiaFont) parsed.fontChoice = "dyslexic";
      delete parsed.dyslexiaFont;

      const sessionFocus = window.sessionStorage.getItem(SESSION_FOCUS_KEY) === "true";
      const focusMode = sessionFocus && isLearningRoute(window.location.pathname);

      setState((prev) => ({
        ...prev,
        fontChoice: parsed.fontChoice ?? prev.fontChoice,
        textScale: parsed.textScale ?? prev.textScale,
        readAloud: parsed.readAloud ?? prev.readAloud,
        readAloudMode: parsed.readAloudMode ?? prev.readAloudMode,
        focusMode,
      }));
    } catch {
      // ignore malformed storage
    }
  }, []);

  // If navigating away from learning pages, automatically exit focus mode
  React.useEffect(() => {
    if (state.focusMode && !isLearning) {
      setState((s) => ({ ...s, focusMode: false }));
      try {
        window.sessionStorage.removeItem(SESSION_FOCUS_KEY);
      } catch {
        // ignore
      }
    }
  }, [isLearning, state.focusMode]);

  // Sync DOM classes and save persistent preferences to localStorage
  React.useEffect(() => {
    const toStore = {
      fontChoice: state.fontChoice,
      textScale: state.textScale,
      readAloud: state.readAloud,
      readAloudMode: state.readAloudMode,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

    const root = document.documentElement;
    root.classList.remove(...FONT_CLASSES);
    if (state.fontChoice !== "default") root.classList.add(`font-${state.fontChoice}`);
    root.classList.toggle("focus-mode", state.focusMode && isLearning);
    root.classList.remove("text-scale-lg", "text-scale-xl");
    if (state.textScale === "lg") root.classList.add("text-scale-lg");
    if (state.textScale === "xl") root.classList.add("text-scale-xl");
  }, [state.fontChoice, state.textScale, state.readAloud, state.readAloudMode, state.focusMode, isLearning]);

  const value: AccessibilityContextValue = {
    ...state,
    setFontChoice: (fontChoice) => setState((s) => ({ ...s, fontChoice })),
    setTextScale: (textScale) => setState((s) => ({ ...s, textScale })),
    setFocusMode: (focusMode) => {
      setState((s) => ({ ...s, focusMode }));
      try {
        if (focusMode) {
          window.sessionStorage.setItem(SESSION_FOCUS_KEY, "true");
        } else {
          window.sessionStorage.removeItem(SESSION_FOCUS_KEY);
        }
      } catch {
        // ignore
      }
    },
    setReadAloud: (readAloud) => setState((s) => ({ ...s, readAloud })),
    setReadAloudMode: (readAloudMode) => setState((s) => ({ ...s, readAloudMode })),
    reset: () => {
      setState(DEFAULT_STATE);
      try {
        window.sessionStorage.removeItem(SESSION_FOCUS_KEY);
      } catch {
        // ignore
      }
    },
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = React.useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within an AccessibilityProvider");
  return ctx;
}
