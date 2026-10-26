
"use client";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-4">
        {/* Emerald loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 animate-bounce rounded-full bg-brand"
              style={{
                animationDelay: `${dot * 150}ms`,
                animationDuration: "700ms",
              }}
            />
          ))}
        </div>

        <p className="text-sm font-medium tracking-wide text-text-muted">
          Loading jobs
        </p>
      </div>
    </div>
  );
}
