"use client";

import { useEffect, useId, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { X } from "lucide-react";

export type ModalMaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  maxWidth?: ModalMaxWidth;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  variant?: "centered" | "sheet" | "auto";
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  labelledBy?: string;
  describedBy?: string;
}

const maxWidthMap: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  full: "max-w-5xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  variant = "auto",
  className = "",
  bodyClassName = "",
  headerClassName = "",
  labelledBy,
  describedBy,
}: ModalProps) {
  const autoId = useId();
  const titleId = labelledBy || `modal-title-${autoId}`;
  const descId = describedBy || `modal-desc-${autoId}`;
  const shouldReduceMotion = useReducedMotion();

  // Escape key listener & Body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const isSheet = variant === "sheet";
  const isAuto = variant === "auto";

  // Animation variants
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.15, ease: "easeIn" },
    },
  };

  const modalVariants: Variants = shouldReduceMotion
    ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.1 } },
      exit: { opacity: 0, transition: { duration: 0.08 } },
    }
    : isSheet
      ? {
        hidden: { y: "100%", opacity: 0.6 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: "spring", damping: 30, stiffness: 350 },
        },
        exit: {
          y: "100%",
          opacity: 0,
          transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
        },
      }
      : {
        hidden: { opacity: 0, scale: 0.96, y: isAuto ? 16 : 8 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring", damping: 28, stiffness: 340 },
        },
        exit: {
          opacity: 0,
          scale: 0.97,
          y: isAuto ? 10 : 4,
          transition: { duration: 0.16, ease: [0.36, 0, 0.66, -0.56] },
        },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="presentation"
          className={`fixed inset-0 z-50 flex overflow-y-auto ${isSheet
              ? "items-end justify-center p-0"
              : isAuto
                ? "items-end justify-center p-0 sm:items-center sm:p-4"
                : "items-center justify-center p-4"
            }`}
        >
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
            className="fixed inset-0 bg-text-primary/45 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : labelledBy}
            aria-describedby={description ? descId : describedBy}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 flex w-full flex-col overflow-hidden border border-border-default bg-surface-card shadow-modal focus:outline-none ${maxWidthMap[maxWidth]
              } ${isSheet
                ? "max-h-[90dvh] rounded-t-2xl"
                : isAuto
                  ? "max-h-[calc(100dvh-1.5rem)] rounded-t-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-modal"
                  : "max-h-[calc(100dvh-3rem)] rounded-modal"
              } ${className}`}
          >
            {/* Header (when title is provided) */}
            {title ? (
              <div
                className={`flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle p-5 sm:p-6 ${headerClassName}`}
              >
                <div className="min-w-0 flex-1">
                  <h2
                    id={titleId}
                    className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p
                      id={descId}
                      className="mt-1 text-sm text-text-muted"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="absolute right-4 top-4 z-20 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="h-4 w-4" />
                </button>
              )
            )}

            {/* Modal Body */}
            <div
              className={`min-h-0 flex-1 ${bodyClassName.includes("overflow-") ? "" : "overflow-y-auto"
                } ${bodyClassName}`}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
