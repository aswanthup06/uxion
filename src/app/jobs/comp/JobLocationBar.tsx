"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, RotateCcw, Search, X } from "lucide-react";
import { resolveLocationAliases } from "@/lib/supabase/locations-data";
import { POPULAR_LOCATIONS } from "./jobs-client-utils";

interface LocationOption {
  name: string;
  state?: string;
  count: number;
}

interface JobLocationBarProps {
  search: string;
  setSearch: (search: string) => void;
  location: string;
  setLocation: (location: string) => void;
  availableLocations: LocationOption[];
}

export function JobLocationBar({
  search,
  setSearch,
  location,
  setLocation,
  availableLocations,
}: JobLocationBarProps) {
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const locDropdownRef = useRef<HTMLDivElement>(null);
  const locInputRef = useRef<HTMLInputElement>(null);

  // Close location dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locDropdownRef.current &&
        !locDropdownRef.current.contains(event.target as Node)
      ) {
        setLocDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocationSuggestions = useMemo(() => {
    const q = location.trim().toLowerCase();
    if (!q) {
      const popularSet = new Set(POPULAR_LOCATIONS.map((p) => p.toLowerCase()));
      const populars = POPULAR_LOCATIONS.map((p) =>
        availableLocations.find((a) => a.name.toLowerCase() === p.toLowerCase())
      ).filter((x): x is LocationOption => Boolean(x));

      const othersWithJobs = availableLocations
        .filter((a) => !popularSet.has(a.name.toLowerCase()) && a.count > 0)
        .sort((a, b) => b.count - a.count);

      return [...populars, ...othersWithJobs];
    }

    const aliases = resolveLocationAliases(q);
    const matches = availableLocations.filter((item) => {
      const nameLower = item.name.toLowerCase();
      if (nameLower.includes(q)) return true;
      if (item.state && item.state.toLowerCase().includes(q)) return true;
      return aliases.some((a) => nameLower.includes(a));
    });

    return matches.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
  }, [availableLocations, location]);

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!locDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setLocDropdownOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredLocationSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredLocationSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredLocationSuggestions.length
      ) {
        setLocation(filteredLocationSuggestions[highlightedIndex].name);
      }
      setLocDropdownOpen(false);
    } else if (e.key === "Escape") {
      setLocDropdownOpen(false);
    }
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mt-4 grid grid-cols-1 rounded-control border border-border-default bg-surface-card transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-focus-ring sm:grid-cols-2">
        <label className="flex items-center gap-3 px-4 py-3.5">
          <Search className="h-[18px] w-[18px] shrink-0 text-brand" strokeWidth={1.75} />
          <span className="sr-only">Search job title, skill or company</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, skill or company"
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </label>

        {/* Location Search Input with Custom Dropdown Popover */}
        <div ref={locDropdownRef} className="relative border-t border-border-default sm:border-l sm:border-t-0">
          <div className="flex h-full items-center gap-3 px-4 py-3.5">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-brand" strokeWidth={1.75} />
            <span className="sr-only">Location</span>
            <input
              ref={locInputRef}
              role="combobox"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setLocDropdownOpen(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setLocDropdownOpen(true)}
              onKeyDown={handleLocationKeyDown}
              placeholder="City, state, or region"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              aria-expanded={locDropdownOpen}
              aria-controls="location-listbox"
              aria-autocomplete="list"
            />
            {location && (
              <button
                type="button"
                onClick={() => {
                  setLocation("");
                  setLocDropdownOpen(false);
                  locInputRef.current?.focus();
                }}
                aria-label="Clear location"
                className="cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>

          {/* Custom Popover Dropdown */}
          {locDropdownOpen && (
            <div
              id="location-listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-control border border-border-default bg-surface-card shadow-modal ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100"
              role="listbox"
            >
              <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle/50 px-3.5 py-2 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                <span>Suggested Locations</span>
                <span className="font-normal normal-case tracking-normal text-text-muted">
                  {filteredLocationSuggestions.length} found
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]">
                {location.trim() &&
                  !filteredLocationSuggestions.some(
                    (s) => s.name.toLowerCase() === location.trim().toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocDropdownOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-control px-3 py-2 text-left text-sm text-brand transition-colors hover:bg-brand-soft/70"
                    >
                      <div className="flex items-center gap-2.5">
                        <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        <span className="font-medium">Filter by &ldquo;{location.trim()}&rdquo;</span>
                      </div>
                      <span className="text-xs text-brand/80">Custom</span>
                    </button>
                  )}

                {filteredLocationSuggestions.length === 0 && !location.trim() && (
                  <div className="px-3 py-4 text-center text-xs text-text-muted">
                    No matching locations
                  </div>
                )}

                {filteredLocationSuggestions.map((item, idx) => {
                  const isSelected =
                    location.trim().toLowerCase() === item.name.toLowerCase();
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => {
                        setLocation(item.name);
                        setLocDropdownOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-control px-3 py-2 text-left text-sm transition-colors duration-150 ${
                        isSelected
                          ? "bg-brand-soft font-semibold text-brand"
                          : isHighlighted
                          ? "bg-surface-subtle text-text-primary"
                          : "text-text-primary hover:bg-surface-subtle"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin
                          className={`h-4 w-4 shrink-0 ${
                            isSelected ? "text-brand" : "text-text-muted"
                          }`}
                          strokeWidth={1.75}
                        />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-brand" strokeWidth={2.2} />
                        )}
                        <span
                          className={`rounded-control px-2 py-0.5 text-xs font-semibold tabular-nums ${
                            item.count > 0
                              ? isSelected
                                ? "bg-brand/15 text-brand"
                                : "bg-surface-muted text-text-secondary"
                              : "text-text-muted font-normal"
                          }`}
                        >
                          {item.count} {item.count === 1 ? "role" : "roles"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {location && (
                <div className="border-t border-border-subtle bg-surface-subtle/30 p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("");
                      setLocDropdownOpen(false);
                      locInputRef.current?.focus();
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-control py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
                  >
                    <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
                    <span>Clear location</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Location Filter Pills */}
      <div className="mt-3 hidden sm:flex max-w-full min-w-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-1 text-xs no-scrollbar">
        <span className="mr-1 shrink-0 font-medium text-text-muted">Quick location:</span>
        {POPULAR_LOCATIONS.map((loc) => {
          const isActive = location.toLowerCase() === loc.toLowerCase();
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(isActive ? "" : loc)}
              className={`inline-flex shrink-0 cursor-pointer items-center rounded-control px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-brand text-text-inverse font-semibold shadow-subtle"
                  : "border border-border-default text-text-secondary hover:border-brand/40 hover:text-text-primary"
              }`}
            >
              <span>{loc}</span>
            </button>
          );
        })}
        {location && (
          <button
            type="button"
            onClick={() => setLocation("")}
            className="ml-2 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            <span>Reset</span>
            <X size={12} />
          </button>
        )}
      </div>
    </>
  );
}
