"use client";

import { ChevronDown, X } from "lucide-react";
import {
  POSTED_OPTIONS,
  isAnyExp,
  rangeLabel,
  type Filters,
  type Sort,
} from "./jobs-utils";

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill border border-border-default bg-surface-card py-1 pl-3 pr-1.5 text-xs font-medium text-text-primary">
      {label}
      <button
        type="button"
        aria-label={`Remove filter ${label}`}
        onClick={onRemove}
        className="grid h-4 w-4 place-items-center rounded-pill text-text-muted hover:bg-surface-muted hover:text-text-primary"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function ActiveFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.search.trim())
    chips.push({ key: "q", label: `“${filters.search.trim()}”`, remove: () => onChange({ search: "" }) });
  filters.locations.forEach((l) =>
    chips.push({
      key: `l-${l}`,
      label: l,
      remove: () => onChange({ locations: filters.locations.filter((x) => x !== l) }),
    }),
  );
  if (!isAnyExp(filters.experience))
    chips.push({ key: "e", label: rangeLabel(filters.experience), remove: () => onChange({ experience: [0, 15] }) });
  if (filters.posted !== "any")
    chips.push({
      key: "p",
      label: POSTED_OPTIONS.find((o) => o.value === filters.posted)!.label,
      remove: () => onChange({ posted: "any" }),
    });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Chip key={c.key} label={c.label} onRemove={c.remove} />
      ))}
      <button type="button" onClick={onClear} className="px-1 text-xs font-medium text-brand hover:underline">
        Clear all
      </button>
    </div>
  );
}

export function SortSelect({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  return (
    <label className="relative inline-flex items-center text-sm text-text-secondary">
      <span className="mr-2 hidden sm:inline">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Sort)}
        className="appearance-none rounded-control border border-border-default bg-surface-card py-1.5 pl-3 pr-8 text-sm font-medium text-text-primary outline-none focus:border-brand-accent focus:ring-4 focus:ring-focus-ring"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 h-4 w-4 text-text-muted" />
    </label>
  );
}
