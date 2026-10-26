"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { RangeSlider } from "./RangeSlider";
import {
  EXP_MAX,
  EXP_PRESETS,
  POSTED_OPTIONS,
  rangeLabel,
  type Filters,
  type Range,
} from "./jobs-utils";

export interface LocationOption {
  name: string;
  count: number;
}

/* ---------- building blocks (dark surface) ---------- */

function FilterSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <section className="border-b border-border-subtle py-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-control text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-soft"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          {title}
          {!!badge && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-text-inverse">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="pt-3.5">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ChoiceOption({
  type,
  name,
  checked,
  onChange,
  label,
  count,
}: {
  type: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-control px-1.5 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-soft ${
          type === "radio" ? "rounded-full" : "rounded-control"
        } ${checked ? "border-brand bg-brand" : "border-border-default group-hover:border-border-strong"}`}
      >
        {checked &&
          (type === "radio" ? (
            <span className="h-1.5 w-1.5 rounded-full bg-surface-base" />
          ) : (
            <Check className="h-3 w-3 text-text-inverse" strokeWidth={3.5} />
          ))}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-text-muted">{count}</span>}
    </label>
  );
}

function TitleSearch({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return options.filter((o) => o.toLowerCase().includes(q) && o.toLowerCase() !== q).slice(0, 6);
  }, [options, value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setHi(-1);
  };
  const showList = open && matches.length > 0;

  return (
    <div ref={wrap} className="relative">
      <div className="flex items-center gap-2 rounded-control border border-border-default bg-surface-subtle px-3 transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft">
        <Search aria-hidden className="h-4 w-4 shrink-0 text-text-muted" />
        <input
          type="text"
          role="combobox"
          aria-label="Job title"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          placeholder="Search job titles"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHi(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setHi((h) => Math.min(h + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && hi >= 0 && matches[hi]) {
              e.preventDefault();
              pick(matches[hi]);
            } else if (e.key === "Escape") setOpen(false);
          }}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear job title"
            onClick={() => pick("")}
            className="grid h-5 w-5 place-items-center rounded-full text-text-muted hover:bg-surface-subtle hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showList && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-60 overflow-auto rounded-card border border-border-subtle bg-surface-card p-1 shadow-card"
        >
          {matches.map((m, i) => (
            <li
              key={m}
              role="option"
              aria-selected={i === hi}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(m)}
              onMouseEnter={() => setHi(i)}
              className={`cursor-pointer rounded-control px-3 py-2 text-sm text-text-secondary ${i === hi ? "bg-surface-subtle" : ""}`}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Bars show how many jobs fit each year of experience; bars inside the selected range light up. */
function Histogram({ bins, range }: { bins: number[]; range: Range }) {
  const max = Math.max(1, ...bins);
  const n = bins.length - 1;
  return (
    <div className="relative mx-2 mb-1 h-14" aria-hidden>
      {bins.map((count, i) => {
        const inside = i >= range[0] && i <= range[1];
        return (
          <span
            key={i}
            title={`${i}${i === EXP_MAX ? "+" : ""} yrs: ${count} ${count === 1 ? "job" : "jobs"}`}
            className={`absolute bottom-0 rounded-t-[3px] transition-colors duration-150 ${
              inside ? "bg-brand" : "bg-border-default"
            }`}
            style={{
              left: `${(i / n) * 100}%`,
              width: `calc(${100 / n}% - 3px)`,
              height: `${count === 0 ? 3 : Math.max(10, (count / max) * 100)}%`,
              transform: "translateX(-50%)",
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------- panel ---------- */

export function FilterPanel({
  filters,
  onChange,
  titles,
  locations,
  histogram,
  activeCount,
  onClear,
  onClose,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  titles: string[];
  locations: LocationOption[];
  histogram: number[];
  activeCount: number;
  onClear: () => void;
  onClose?: () => void;
}) {
  const [locQuery, setLocQuery] = useState("");
  const [showAllLoc, setShowAllLoc] = useState(false);

  const visibleLocs = useMemo(() => {
    const q = locQuery.trim().toLowerCase();
    const list = q ? locations.filter((l) => l.name.toLowerCase().includes(q)) : locations;
    return showAllLoc || q ? list : list.slice(0, 6);
  }, [locations, locQuery, showAllLoc]);

  const toggleLoc = (name: string) =>
    onChange({
      locations: filters.locations.includes(name)
        ? filters.locations.filter((l) => l !== name)
        : [...filters.locations, name],
    });

  const [lo, hi] = filters.experience;

  return (
    <div className="px-6 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">Filters</h2>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-control px-2 py-1 text-sm font-medium text-brand hover:bg-surface-subtle"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              type="button"
              aria-label="Close filters"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-control text-text-muted hover:bg-surface-subtle hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5">
        <TitleSearch value={filters.search} onChange={(v) => onChange({ search: v })} options={titles} />
      </div>

      <div className="mt-3">
        <FilterSection title="Experience" badge={lo === 0 && hi === EXP_MAX ? 0 : 1}>
          <Histogram bins={histogram} range={filters.experience} />
          <RangeSlider min={0} max={EXP_MAX} value={filters.experience} onChange={(r) => onChange({ experience: r })} />
          <div className="mt-2.5 flex items-baseline justify-between text-xs tabular-nums text-text-muted">
            <span>0</span>
            <span className="text-sm font-semibold text-text-primary">{rangeLabel(filters.experience)}</span>
            <span>{EXP_MAX}+</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {EXP_PRESETS.map((p) => {
              const on = lo === p.range[0] && hi === p.range[1];
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ experience: p.range })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    on
                      ? "border-brand bg-brand text-text-inverse"
                      : "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Location" badge={filters.locations.length}>
          {locations.length > 8 && (
            <input
              type="text"
              aria-label="Search locations"
              placeholder="Search locations"
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              className="mb-2 w-full rounded-control border border-border-default bg-surface-subtle px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand"
            />
          )}
          <div className="flex flex-col">
            {visibleLocs.map((l) => (
              <ChoiceOption
                key={l.name}
                type="checkbox"
                checked={filters.locations.includes(l.name)}
                onChange={() => toggleLoc(l.name)}
                label={l.name}
                count={l.count}
              />
            ))}
            {visibleLocs.length === 0 && <p className="px-1.5 py-1.5 text-sm text-text-muted">No locations found</p>}
          </div>
          {!locQuery && locations.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllLoc((s) => !s)}
              className="mt-1.5 px-1.5 text-sm font-medium text-brand hover:underline"
            >
              {showAllLoc ? "Show less" : `Show all ${locations.length}`}
            </button>
          )}
        </FilterSection>

        <FilterSection title="Date posted" badge={filters.posted === "any" ? 0 : 1}>
          <div className="flex flex-col">
            {POSTED_OPTIONS.map((o) => (
              <ChoiceOption
                key={o.value}
                type="radio"
                name="posted"
                checked={filters.posted === o.value}
                onChange={() => onChange({ posted: o.value })}
                label={o.label}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}