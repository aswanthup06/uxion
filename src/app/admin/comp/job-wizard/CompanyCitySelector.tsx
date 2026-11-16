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
import { Building2, Plus } from "lucide-react";
import { CANONICAL_CITIES } from "@/lib/supabase/locations-data";
import type { OfficeLocation } from "./types";
import { fetchCscCities, resolveOfficeState, inputClass } from "./wizard-utils";

export interface CompanyCitySelectorHandle {
  commit: () => OfficeLocation | null;
}

export interface CompanyCitySelectorProps {
  onSelect: (office: OfficeLocation) => void;
  placeholder?: string;
}

export const CompanyCitySelector = forwardRef<
  CompanyCitySelectorHandle,
  CompanyCitySelectorProps
>(function CompanyCitySelector(
  {
    onSelect,
    placeholder = "Type city name (e.g. Bengaluru, Kochi, Mumbai)...",
  },
  ref
) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cscCities, setCscCities] = useState<Array<{ name: string; state: string; countryCode: string }>>([]);

  useEffect(() => {
    fetchCscCities().then((cities) => {
      if (cities.length > 0) setCscCities(cities);
    });
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { city: "Bengaluru", state: "Karnataka", country: "India", countryCode: "IN" },
        { city: "Kochi", state: "Kerala", country: "India", countryCode: "IN" },
        { city: "Mumbai", state: "Maharashtra", country: "India", countryCode: "IN" },
        { city: "Hyderabad", state: "Telangana", country: "India", countryCode: "IN" },
        { city: "Pune", state: "Maharashtra", country: "India", countryCode: "IN" },
        { city: "Delhi NCR", state: "Delhi", country: "India", countryCode: "IN" },
        { city: "Gurugram", state: "Haryana", country: "India", countryCode: "IN" },
        { city: "Noida", state: "Uttar Pradesh", country: "India", countryCode: "IN" },
        { city: "Chennai", state: "Tamil Nadu", country: "India", countryCode: "IN" },
        { city: "Trivandrum", state: "Kerala", country: "India", countryCode: "IN" },
      ];
    }

    const results: OfficeLocation[] = [];
    const seen = new Set<string>();

    for (const c of CANONICAL_CITIES) {
      if (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      ) {
        seen.add(c.name.toLowerCase());
        results.push({ city: c.name, state: c.state, country: "India", countryCode: "IN" });
      }
    }

    for (const c of cscCities) {
      if (results.length >= 15) break;
      if (!seen.has(c.name.toLowerCase()) && c.name.toLowerCase().includes(q)) {
        seen.add(c.name.toLowerCase());
        results.push({ city: c.name, state: c.state, country: "India", countryCode: "IN" });
      }
    }

    return results;
  }, [query, cscCities]);

  const hasCustomOption = Boolean(
    query.trim() && !suggestions.some((s) => s.city.toLowerCase() === query.trim().toLowerCase())
  );
  const totalOptions = suggestions.length + (hasCustomOption ? 1 : 0);

  const [prevSuggestions, setPrevSuggestions] = useState(suggestions);
  if (suggestions !== prevSuggestions) {
    setPrevSuggestions(suggestions);
    setHighlightedIndex(0);
  }

  const commitQuery = useCallback((): OfficeLocation | null => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const qLower = trimmed.toLowerCase();
    const matchedCanonical = CANONICAL_CITIES.find(
      (c) => c.name.toLowerCase() === qLower || c.aliases?.some((a) => a.toLowerCase() === qLower)
    );
    const matchedCsc = cscCities.find((c) => c.name.toLowerCase() === qLower);
    const matchedSuggestion = suggestions.find((s) => s.city.toLowerCase() === qLower);

    let office: OfficeLocation;
    if (matchedSuggestion) {
      office = matchedSuggestion;
    } else if (matchedCanonical) {
      office = {
        city: matchedCanonical.name,
        state: matchedCanonical.state,
        country: "India",
        countryCode: "IN",
      };
    } else if (matchedCsc) {
      office = {
        city: matchedCsc.name,
        state: matchedCsc.state,
        country: "India",
        countryCode: "IN",
      };
    } else {
      office = {
        city: trimmed,
        state: resolveOfficeState(trimmed),
        country: "India",
        countryCode: "IN",
      };
    }

    onSelect(office);
    setQuery("");
    setIsOpen(false);
    return office;
  }, [query, suggestions, onSelect, cscCities]);

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
        setHighlightedIndex((prev) => (totalOptions === 0 ? 0 : (prev + 1) % totalOptions));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((prev) => (totalOptions === 0 ? 0 : (prev - 1 + totalOptions) % totalOptions));
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (highlightedIndex < suggestions.length && suggestions[highlightedIndex]) {
          onSelect(suggestions[highlightedIndex]);
          setQuery("");
          setIsOpen(false);
        } else {
          commitQuery();
        }
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
        <Building2
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
          {suggestions.map((item, idx) => (
            <button
              key={`${item.city}-${item.state}-${idx}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(idx)}
              onClick={() => {
                onSelect(item);
                setQuery("");
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                highlightedIndex === idx
                  ? "bg-brand-soft text-brand font-semibold"
                  : "hover:bg-surface-subtle"
              }`}
            >
              <span className="font-semibold text-text-primary">{item.city}</span>
              <span className="text-2xs text-text-muted">{item.state}, India</span>
            </button>
          ))}
          {hasCustomOption && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              onClick={() => {
                commitQuery();
              }}
              className={`flex w-full items-center gap-1.5 border-t border-border-default px-3.5 py-2 text-left text-xs transition-colors ${
                highlightedIndex === suggestions.length
                  ? "bg-brand-soft text-brand font-semibold"
                  : "text-brand hover:bg-brand-soft"
              }`}
            >
              <Plus size={13} />
              <span>Add &quot;{query.trim()}&quot; as custom city</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});
