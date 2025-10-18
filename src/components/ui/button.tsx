import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-normal ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Iris Violet (WCAG AA compliant)
        default: "bg-primary-600 text-text-inverted hover:bg-primary-700 active:bg-primary-800 shadow-sm",
        primary: "bg-primary-600 text-text-inverted hover:bg-primary-700 active:bg-primary-800 shadow-sm",
        
        // Secondary: Cyan
        secondary: "bg-secondary-600 text-text-inverted hover:bg-secondary-700 active:bg-secondary shadow-sm",
        
        // Accent: Electric Lime
        accent: "bg-accent-500 text-text-inverted hover:bg-accent-600 active:bg-accent shadow-sm",
        
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive shadow-sm",
        
        // Success
        success: "bg-success-500 text-success-foreground hover:bg-success-600 active:bg-success shadow-sm",
        
        // Outline (transparent with border)
        outline: "border-2 border-border-interactive bg-transparent text-text-primary hover:bg-state-hover active:bg-state-selected",
        
        // Ghost (no background until hover)
        ghost: "text-text-primary hover:bg-state-hover active:bg-state-selected",
        
        // Link
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
      },
      size: {
        sm: "h-9 px-3 text-sm min-w-[88px]",      // Touch target ≥24px
        default: "h-11 px-4 text-base min-w-[120px]", // Touch target 44px (iOS HIG)
        lg: "h-[52px] px-6 text-lg min-w-[140px]",    // Larger touch target
        icon: "h-11 w-11",                            // Square touch target 44px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
