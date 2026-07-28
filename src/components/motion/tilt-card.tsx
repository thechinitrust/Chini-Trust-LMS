"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

type DivPropsWithoutMotionConflicts = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface TiltCardProps extends DivPropsWithoutMotionConflicts {
  children: React.ReactNode;
}

const tiltVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
};

const spotlightVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

export function TiltCard({ children, className, ...props }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll Entrance/Exit Animation
  // "0 1" means when the top of the element hits the bottom of the viewport (start of entry)
  // "1 0" means when the bottom of the element hits the top of the viewport (end of exit)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1 0"],
  });

  // Starts slightly smaller and transparent, scales to 1 in the middle, shrinks when leaving
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scaleScroll = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.85, 1, 1, 0.85]);
  const yScroll = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [50, 0, 0, -50]);

  // Tilt Hover Animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  // Cursor-reactive spotlight — reuses the same pointer position already
  // tracked for the tilt, so it's a free addition rather than a second
  // mousemove listener.
  const spotlightX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const spotlightY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
  const spotlightBackground = useMotionTemplate`radial-gradient(480px circle at ${spotlightX} ${spotlightY}, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale: scaleScroll, y: yScroll, perspective: 1000 }}
      className={cn("w-full h-full relative", className)}
      {...props}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial="rest"
        whileHover="hover"
        variants={tiltVariants}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full h-full"
      >
        {children}
        {/* Spotlight glow — sits above the card content, clipped to its
            rounded corners, and fades in only on hover. */}
        <motion.div
          aria-hidden="true"
          variants={spotlightVariants}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: spotlightBackground }}
          className="pointer-events-none absolute inset-0 z-20 rounded-[20px] overflow-hidden"
        />
      </motion.div>
    </motion.div>
  );
}
