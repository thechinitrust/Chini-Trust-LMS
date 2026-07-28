"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Focus, X } from "lucide-react";

import { useAccessibility } from "@/context/accessibility-context";

/**
 * Focus mode hides the navbar and footer, so this slim bar is the only way
 * back out — it stays fixed at the top and is the single piece of chrome
 * that survives focus mode.
 */
export function FocusModeBar() {
  const { focusMode, setFocusMode } = useAccessibility();

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 print:hidden"
          data-read-aloud-skip="true"
        >
          <div className="flex items-center gap-3 rounded-full border border-border bg-card/95 py-2 pr-2 pl-4 shadow-soft-lg backdrop-blur-xl">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Focus className="size-3.5 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
              Focus mode
            </span>
            <button
              type="button"
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              <X className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              Exit
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
