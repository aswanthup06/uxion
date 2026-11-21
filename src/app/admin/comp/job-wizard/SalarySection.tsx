"use client";

import React, { useId, useCallback } from "react";
import { Banknote, EyeOff, Check, Sparkles } from "lucide-react";
import type { JobFormState, SalaryPeriod, SalaryType } from "./types";
import {
  formatSalaryBadge,
  calculateNumericSalary,
  getCurrencySymbol,
  inputClass,
  labelClass,
} from "./wizard-utils";

interface SalarySectionProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  error?: string;
}

const LPA_PRESETS = [
  { label: "3–6 LPA", min: "3", max: "6" },
  { label: "6–10 LPA", min: "6", max: "10" },
  { label: "10–18 LPA", min: "10", max: "18" },
  { label: "18–28 LPA", min: "18", max: "28" },
  { label: "28–45 LPA", min: "28", max: "45" },
];

const CURRENCIES = [
  { code: "INR", label: "₹ INR", symbol: "₹" },
  { code: "USD", label: "$ USD", symbol: "$" },
  { code: "EUR", label: "€ EUR", symbol: "€" },
  { code: "GBP", label: "£ GBP", symbol: "£" },
];

export default function SalarySection({ form, setForm, error }: SalarySectionProps) {
  const toggleId = useId();

  const isDisclosed = form.salaryIsDisclosed ?? (form.salary ? form.salary.toLowerCase() !== "not disclosed" : false);
  const period: SalaryPeriod = form.salaryPeriod || "YEAR";
  const salaryType: SalaryType = form.salaryType || "RANGE";
  const currency = form.salaryCurrency || "INR";
  const sym = getCurrencySymbol(currency);
  const isLpa = period === "YEAR" && currency.toUpperCase() === "INR";

  const updateSalaryState = useCallback(
    (updates: Partial<JobFormState>) => {
      setForm((prev) => {
        const next = { ...prev, ...updates };
        const badge = formatSalaryBadge({
          isDisclosed: next.salaryIsDisclosed,
          min: next.salaryMin,
          max: next.salaryMax,
          period: next.salaryPeriod,
          currency: next.salaryCurrency,
          type: next.salaryType,
        });
        return { ...next, salary: badge };
      });
    },
    [setForm]
  );

  const handleToggleDisclosed = (checked: boolean) => {
    updateSalaryState({
      salaryIsDisclosed: checked,
      salaryPeriod: form.salaryPeriod || "YEAR",
      salaryType: form.salaryType || "RANGE",
      salaryCurrency: form.salaryCurrency || "INR",
    });
  };

  const handlePeriodChange = (newPeriod: SalaryPeriod) => {
    updateSalaryState({
      salaryPeriod: newPeriod,
      // If switching between LPA and monthly, clear or adapt values to avoid mismatch
      salaryMin: "",
      salaryMax: "",
    });
  };

  const handleTypeChange = (newType: SalaryType) => {
    updateSalaryState({ salaryType: newType });
  };

  const handleCurrencyChange = (newCurrency: string) => {
    updateSalaryState({ salaryCurrency: newCurrency });
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSalaryState({ salaryMin: e.target.value });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSalaryState({ salaryMax: e.target.value });
  };

  const handleApplyPreset = (pMin: string, pMax: string) => {
    updateSalaryState({
      salaryPeriod: "YEAR",
      salaryCurrency: "INR",
      salaryType: "RANGE",
      salaryMin: pMin,
      salaryMax: pMax,
    });
  };

  // Compute normalized values for preview
  const numeric = calculateNumericSalary({
    isDisclosed,
    min: form.salaryMin,
    max: form.salaryMax,
    period,
    currency,
    type: salaryType,
  });

  return (
    <div className="rounded-card border border-border-default/80 bg-surface-card p-5 shadow-card transition-all">
      {/* Header & Disclose Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-control bg-brand/10 text-brand">
            <Banknote size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Compensation & Salary</h4>
            <p className="text-2xs text-text-muted">
              Structured salary helps your post rank on Google Jobs and enables candidate salary filters
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label
          htmlFor={toggleId}
          className="inline-flex cursor-pointer select-none items-center gap-2.5 self-start rounded-control border border-border-default/60 bg-surface-subtle/80 px-3 py-1.5 transition hover:bg-surface-subtle sm:self-auto"
        >
          <input
            id={toggleId}
            type="checkbox"
            checked={isDisclosed}
            onChange={(e) => handleToggleDisclosed(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative h-5 w-9 rounded-full transition-colors ${
              isDisclosed ? "bg-brand" : "bg-border-strong/40"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                isDisclosed ? "translate-x-4 shadow-sm" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-xs font-medium text-text-primary">
            {isDisclosed ? "Disclosed" : "Not Disclosed"}
          </span>
        </label>
      </div>

      {/* When Hidden / Undisclosed */}
      {!isDisclosed ? (
        <div className="mt-4 flex items-center gap-3 rounded-control border border-dashed border-border-default bg-surface-subtle/50 px-4 py-3 text-xs text-text-muted">
          <EyeOff size={16} className="shrink-0 text-text-muted/80" />
          <span>
            Salary will appear as <strong className="text-text-primary font-semibold">Not Disclosed</strong> on candidate job cards.
          </span>
        </div>
      ) : (
        <div className="mt-5 space-y-4 pt-1">
          {/* Controls Bar: Pay Period, Salary Type & Currency */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Pay Frequency */}
            <div>
              <span className={labelClass}>Frequency</span>
              <div className="flex rounded-control border border-border-default/70 bg-surface-subtle p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handlePeriodChange("YEAR")}
                  className={`flex-1 rounded-control py-1 font-medium transition ${
                    period === "YEAR"
                      ? "bg-surface-card text-brand shadow-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Per Year {currency === "INR" ? "(LPA)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("MONTH")}
                  className={`flex-1 rounded-control py-1 font-medium transition ${
                    period === "MONTH"
                      ? "bg-surface-card text-brand shadow-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Per Month
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("HOUR")}
                  className={`flex-1 rounded-control py-1 font-medium transition ${
                    period === "HOUR"
                      ? "bg-surface-card text-brand shadow-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Per Hour
                </button>
              </div>
            </div>

            {/* Salary Type (Range / Fixed / Up To) */}
            <div>
              <span className={labelClass}>Structure</span>
              <div className="flex rounded-control border border-border-default/70 bg-surface-subtle p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleTypeChange("RANGE")}
                  className={`flex-1 rounded-control py-1 font-medium transition ${
                    salaryType === "RANGE"
                      ? "bg-surface-card text-brand shadow-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Range
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("FIXED")}
                  className={`flex-1 rounded-control py-1 font-medium transition ${
                    salaryType === "FIXED"
                      ? "bg-surface-card text-brand shadow-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Fixed
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("UP_TO")}
                  className={`flex-1 rounded-control py-1 font-medium transition ${
                    salaryType === "UP_TO"
                      ? "bg-surface-card text-brand shadow-sm font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Up to
                </button>
              </div>
            </div>

            {/* Currency */}
            <div>
              <span className={labelClass}>Currency</span>
              <div className="flex rounded-control border border-border-default/70 bg-surface-subtle p-0.5 text-xs">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`flex-1 rounded-control py-1 font-medium transition ${
                      currency === c.code
                        ? "bg-surface-card text-brand shadow-sm font-semibold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets for Indian LPA */}
          {isLpa && salaryType === "RANGE" && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-text-muted">
                <Sparkles size={11} className="text-brand" /> Quick LPA:
              </span>
              {LPA_PRESETS.map((p) => {
                const isSelected = form.salaryMin === p.min && form.salaryMax === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p.min, p.max)}
                    className={`rounded-control px-2.5 py-0.5 text-2xs font-medium transition ${
                      isSelected
                        ? "bg-brand text-text-inverse font-semibold"
                        : "border border-border-default/60 bg-surface-subtle text-text-secondary hover:bg-surface-card hover:text-text-primary"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Input Fields */}
          <div className="pt-1">
            {salaryType === "RANGE" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="salaryMin" className={labelClass}>
                    Minimum {isLpa ? "Salary (LPA)" : period === "MONTH" ? "Monthly Salary" : "Salary"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3.5 text-xs font-semibold text-text-muted">
                      {sym}
                    </span>
                    <input
                      id="salaryMin"
                      name="salaryMin"
                      type="text"
                      value={form.salaryMin || ""}
                      onChange={handleMinChange}
                      placeholder={isLpa ? "e.g. 12" : period === "MONTH" ? "e.g. 25000" : "e.g. 500"}
                      className={`${inputClass} pl-8 pr-14`}
                    />
                    <span className="pointer-events-none absolute right-3 text-xs font-medium text-text-muted">
                      {isLpa ? "LPA" : period === "MONTH" ? "/mo" : "/hr"}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="salaryMax" className={labelClass}>
                    Maximum {isLpa ? "Salary (LPA)" : period === "MONTH" ? "Monthly Salary" : "Salary"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3.5 text-xs font-semibold text-text-muted">
                      {sym}
                    </span>
                    <input
                      id="salaryMax"
                      name="salaryMax"
                      type="text"
                      value={form.salaryMax || ""}
                      onChange={handleMaxChange}
                      placeholder={isLpa ? "e.g. 18" : period === "MONTH" ? "e.g. 40000" : "e.g. 1000"}
                      className={`${inputClass} pl-8 pr-14`}
                    />
                    <span className="pointer-events-none absolute right-3 text-xs font-medium text-text-muted">
                      {isLpa ? "LPA" : period === "MONTH" ? "/mo" : "/hr"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {salaryType === "FIXED" && (
              <div className="max-w-md">
                <label htmlFor="salaryMin" className={labelClass}>
                  Exact Amount {isLpa ? "(LPA)" : period === "MONTH" ? "(Per Month)" : "(Per Hour)"}
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-xs font-semibold text-text-muted">
                    {sym}
                  </span>
                  <input
                    id="salaryMin"
                    name="salaryMin"
                    type="text"
                    value={form.salaryMin || ""}
                    onChange={handleMinChange}
                    placeholder={isLpa ? "e.g. 15" : period === "MONTH" ? "e.g. 35000" : "e.g. 800"}
                    className={`${inputClass} pl-8 pr-14`}
                  />
                  <span className="pointer-events-none absolute right-3 text-xs font-medium text-text-muted">
                    {isLpa ? "LPA" : period === "MONTH" ? "/mo" : "/hr"}
                  </span>
                </div>
              </div>
            )}

            {salaryType === "UP_TO" && (
              <div className="max-w-md">
                <label htmlFor="salaryMax" className={labelClass}>
                  Maximum Amount {isLpa ? "(LPA)" : period === "MONTH" ? "(Per Month)" : "(Per Hour)"}
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-xs font-semibold text-text-muted">
                    Up to {sym}
                  </span>
                  <input
                    id="salaryMax"
                    name="salaryMax"
                    type="text"
                    value={form.salaryMax || ""}
                    onChange={handleMaxChange}
                    placeholder={isLpa ? "e.g. 25" : period === "MONTH" ? "e.g. 50000" : "e.g. 1200"}
                    className={`${inputClass} pl-16 pr-14`}
                  />
                  <span className="pointer-events-none absolute right-3 text-xs font-medium text-text-muted">
                    {isLpa ? "LPA" : period === "MONTH" ? "/mo" : "/hr"}
                  </span>
                </div>
              </div>
            )}

            {error && <p className="mt-1.5 text-xs font-medium text-error">{error}</p>}
          </div>

          {/* Live Preview Box */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border-default/60 bg-surface-subtle px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Candidate Card Badge:</span>
              <span className="inline-flex items-center gap-1.5 rounded-control bg-brand/10 px-2.5 py-1 font-semibold text-brand">
                <Banknote size={13} className="text-brand shrink-0" />
                <span>{form.salary || "Not Disclosed"}</span>
              </span>
            </div>

            {numeric.salaryMin !== undefined || numeric.salaryMax !== undefined ? (
              <span className="text-2xs text-text-muted">
                Indexed as: {sym}
                {numeric.salaryMin !== undefined ? numeric.salaryMin.toLocaleString("en-IN") : "0"}
                {numeric.salaryMax !== undefined && numeric.salaryMax !== numeric.salaryMin
                  ? ` – ${sym}${numeric.salaryMax.toLocaleString("en-IN")}`
                  : ""}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
