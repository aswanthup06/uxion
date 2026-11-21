"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  RotateCcw,
  Unlock,
  X,
} from "lucide-react";
import { categories, types, experiences } from "./jobs-client-utils";

interface JobFilterSidebarProps {
  filtersOpen: boolean;
  onCloseFilters: () => void;
  unlockedOnly: boolean;
  setUnlockedOnly: (unlocked: boolean) => void;
  totalJobsCount: number;
  unlockedCount: number;
  type: string;
  setType: (type: string) => void;
  category: string;
  setCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  experience: string;
  setExperience: (exp: string) => void;
  salaryFloor: string;
  setSalaryFloor: (floor: string) => void;
  hasActiveCriteria: boolean;
  activeFilters: number;
  clearFilters: () => void;
}

const navCls = (active: boolean) =>
  `flex w-full cursor-pointer items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-brand-soft text-brand font-semibold"
      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
  }`;

const selectCls =
  "mt-2 block w-full cursor-pointer appearance-none rounded-control border border-border-default bg-surface-card px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors duration-200 hover:border-border-strong focus:border-brand focus:ring-1 focus:ring-brand";

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center rounded-control px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
        active
          ? "bg-brand text-text-inverse font-semibold shadow-subtle"
          : "border border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function JobFilterSidebar({
  filtersOpen,
  onCloseFilters,
  unlockedOnly,
  setUnlockedOnly,
  totalJobsCount,
  unlockedCount,
  type,
  setType,
  category,
  setCategory,
  categoryCounts,
  experience,
  setExperience,
  salaryFloor,
  setSalaryFloor,
  hasActiveCriteria,
  activeFilters,
  clearFilters,
}: JobFilterSidebarProps) {
  return (
    <aside
      className={`${
        filtersOpen ? "flex" : "hidden"
      } flex-col gap-7 border-b border-border-default bg-surface-card p-5 lg:flex lg:sticky lg:top-[var(--spacing-nav-height)] lg:self-start lg:h-[calc(100vh-var(--spacing-nav-height))] lg:w-[272px] lg:shrink-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain [transform:translateZ(0)] will-change-transform lg:border-b-0 lg:border-r lg:p-6 lg:pb-8 [&>*]:shrink-0`}
    >
      <div className="flex items-center justify-between lg:hidden">
        <span className="text-sm font-semibold text-text-primary">Filters</span>
        <button
          type="button"
          onClick={onCloseFilters}
          aria-label="Close filters"
          className="rounded-control p-1.5 text-text-muted hover:bg-surface-subtle"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <nav className="space-y-1" aria-label="Job views">
        <button
          type="button"
          onClick={() => {
            setUnlockedOnly(false);
            onCloseFilters();
          }}
          className={navCls(!unlockedOnly)}
        >
          <BriefcaseBusiness className="h-4 w-4" strokeWidth={1.75} /> All jobs{" "}
          <span className="ml-auto text-xs opacity-60">{totalJobsCount}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setUnlockedOnly(true);
            onCloseFilters();
          }}
          className={navCls(unlockedOnly)}
        >
          <Unlock className="h-4 w-4" strokeWidth={1.75} /> Unlocked{" "}
          <span className="ml-auto text-xs opacity-60">{unlockedCount}</span>
        </button>
      </nav>

      <div className="space-y-6 border-t border-border-subtle pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Job type
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {types.map((t) => (
              <Chip
                key={t}
                active={type === t}
                onClick={() => setType(type === t ? "All job types" : t)}
              >
                {t}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Category
          </p>
          <ul className="mt-2 space-y-1">
            {/* Pre-selected "All" option */}
            <li>
              <button
                type="button"
                onClick={() => setCategory("All categories")}
                className={`flex w-full cursor-pointer items-center justify-between py-1 text-left text-sm transition-colors ${
                  category === "All categories"
                    ? "font-semibold text-brand"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>All</span>
                <span
                  className={`text-xs ${
                    category === "All categories"
                      ? "font-semibold text-brand"
                      : "text-text-muted"
                  }`}
                >
                  {totalJobsCount}
                </span>
              </button>
            </li>

            {/* Only show categories with > 0 jobs */}
            {categories.map((c) => {
              const count = categoryCounts[c] ?? 0;
              if (count === 0) return null;
              const active = category === c;

              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setCategory(active ? "All categories" : c)}
                    className={`flex w-full cursor-pointer items-center justify-between py-1 text-left text-sm transition-colors ${
                      active
                        ? "font-semibold text-brand"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="truncate pr-2">{c}</span>
                    <span
                      className={`text-xs shrink-0 ${
                        active ? "font-semibold text-brand" : "text-text-muted"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Experience
          <div className="relative">
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={`${selectCls} font-normal normal-case tracking-normal`}
            >
              {experiences.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-text-muted" />
          </div>
        </label>

        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Min. monthly salary
          <div className="relative">
            <select
              value={salaryFloor}
              onChange={(e) => setSalaryFloor(e.target.value)}
              className={`${selectCls} font-normal normal-case tracking-normal`}
            >
              <option value="0">Any salary</option>
              <option value="15000">₹15,000+ / mo (≈ 2 LPA)</option>
              <option value="25000">₹25,000+ / mo (≈ 3 LPA)</option>
              <option value="50000">₹50,000+ / mo (≈ 6 LPA)</option>
              <option value="83333">₹83,000+ / mo (≈ 10 LPA)</option>
              <option value="125000">₹1.25L+ / mo (≈ 15 LPA)</option>
              <option value="166666">₹1.66L+ / mo (≈ 20 LPA)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-text-muted" />
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        disabled={!hasActiveCriteria}
        className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:border-border-strong hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-muted disabled:text-text-muted"
      >
        <RotateCcw className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>Reset filters</span>
        {activeFilters > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-surface-muted px-1.5 text-2xs font-semibold tabular-nums text-text-secondary">
            {activeFilters}
          </span>
        )}
      </button>
    </aside>
  );
}
