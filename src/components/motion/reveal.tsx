"use client";

import * as React from "react";
import { motion, type Variants, type Transition, type TargetAndTransition } from "framer-motion";

type Bezier = [number, number, number, number];

/** Shared easing curves — deliberately varied so motion across the app
 *  doesn't read as the same tween repeated on every element. */
export const EASE_OUT: Bezier = [0.16, 1, 0.3, 1]; // "buttery" — the default, gentle deceleration
export const EASE_SWIFT: Bezier = [0.22, 1, 0.36, 1]; // snappier deceleration, for smaller UI moments
export const EASE_ELASTIC: Bezier = [0.34, 1.56, 0.64, 1]; // slight overshoot — tactile, "settles into place"
export const EASE_SILK: Bezier = [0.65, 0, 0.35, 1]; // symmetric — reads identical forward and in reverse

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type RevealVariant = "up" | "scale" | "blur";

const VARIANT_MOTION: Record<RevealVariant, { hidden: TargetAndTransition; ease: Bezier }> = {
  up: { hidden: { opacity: 0, y: 24 }, ease: EASE_OUT },
  scale: { hidden: { opacity: 0, scale: 0.92, y: 12 }, ease: EASE_ELASTIC },
  blur: { hidden: { opacity: 0, y: 14, filter: "blur(10px)" }, ease: EASE_SILK },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  /** Entrance treatment — vary this across sections for a bespoke feel. */
  variant?: RevealVariant;
  /** Forwarded to the wrapper — used for focus-mode data attributes. */
  [dataAttr: `data-${string}`]: unknown;
}

/** Fades content into place as it enters the viewport. Re-triggers in both
 *  scroll directions by default (`once: false`) so the motion feels alive
 *  rather than a one-shot mount animation. */
export function Reveal({
  children,
  className,
  delay = 0,
  duration,
  y,
  once = false,
  variant = "up",
  ...rest
}: RevealProps) {
  const motionConfig = VARIANT_MOTION[variant];
  const hidden: TargetAndTransition = y !== undefined ? { ...motionConfig.hidden, y } : motionConfig.hidden;
  const visible: TargetAndTransition =
    variant === "blur"
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : variant === "scale"
        ? { opacity: 1, scale: 1, y: 0 }
        : { opacity: 1, y: 0 };
  const transition: Transition = {
    duration: duration ?? (variant === "scale" ? 0.7 : 0.8),
    delay,
    ease: motionConfig.ease,
  };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once, margin: "-80px" }}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

/** Stagger container — pair with <RevealItem> children. */
export function RevealGroup({ children, className, stagger = 0.08, delay = 0, once = false }: RevealGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 20,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  variant?: RevealVariant;
}) {
  const motionConfig = VARIANT_MOTION[variant];
  const hidden: TargetAndTransition = { ...motionConfig.hidden, y };
  const visible: TargetAndTransition =
    variant === "blur"
      ? { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: motionConfig.ease } }
      : variant === "scale"
        ? { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: motionConfig.ease } }
        : { opacity: 1, y: 0, transition: { duration: 0.7, ease: motionConfig.ease } };

  return (
    <motion.div
      className={className}
      variants={{
        hidden,
        visible,
      }}
    >
      {children}
    </motion.div>
  );
}
