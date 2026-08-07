import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card tones + elevation tiers. Grids of cards should mix `default` with
 * `subtle`/`brand` so they read as distinct surfaces rather than one flat wall
 * of white. `interactive` adds the hover lift used by clickable cards.
 */
const cardVariants = cva("rounded-[20px] border text-card-foreground transition-all duration-500 ease-out", {
  variants: {
    tone: {
      default: "border-border/60 bg-card glass-card",
      subtle: "border-border/50 bg-card-subtle",
      brand: "border-primary/20 bg-card-brand",
      accent: "border-accent/20 bg-card-accent",
      outline: "border-border/60 bg-transparent",
    },
    elevation: {
      flat: "shadow-none",
      soft: "shadow-soft",
      lifted: "shadow-soft-lg",
    },
    interactive: {
      true: "hover:-translate-y-1.5 hover:scale-[1.01] hover:border-primary/40 hover:shadow-brand-hover cursor-pointer",
      false: "",
    },
  },
  compoundVariants: [
    {
      tone: "accent",
      interactive: true,
      className: "hover:border-accent/45 hover:shadow-accent-hover",
    },
  ],
  defaultVariants: {
    tone: "default",
    elevation: "soft",
    interactive: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone, elevation, interactive, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ tone, elevation, interactive }), className)} {...props} />
  )
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Renders the header as its own banner separated by a rule. The content below
   * then keeps its full top padding instead of flowing up into the header.
   */
  divided?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divided, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      data-divided={divided ? "true" : undefined}
      className={cn("flex flex-col gap-1.5 p-6 sm:p-7", divided && "border-b border-border/50", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-tight tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

/**
 * Padding is symmetric by default so a content block sits centred in its own
 * section. Top padding collapses only when it flows directly out of an
 * undivided header -- a `divided` header is a separate banner, so the content
 * below keeps its own padding. Expressed as a sibling variant so a call-site
 * `p-*` override can't strip the `pt-0` at one breakpoint and keep it at another.
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("p-6 sm:p-7 [[data-slot=card-header]:not([data-divided])+&]:pt-0", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "flex items-center p-6 sm:p-7 [[data-slot=card-header]:not([data-divided])+&]:pt-0 [[data-slot=card-content]+&]:pt-0",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
