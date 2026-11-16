"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { inputClass, labelClass } from "./wizard-utils";

export interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ElementType;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  maxLength?: number;
  step?: string;
  error?: string;
}

export function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  type = "text",
  required = false,
  min,
  max,
  maxLength = 150,
  step,
  error,
}: FieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-status-error">*</span>}
      </label>

      <div className="group relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              error
                ? "text-status-error"
                : "text-text-muted group-focus-within:text-brand"
            }`}
            strokeWidth={1.8}
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          maxLength={maxLength}
          step={step}
          className={`${inputClass} ${Icon ? "pl-10" : ""} ${
            error
              ? "border-status-error ring-1 ring-status-error/30 focus:border-status-error focus:ring-status-error/40"
              : ""
          }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-status-error animate-in fade-in duration-150">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
