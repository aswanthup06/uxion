"use client";

import toast, { Toaster, resolveValue } from "react-hot-toast";
import { CheckCircle2, AlertCircle, Loader2, Info, X } from "lucide-react";

export default function ZenowayToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerClassName="!top-4 !right-4 z-[99999]"
      toastOptions={{
        duration: 3500,
      }}
    >
      {(t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const isLoading = t.type === "loading";

        return (
          <div
            {...t.ariaProps}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-panel border border-border-default bg-surface-card px-3.5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-200 ease-out sm:max-w-md ${
              t.visible
                ? "translate-y-0 opacity-100 scale-100"
                : "-translate-y-2 opacity-0 scale-95 pointer-events-none"
            }`}
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              ...t.style,
            }}
          >
            {/* Status Icon Badge */}
            <div className="shrink-0">
              {isSuccess && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <CheckCircle2 size={16} strokeWidth={2.2} />
                </div>
              )}
              {isError && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-status-error-bg text-status-error">
                  <AlertCircle size={16} strokeWidth={2.2} />
                </div>
              )}
              {isLoading && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Loader2 size={16} strokeWidth={2.2} className="animate-spin" />
                </div>
              )}
              {!isSuccess && !isError && !isLoading && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
                  {t.icon ? (
                    <span className="text-sm">{t.icon}</span>
                  ) : (
                    <Info size={16} strokeWidth={2.2} />
                  )}
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold leading-relaxed text-text-primary">
                {resolveValue(t.message, t)}
              </div>
            </div>

            {/* Dismiss Button */}
            {t.type !== "loading" && (
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 cursor-pointer rounded-control p-1 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus:outline-none"
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      }}
    </Toaster>
  );
}

