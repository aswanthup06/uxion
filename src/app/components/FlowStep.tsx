type FlowStepProps = {
  step: string; // "01", "02"...
  title: string;
  copy: string;
};

// Only use numbering like this when the content is a real, ordered
// sequence (a process, a flow). Don't reach for it as decoration.
export function FlowStep({ step, title, copy }: FlowStepProps) {
  return (
    <div className="relative bg-surface-base">
      <div className="relative z-10 w-16 h-16 rounded-full bg-surface-card border border-border-default flex items-center justify-center mb-5">
        <span className="font-sans font-semibold text-brand-accent">{step}</span>
      </div>
      <h3 className="font-sans font-semibold text-lg text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{copy}</p>
    </div>
  );
}
