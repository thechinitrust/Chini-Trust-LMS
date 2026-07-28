import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-400 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-[1.125rem] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-glow-brand active:scale-[0.98] active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:scale-[1.02] hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-border/80 bg-background/70 backdrop-blur-md hover:scale-[1.02] hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/60 active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:scale-[1.02] hover:bg-secondary/70 active:scale-[0.98]",
        accent:
          "bg-accent text-accent-foreground shadow-soft hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-glow-accent active:scale-[0.98] active:translate-y-0",
        ghost: "hover:bg-muted/70 hover:text-foreground active:scale-[0.98]",
        link: "text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
