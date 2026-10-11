"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Focus, X } from "lucide-react";

import { useAccessibility } from "@/context/accessibility-context";

/**
 * Formerly rendered a floating exit pill when the Navbar was hidden.
 * Now that the Navbar remains persistent with an integrated Focus Mode toggle,
 * this component returns null. Retained for backwards compatibility.
 */
export function FocusModeBar() {
  return null;
}
