import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Field } from "../Field";

describe("<Field /> Component", () => {
  it("renders label and input with placeholder and value", () => {
    const handleChange = vi.fn();
    render(
      <Field
        label="Job Title"
        name="title"
        value="Frontend Engineer"
        onChange={handleChange}
        placeholder="e.g. Senior React Developer"
      />
    );

    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText("e.g. Senior React Developer") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("Frontend Engineer");
  });

  it("calls onChange when typing into the input", () => {
    const handleChange = vi.fn();
    render(
      <Field
        label="Company"
        name="company"
        value=""
        onChange={handleChange}
        placeholder="Company name"
      />
    );

    const input = screen.getByPlaceholderText("Company name");
    fireEvent.change(input, { target: { value: "Zenoway Tech" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("renders asterisk and required attribute when required=true", () => {
    render(
      <Field
        label="Email"
        name="mail"
        value=""
        onChange={vi.fn()}
        placeholder="careers@company.com"
        required
      />
    );

    const input = screen.getByPlaceholderText("careers@company.com");
    expect(input).toBeRequired();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders error message and applies error styles when error prop is passed", () => {
    render(
      <Field
        label="Job Title"
        name="title"
        value=""
        onChange={vi.fn()}
        placeholder="Job title"
        error="Title is required"
      />
    );

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Job title");
    expect(input.className).toContain("border-status-error");
  });
});
