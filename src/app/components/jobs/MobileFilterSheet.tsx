"use client";

import type { ReactNode } from "react";
import Modal from "@/app/components/Modal";

export function MobileFilterSheet({
  open,
  onClose,
  resultCount,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  children: ReactNode;
}) {
  return (
    <div className="lg:hidden">
      <Modal
        isOpen={open}
        onClose={onClose}
        variant="sheet"
        showCloseButton={false}
        maxWidth="lg"
        className="max-h-[90dvh]"
        bodyClassName="flex flex-col min-h-0 flex-1 overflow-hidden p-0"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border-strong" />
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        <div className="shrink-0 border-t border-border-subtle p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-control bg-brand py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
          >
            Show {resultCount} {resultCount === 1 ? "job" : "jobs"}
          </button>
        </div>
      </Modal>
    </div>
  );
}