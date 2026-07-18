type CursorTagProps = {
  name: string;
  action: string;
  color: string;
  dark?: boolean; // set true when the tag's background is light (e.g. signal green)
  className?: string; // positioning (absolute/top/left etc.) passed by the caller
};

// The signature element: mimics multiplayer presence pills from design
// tools (Figma, Google Docs) repurposed to show real platform activity.
// Feed it live data (last N applications/signups) once available —
// swap the hardcoded arrays wherever this is used for a fetch.
export function CursorTag({ name, action, color, dark, className = "" }: CursorTagProps) {
  return (
    <div
      className={`inline-flex w-max items-center gap-1.5 rounded-pill pl-1.5 pr-3 py-1 text-xs font-medium shadow-panel whitespace-nowrap ${
        dark ? "text-ink" : "text-white"
      } ${className}`}
      style={{ background: color }}
    >
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
          dark ? "bg-black/10" : "bg-white/25"
        }`}
      >
        {name[0]}
      </span>
      {name} {action}
    </div>
  );
}