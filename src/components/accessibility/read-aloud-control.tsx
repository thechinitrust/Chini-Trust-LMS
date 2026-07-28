"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square, TextSelect, FileText, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAccessibility, type ReadAloudMode } from "@/context/accessibility-context";

/**
 * Floating read-aloud control, shown on the right edge whenever the
 * "Read aloud" accessibility preference is on.
 *
 * Two sourcing modes (per the accessibility spec):
 *  - "page"      — reads the main content region top to bottom
 *  - "selection" — reads only what the user has highlighted
 *
 * Uses the browser's built-in SpeechSynthesis API, so nothing is sent to a
 * server and it works offline. Degrades to a clear "unsupported" message on
 * browsers without speech synthesis.
 */

type Status = "idle" | "speaking" | "paused";

/** Pulls readable text out of the main region, skipping chrome and hidden nodes. */
function getPageText(): string {
  const main = document.getElementById("main-content") ?? document.querySelector("main");
  if (!main) return "";

  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "SVG", "BUTTON", "NAV"]);
  const parts: string[] = [];

  const walker = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const el = node as HTMLElement;
      if (SKIP.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (el.getAttribute("aria-hidden") === "true") return NodeFilter.FILTER_REJECT;
      if (el.dataset.readAloudSkip === "true") return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const BLOCKS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "LI", "DT", "DD", "FIGCAPTION", "BLOCKQUOTE", "TD", "TH"]);
  let current = walker.currentNode as HTMLElement | null;
  while (current) {
    if (BLOCKS.has(current.tagName)) {
      const text = (current.innerText || current.textContent || "").trim();
      // Punctuate headings so the synth pauses naturally between sections
      if (text) parts.push(/[.!?:;]$/.test(text) ? text : `${text}.`);
    }
    current = walker.nextNode() as HTMLElement | null;
  }

  return parts.join(" ");
}

function getSelectionText(): string {
  return (window.getSelection()?.toString() ?? "").trim();
}

export function ReadAloudControl() {
  const { readAloud, readAloudMode, setReadAloudMode } = useAccessibility();
  const pathname = usePathname();

  const [status, setStatus] = React.useState<Status>("idle");
  const [supported, setSupported] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = React.useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setStatus("idle");
  }, []);

  // Stop narration when navigating away, toggling off, or unmounting.
  React.useEffect(() => stop, [pathname, stop]);
  React.useEffect(() => {
    if (!readAloud) stop();
  }, [readAloud, stop]);

  // Auto-clear the transient hint message.
  React.useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(t);
  }, [message]);

  const speak = React.useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    const text = readAloudMode === "selection" ? getSelectionText() : getPageText();

    if (!text) {
      setMessage(
        readAloudMode === "selection"
          ? "Select some text on the page first, then press play."
          : "There's no readable text on this page."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus("speaking");
  }, [readAloudMode]);

  const handlePlayPause = () => {
    if (!("speechSynthesis" in window)) return;
    if (status === "speaking") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("speaking");
    } else {
      speak();
    }
  };

  const handleModeChange = (mode: ReadAloudMode) => {
    stop();
    setReadAloudMode(mode);
  };

  if (!readAloud) return null;

  const MODES: { value: ReadAloudMode; label: string; icon: typeof FileText }[] = [
    { value: "page", label: "Read entire page", icon: FileText },
    { value: "selection", label: "Read selected text", icon: TextSelect },
  ];

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-1/2 right-4 z-50 -translate-y-1/2 print:hidden"
        aria-label="Read aloud controls"
        data-read-aloud-skip="true"
      >
        <div className="flex flex-col items-center gap-2 rounded-full border border-border bg-card/95 p-2 shadow-soft-lg backdrop-blur-xl">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary-text">
            <Volume2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </span>

          {!supported ? (
            <p className="max-w-24 px-1 pb-1 text-center text-[10px] leading-tight text-muted-foreground">
              Read aloud isn&apos;t supported in this browser.
            </p>
          ) : (
            <>
              <div className="h-px w-6 bg-border" aria-hidden="true" />

              {/* Mode switch */}
              <div className="flex flex-col gap-1" role="group" aria-label="Reading mode">
                {MODES.map(({ value, label, icon: Icon }) => {
                  const active = readAloudMode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleModeChange(value)}
                      aria-pressed={active}
                      title={label}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                      <span className="sr-only">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-px w-6 bg-border" aria-hidden="true" />

              {/* Transport */}
              <button
                type="button"
                onClick={handlePlayPause}
                title={status === "speaking" ? "Pause reading" : "Start reading"}
                className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                {status === "speaking" ? (
                  <Pause className="size-4" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Play className="size-4" strokeWidth={1.5} aria-hidden="true" />
                )}
                <span className="sr-only">{status === "speaking" ? "Pause reading" : "Start reading"}</span>
              </button>

              <button
                type="button"
                onClick={stop}
                disabled={status === "idle"}
                title="Stop reading"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Square className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span className="sr-only">Stop reading</span>
              </button>
            </>
          )}
        </div>

        {/* Live region so screen-reader users hear status + hints */}
        <p aria-live="polite" className="sr-only">
          {status === "speaking" ? "Reading aloud" : status === "paused" ? "Reading paused" : "Reading stopped"}
        </p>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              role="status"
              className="absolute top-1/2 right-full mr-3 w-48 -translate-y-1/2 rounded-xl border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-soft-lg"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.aside>
    </AnimatePresence>
  );
}
