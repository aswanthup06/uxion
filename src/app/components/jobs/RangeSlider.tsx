"use client";

import type { Range } from "./jobs-utils";

const thumb =
  "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent outline-none " +
  "[&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0FA968] [&::-webkit-slider-thumb]:bg-white " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-[#0FA968]/25 " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid " +
  "[&::-moz-range-thumb]:border-[#0FA968] [&::-moz-range-thumb]:bg-white";

/** Dual-handle slider. The track is inset 8px so it lines up with thumb centers (thumbs are 16px wide). */
export function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: Range;
  onChange: (r: Range) => void;
}) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="relative h-5">
      <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E3E8E4]">
        <div
          className="absolute inset-y-0 bg-[#0FA968]"
          style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
        />
      </div>
      <input
        type="range"
        aria-label="Minimum experience in years"
        min={min}
        max={max}
        step={1}
        value={lo}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        className={`${thumb} ${lo > (min + max) / 2 ? "z-20" : "z-10"}`}
      />
      <input
        type="range"
        aria-label="Maximum experience in years"
        min={min}
        max={max}
        step={1}
        value={hi}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        className={`${thumb} z-10`}
      />
    </div>
  );
}
