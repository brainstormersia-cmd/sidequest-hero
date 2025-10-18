import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-600 text-text-inverted hover:bg-primary-700",
        primary: "border-transparent bg-primary-600 text-text-inverted hover:bg-primary-700",
        secondary: "border-transparent bg-secondary-600 text-text-inverted hover:bg-secondary-700",
        accent: "border-transparent bg-accent-500 text-text-inverted hover:bg-accent-600",
        success: "border-transparent bg-success-500 text-success-foreground hover:bg-success-600",
        warning: "border-transparent bg-warning-500 text-warning-foreground hover:bg-warning-600",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        info: "border-transparent bg-info-500 text-info-foreground hover:bg-info-600",
        outline: "border-border-interactive text-text-primary hover:bg-state-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
