"use client";

import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Compass } from "lucide-react";
import { CANONICAL_CITIES, INDIAN_STATES } from "@/lib/supabase/locations-data";
import type { PreferredTarget } from "./types";
import { inputClass } from "./wizard-utils";

export interface CandidateScopeSelectorHandle {
  commit: () => PreferredTarget | null;
}

export interface CandidateScopeSelectorProps {
  onAdd: (target: PreferredTarget) => void;
  placeholder?: string;
}

export const CandidateScopeSelector = forwardRef<
  CandidateScopeSelectorHandle,
  CandidateScopeSelectorProps
>(function CandidateScopeSelector(
  {
    onAdd,
    placeholder = "Search candidate city or state...",
  },
  ref
) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { name: "Karnataka", type: "state" as const },
        { name: "Kerala", type: "state" as const },
        { name: "Maharashtra", type: "state" as const },
        { name: "Tamil Nadu", type: "state" as const },
        { name: "Telangana", type: "state" as const },
        { name: "Bengaluru", type: "city" as const, state: "Karnataka" },
        { name: "Kochi", type: "city" as const, state: "Kerala" },
        { name: "Mumbai", type: "city" as const, state: "Maharashtra" },
        { name: "Hyderabad", type: "city" as const, state: "Telangana" },
      ];
    }

    const items: PreferredTarget[] = [];
    const seen = new Set<string>();

    for (const s of INDIAN_STATES) {
      if (s.name.toLowerCase().includes(q)) {
        seen.add(s.name.toLowerCase());
        items.push({ name: s.name, type: "state" });
      }
    }

    for (const c of CANONICAL_CITIES) {
      if (
        c.name.toLowerCase().includes(q) ||
        c.aliases?.some((a) => a.toLowerCase().includes(q))
      ) {
        seen.add(c.name.toLowerCase());
        items.push({ name: c.name, type: "city", state: c.state });
      }
    }

    return items.slice(0, 15);
  }, [query]);

  const commitQuery = useCallback((): PreferredTarget | null => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const matched = results[highlightedIndex] || results[0];
    if (matched) {
      onAdd(matched);
      setQuery("");
      setIsOpen(false);
      return matched;
    }
    return null;
  }, [query, results, highlightedIndex, onAdd]);

  useImperativeHandle(
    ref,
    () => ({
      commit: commitQuery,
    }),
    [commitQuery]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (query.trim()) {
          commitQuery();
        } else {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, commitQuery]);

  const [prevResults, setPrevResults] = useState(results);
  if (results !== prevResults) {
    setPrevResults(results);
    setHighlightedIndex(0);
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        return;
      }
      if (e.key === "Enter") {
        if (query.trim()) {
          e.preventDefault();
          e.stopPropagation();
          commitQuery();
          return;
        }
        return;
      }
    }

    if (isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((prev) => (results.length === 0 ? 0 : (prev + 1) % results.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((prev) => (results.length === 0 ? 0 : (prev - 1 + results.length) % results.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        commitQuery();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Compass
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          strokeWidth={1.8}
        />
        <input
          type="text"
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            if (query.trim()) {
              commitQuery();
            }
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={`${inputClass} pl-10`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-control border border-border-default bg-surface-card shadow-modal">
          {results.map((item, idx) => (
            <button
              key={`${item.name}-${item.type}-${idx}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(idx)}
              onClick={() => {
                onAdd(item);
                setQuery("");
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                highlightedIndex === idx
                  ? "bg-brand-soft text-brand font-semibold"
                  : "hover:bg-surface-subtle"
              }`}
            >
              <span className="font-semibold text-text-primary">{item.name}</span>
              <span className="text-2xs text-text-muted">
                {item.type === "state" ? "State, India" : `${item.state}, India`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
