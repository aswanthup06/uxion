"use client";

import { useState } from "react";
import { Check, Lock } from "lucide-react";

const RATE = 2;
const MIN_PAYOUT = 200;
const MAX = 1000;
const PRESETS = [50, 100, 250, 500, 1000];

export default function EarningsSlider() {
    const [apps, setApps] = useState(100);
    const earned = apps * RATE;
    const unlocked = earned >= MIN_PAYOUT;
    const remaining = Math.ceil((MIN_PAYOUT - earned) / RATE);

    const R = 62;
    const C = 2 * Math.PI * R;
    const progress = Math.min(earned / MIN_PAYOUT, 1);

    return (
        <div className="grid gap-8 rounded-panel border border-border-subtle bg-surface-card p-6 shadow-card sm:p-10 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
            {/* Ring */}
            <div className="relative mx-auto h-48 w-48 shrink-0 sm:h-56 sm:w-56">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="80" cy="80" r={R} fill="none" stroke="#f2f6f3" strokeWidth="14" />
                    <circle
                        cx="80"
                        cy="80"
                        r={R}
                        fill="none"
                        stroke={unlocked ? "#087f50" : "#0fa968"}
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        strokeDashoffset={C * (1 - progress)}
                        style={{ transition: "stroke-dashoffset 400ms cubic-bezier(0.22,1,0.36,1)" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                        You earn
                    </span>
                    <span className="text-5xl font-extrabold tracking-tight text-brand-dark">
                        ₹{earned.toLocaleString("en-IN")}
                    </span>
                    <span
                        className={`mt-2 inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-bold ${unlocked
                                ? "bg-status-success-bg text-status-success"
                                : "bg-surface-muted text-text-secondary"
                            }`}
                    >
                        {unlocked ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {unlocked ? "Cash-out ready" : "Below ₹200"}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div>
                <label htmlFor="apps" className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-bold">Applications through your link</span>
                    <span className="text-2xl font-extrabold tracking-tight text-brand">
                        {apps.toLocaleString("en-IN")}
                    </span>
                </label>
                <input
                    id="apps"
                    type="range"
                    min={0}
                    max={MAX}
                    step={10}
                    value={apps}
                    onChange={(e) => setApps(Number(e.target.value))}
                    className="mt-4 h-2 w-full cursor-pointer accent-[#087f50]"
                />
                <div className="mt-1 flex justify-between text-xs text-text-muted">
                    <span>0</span>
                    <span>{MAX.toLocaleString("en-IN")}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setApps(p)}
                            className={`rounded-pill border px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${apps === p
                                    ? "border-brand bg-brand text-white"
                                    : "border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle"
                                }`}
                        >
                            {p.toLocaleString("en-IN")}
                        </button>
                    ))}
                </div>

                <p className="mt-6 text-sm leading-6 text-text-secondary">
                    {unlocked ? (
                        <>
                            {apps.toLocaleString("en-IN")} × ₹{RATE} ={" "}
                            <strong className="text-text-primary">₹{earned.toLocaleString("en-IN")}</strong>.
                            You have crossed the ₹{MIN_PAYOUT} minimum payout.
                        </>
                    ) : (
                        <>
                            <strong className="text-text-primary">{remaining} more applications</strong> to
                            reach the ₹{MIN_PAYOUT} minimum payout.
                        </>
                    )}
                </p>
                <p className="mt-2 text-xs text-text-muted">
                    Illustration only. Rewards apply to eligible applications. Terms apply.
                </p>
            </div>
        </div>
    );
}