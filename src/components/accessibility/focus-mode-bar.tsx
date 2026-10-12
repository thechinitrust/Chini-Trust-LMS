"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Focus, X } from "lucide-react";

import { useAccessibility, isLearningRoute } from "@/context/accessibility-context";
import { Button } from "@/components/ui/button";

export function FocusModeBar() {
  const pathname = usePathname();
  const { focusMode, setFocusMode } = useAccessibility();
  const [mounted, setMounted] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = mounted && focusMode && isLearningRoute(pathname);

  // Briefly reveal the floating exit pill when focus mode is turned on
  React.useEffect(() => {
    if (!isActive) {
      setRevealed(false);
      return;
    }

    setRevealed(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setRevealed(false);
    }, 3800);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isActive]);

  // Reveal when cursor approaches the top edge (clientY <= 65) or Esc is pressed
  React.useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 65) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setRevealed(true);
      } else if (!isHovered && revealed) {
        if (!hideTimerRef.current) {
          hideTimerRef.current = setTimeout(() => {
            setRevealed(false);
            hideTimerRef.current = null;
          }, 1800);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFocusMode(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isActive, isHovered, revealed, setFocusMode]);

  if (!isActive) return null;

  return (
    <>
      {/* Invisible top proximity sensor strip */}
      <div
        className="fixed top-0 left-0 right-0 h-4 z-40 pointer-events-auto"
        onMouseEnter={() => {
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          setRevealed(true);
        }}
        aria-hidden="true"
      />

      <AnimatePresence>
        {revealed && (
          <motion.aside
            initial={{ y: -70, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -70, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onMouseEnter={() => {
              setIsHovered(true);
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              hideTimerRef.current = setTimeout(() => {
                setRevealed(false);
                hideTimerRef.current = null;
              }, 1800);
            }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-primary/30 bg-background/95 px-4 py-2 shadow-2xl backdrop-blur-md ring-2 ring-primary/20"
            role="region"
            aria-label="Focus mode controls"
          >
            <div className="flex items-center gap-2 pr-1">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <Focus className="size-3.5 text-primary-text" strokeWidth={2} />
              <span className="text-xs font-semibold tracking-wide text-foreground">
                Focus Mode Active
              </span>
            </div>

            <span className="h-4 w-px bg-border/80" aria-hidden="true" />

            <Button
              size="sm"
              variant="default"
              onClick={() => setFocusMode(false)}
              className="h-7 gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" strokeWidth={2.5} />
              <span>Exit Focus Mode</span>
              <kbd className="ml-1 rounded bg-primary-foreground/20 px-1 py-0.5 text-[10px] font-mono text-primary-foreground">
                Esc
              </kbd>
            </Button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
