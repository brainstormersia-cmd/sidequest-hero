import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border-2 border-border-default bg-surface px-3 py-2 text-base text-text-primary",
          "ring-offset-background transition-colors duration-fast",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
          "placeholder:text-text-muted",
          "focus-visible:outline-none focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2",
          "hover:border-border-interactive",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-state-disabled",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
