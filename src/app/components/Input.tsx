import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "w-full rounded-control border bg-surface-card text-text-primary placeholder:text-text-muted transition-colors duration-normal ease-standard outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-border-default hover:border-border-strong focus:border-brand focus-visible:ring-2 focus-visible:ring-focus-ring",
        subtle:
          "border-border-subtle bg-surface-subtle hover:border-border-default hover:bg-surface-base focus:border-brand focus-visible:ring-2 focus-visible:ring-focus-ring",
        error:
          "border-status-error text-text-primary focus:border-status-error focus-visible:ring-2 focus-visible:ring-status-error/20",
      },
      inputSize: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      className,
      variant,
      inputSize,
      error,
      leftIcon,
      rightIcon,
      disabled,
      type = "text",
      ...props
    },
    ref
  ) {
    const computedVariant = error ? "error" : variant;

    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex w-full items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              inputVariants({ variant: computedVariant, inputSize }),
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          inputVariants({ variant: computedVariant, inputSize }),
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
