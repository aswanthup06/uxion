"use client";

import { useEffect } from "react";

export function MobileFilterSheet({
  open,
  onClose,
  resultCount,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className="lg:hidden" aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#111815]/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Job filters"
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-3xl bg-white shadow-2xl transition-[transform,visibility] duration-300 ${
          open ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#D5DBD6]" />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        <div className="shrink-0 border-t border-[#EEF1EE] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#0FA968] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0C9559] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0FA968]/40"
          >
            Show {resultCount} {resultCount === 1 ? "job" : "jobs"}
          </button>
        </div>
      </div>
    </div>
  );
}