type FlowStepProps = {
  step: string; // "01", "02"...
  title: string;
  copy: string;
};

// Only use numbering like this when the content is a real, ordered
// sequence (a process, a flow). Don't reach for it as decoration.
export function FlowStep({ step, title, copy }: FlowStepProps) {
  return (
    <div className="relative bg-canvas">
      <div className="relative z-10 w-16 h-16 rounded-full bg-white border border-line flex items-center justify-center mb-5">
        <span className="font-display font-semibold text-accent">{step}</span>
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-subtle leading-relaxed">{copy}</p>
    </div>
  );
}
