export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-2xs font-mono uppercase tracking-[0.18em] text-brand-accent mb-3">
      {children}
    </p>
  );
}
