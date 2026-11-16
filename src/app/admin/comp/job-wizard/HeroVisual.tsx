"use client";

import React from "react";

const applicants = [
  { initials: "AR", name: "Anjali R.", role: "React Developer", time: "just now" },
  { initials: "RM", name: "Rahul M.", role: "Product Designer", time: "2m ago" },
  { initials: "SK", name: "Sneha K.", role: "Backend Engineer", time: "5m ago" },
];

export function HeroVisual() {
  return (
    <div aria-hidden className="relative hidden h-[380px] lg:block">
      {/* Soft brand glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl" />

      {/* Dot grid, faded at edges */}
      <div
        className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(closest-side,black,transparent)]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(120,120,120,0.35) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Floating job card */}
      <div className="hero-anim absolute right-4 top-4 w-[300px] animate-[float_7s_ease-in-out_infinite] rounded-2xl border border-border-default/50 bg-surface-card/80 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-3xs font-medium uppercase tracking-[0.14em] text-text-muted">New opening</span>
          <span className="flex items-center gap-1.5 text-3xs font-medium text-brand">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            Live
          </span>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-text-primary">Senior UI Developer</h3>
        <p className="mt-0.5 text-xs text-text-muted">Kochi · Hybrid · ₹18–26 LPA</p>
        <div className="mt-3 flex gap-1.5">
          {["React", "Next.js", "Tailwind"].map((t) => (
            <span key={t} className="rounded-pill border border-border-default/50 px-2 py-0.5 text-3xs text-text-secondary">{t}</span>
          ))}
        </div>
      </div>

      {/* Applicants sliding in */}
      <div className="absolute bottom-6 left-0 w-[290px] space-y-2.5">
        {applicants.map((a, i) => (
          <div
            key={a.name}
            className="hero-anim flex animate-[slide-in_0.6s_ease-out_both] items-center gap-3 rounded-xl border border-border-default/50 bg-surface-card/90 p-2.5 shadow-subtle backdrop-blur"
            style={{ animationDelay: `${0.5 + i * 0.35}s` }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xs font-semibold text-brand">{a.initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary">{a.name}</p>
              <p className="truncate text-2xs text-text-muted">{a.role}</p>
            </div>
            <span className="text-3xs text-text-muted">{a.time}</span>
          </div>
        ))}
      </div>

      {/* Commission chip */}
      <div
        className="hero-anim absolute bottom-0 right-6 animate-[slide-in_0.6s_ease-out_both] rounded-pill border border-border-default/50 bg-surface-card px-3 py-1.5 text-2xs font-medium text-text-primary shadow-subtle"
        style={{ animationDelay: "1.8s" }}
      >
        ₹0 <span className="text-text-muted">commission</span>
      </div>
    </div>
  );
}
