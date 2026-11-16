import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-control transition-colors duration-normal ease-standard outline-none disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-text-inverse hover:bg-brand-hover shadow-subtle focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-brand active:scale-[0.99]",
        secondary:
          "border border-border-default bg-surface-card text-text-primary hover:border-border-strong hover:bg-surface-subtle shadow-subtle focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-[0.99]",
        outline:
          "border border-border-default bg-transparent text-text-primary hover:border-border-strong hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-[0.99]",
        ghost:
          "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-focus-ring",
        soft:
          "bg-brand-soft text-brand hover:bg-brand-soft-hover focus-visible:ring-2 focus-visible:ring-focus-ring",
        danger:
          "bg-status-error text-white hover:bg-red-700 shadow-subtle focus-visible:ring-2 focus-visible:ring-status-error/30 active:scale-[0.99]",
      },
      size: {
        xs: "h-7 px-2.5 text-2xs gap-1.5",
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-9 px-4 py-2 text-xs sm:text-sm gap-2",
        lg: "h-11 px-5 py-2.5 text-sm gap-2.5",
        icon: "h-8 w-8 p-0 justify-center",
        "icon-sm": "h-7 w-7 p-0 justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

export type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
  {
    variant,
    size,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    children,
    ...props
  },
  ref
) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <Loader2 className="animate-spin shrink-0 size-3.5" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </>
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, ...linkProps } = props as ButtonAsLink;
    if (isDisabled) {
      return (
        <span
          aria-disabled="true"
          className={cn(classes, "pointer-events-none opacity-50")}
        >
          {content}
        </span>
      );
    }
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButton;
  return (
    <button
      type={type}
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={isDisabled}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";
