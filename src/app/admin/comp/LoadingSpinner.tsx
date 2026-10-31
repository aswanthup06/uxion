"use client";

type Props = {
  label?: string;
  className?: string;
};

export default function LoadingSpinner({
  label = "Loading...",
  className = "py-16",
}: Props) {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-3 ${className}`}>
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

      {label && (
        <p className="text-xs font-medium tracking-wide text-text-muted">
          {label}
        </p>
      )}
    </div>
  );
}
