"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import {
    ArrowUpRight,
    BadgeCheck,
    Check,
    Clock,
    Copy,
    FileText,
    IndianRupee,
    Link2,
    MessageCircle,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types + placeholder data. Replace with your API response.           */
/* ------------------------------------------------------------------ */

type JobRow = {
    title: string;
    company: string;
    place: string;
    applications: number; // eligible applications
};

type Payout = { id: string; date: string; amount: number; status: "Paid" | "Processing" };

type DashboardData = {
    partnerName: string;
    referralLink: string;
    eligibleApplications: number;
    underReviewApplications: number;
    totalPaidOut: number; // ₹
    last14Days: number[]; // applications per day, oldest -> newest
    jobs: JobRow[];
    payouts: Payout[];
};

const MOCK: DashboardData = {
    partnerName: "Partner",
    referralLink: "https://www.zenoway.com/?ref=your-code", // placeholder format
    eligibleApplications: 780,
    underReviewApplications: 62,
    totalPaidOut: 1000,
    last14Days: [22, 31, 18, 40, 55, 38, 27, 45, 62, 48, 33, 52, 67, 41],
    jobs: [
        { title: "UI/UX Designer", company: "Technologies", place: "Kochi", applications: 214 },
        { title: "Product Designer", company: "Product startup", place: "Remote", applications: 186 },
        { title: "Frontend Developer", company: "Technology team", place: "Bengaluru", applications: 152 },
        { title: "Customer Support Associate", company: "Retail company", place: "Kozhikode", applications: 120 },
        { title: "Sales Executive", company: "Services firm", place: "Chennai", applications: 108 },
    ],
    payouts: [
        { id: "p2", date: "12 Oct 2026", amount: 600, status: "Paid" },
        { id: "p1", date: "28 Sep 2026", amount: 400, status: "Paid" },
    ],
};

const WHATSAPP_GROUP_URL =
    "https://chat.whatsapp.com/G3KSb5pZE01BHFmxKwA9oa?s=cl&p=a&mlu=4&ilr=4";
const ZENOWAY_URL = "https://www.zenoway.com";
const REWARD = 2;
const MIN_PAYOUT = 200;

const fmt = (n: number) => n.toLocaleString("en-IN");

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function LinkedInIcon({ size = 14 }: { size?: number }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
    );
}

function CountUp({ value, prefix = "" }: { value: number; prefix?: string }) {
    const reduce = useReducedMotion();
    const mv = useMotionValue(0);
    const text = useTransform(mv, (v) => `${prefix}${fmt(Math.round(v))}`);
    useEffect(() => {
        const c = animate(mv, value, { duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] });
        return () => c.stop();
    }, [value, reduce, mv]);
    return <motion.span className="tabular-nums">{text}</motion.span>;
}

function Card({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : delay }}
            className={`rounded-panel border border-border-default bg-surface-card shadow-subtle ${className}`}
        >
            {children}
        </motion.div>
    );
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-medium tracking-tight">{children}</h2>
            {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ReferralDashboardPage({
    data = MOCK,
    onRequestPayout,
}: {
    data?: DashboardData;
    onRequestPayout?: () => void;
}) {
    const reduce = useReducedMotion();
    const [copied, setCopied] = useState(false);

    const totalEarned = data.eligibleApplications * REWARD;
    const available = Math.max(totalEarned - data.totalPaidOut, 0);
    const pending = data.underReviewApplications * REWARD;
    const totalApplications = data.eligibleApplications + data.underReviewApplications;
    const canPayout = available >= MIN_PAYOUT;
    const payoutProgress = Math.min(available / MIN_PAYOUT, 1);

    const maxDay = Math.max(...data.last14Days);
    const last7 = data.last14Days.slice(-7).reduce((a, b) => a + b, 0);
    const prev7 = data.last14Days.slice(0, 7).reduce((a, b) => a + b, 0);
    const change = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : 0;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(data.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard blocked: ignore */
        }
    };

    const shareText = encodeURIComponent(`Apply for jobs on Zenoway: ${data.referralLink}`);
    const whatsappShare = `https://wa.me/?text=${shareText}`;
    const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.referralLink)}`;

    const stats = [
        { label: "Total earned", value: totalEarned, prefix: "₹", icon: IndianRupee, tone: "brand" },
        { label: "Available to withdraw", value: available, prefix: "₹", icon: Wallet, tone: "default" },
        { label: "Under review", value: pending, prefix: "₹", icon: Clock, tone: "muted" },
        { label: "Total applications", value: totalApplications, prefix: "", icon: Users, tone: "default" },
    ] as const;

    return (
        <main className="bg-surface-base text-text-primary">
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-6 sm:px-10 sm:pt-8 lg:px-12">
                {/* ---------- Heading ---------- */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-wrap items-end justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-pill bg-brand" />
                            <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                                Referral partner
                            </span>
                        </div>
                        <h1 className="mt-4 text-[32px] font-medium leading-[1.12] tracking-[-0.04em] sm:text-[40px]">
                            Your referral earnings
                        </h1>
                        <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                            Track applications, rewards and payouts from jobs you share, {data.partnerName}.
                        </p>
                    </div>
                    <Link
                        href={ZENOWAY_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex h-9 items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 text-xs font-semibold transition-colors hover:bg-surface-subtle"
                    >
                        Browse jobs to share
                        <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </motion.div>

                {/* ---------- Stat cards ---------- */}
                <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {stats.map(({ label, value, prefix, icon: Icon, tone }, i) => (
                        <Card key={label} delay={i * 0.06} className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted">{label}</span>
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-control ${tone === "brand" ? "bg-brand text-white" : "bg-brand-soft text-brand"
                                        }`}
                                >
                                    <Icon size={15} />
                                </span>
                            </div>
                            <p
                                className={`mt-3 text-[28px] font-medium leading-none tracking-[-0.03em] sm:text-[32px] ${tone === "brand" ? "text-brand" : tone === "muted" ? "text-text-secondary" : ""
                                    }`}
                            >
                                <CountUp value={value} prefix={prefix} />
                            </p>
                        </Card>
                    ))}
                </div>

                {/* ---------- Main grid ---------- */}
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        {/* Activity chart */}
                        <Card delay={0.2} className="p-5 sm:p-6">
                            <SectionTitle hint="Applications per day">Last 14 days</SectionTitle>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-2xl font-medium tracking-tight">{fmt(last7)}</span>
                                <span className="text-xs text-text-muted">applications this week</span>
                                <span
                                    className={`ml-1 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-medium ${change >= 0 ? "bg-brand-soft text-brand" : "bg-status-error-bg text-status-error"
                                        }`}
                                >
                                    <TrendingUp size={11} className={change < 0 ? "rotate-180" : ""} />
                                    {change >= 0 ? "+" : ""}
                                    {change}%
                                </span>
                            </div>

                            <div className="mt-6 flex h-36 items-end gap-1.5 sm:gap-2" role="img" aria-label="Applications per day, last 14 days">
                                {data.last14Days.map((v, i) => (
                                    <div key={i} className="group relative flex h-full flex-1 items-end">
                                        <motion.div
                                            initial={reduce ? false : { scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{ duration: 0.5, delay: reduce ? 0 : 0.3 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ height: `${Math.max((v / maxDay) * 100, 6)}%`, originY: 1 }}
                                            className={`w-full rounded-t-[3px] transition-colors ${i >= 7 ? "bg-brand group-hover:bg-brand-hover" : "bg-border-strong group-hover:bg-brand-accent"
                                                }`}
                                        />
                                        <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-control bg-text-primary px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
                                <span>14 days ago</span>
                                <span className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-[2px] bg-border-strong" /> Previous week
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-[2px] bg-brand" /> This week
                                    </span>
                                </span>
                                <span>Today</span>
                            </div>
                        </Card>

                        {/* Jobs table */}
                        <Card delay={0.26} className="p-5 sm:p-6">
                            <SectionTitle hint="Eligible applications × ₹2">Earnings by job</SectionTitle>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[480px] text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-border-subtle text-[11px] uppercase tracking-[0.1em] text-text-muted">
                                            <th className="pb-3 font-medium">Job</th>
                                            <th className="pb-3 text-right font-medium">Applications</th>
                                            <th className="pb-3 text-right font-medium">Earned</th>
                                            <th className="hidden w-32 pb-3 pl-5 font-medium sm:table-cell">Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle">
                                        {data.jobs.map((job) => {
                                            const share = (job.applications / data.eligibleApplications) * 100;
                                            return (
                                                <tr key={job.title} className="transition-colors hover:bg-surface-subtle">
                                                    <td className="py-3.5 pr-3">
                                                        <p className="text-[13px] font-medium">{job.title}</p>
                                                        <p className="mt-0.5 text-[11px] text-text-muted">
                                                            {job.company} · {job.place}
                                                        </p>
                                                    </td>
                                                    <td className="py-3.5 text-right tabular-nums text-text-secondary">{fmt(job.applications)}</td>
                                                    <td className="py-3.5 text-right font-medium tabular-nums text-brand">
                                                        ₹{fmt(job.applications * REWARD)}
                                                    </td>
                                                    <td className="hidden py-3.5 pl-5 sm:table-cell">
                                                        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-muted">
                                                            <motion.div
                                                                initial={reduce ? false : { width: 0 }}
                                                                animate={{ width: `${share}%` }}
                                                                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                                                className="h-full rounded-pill bg-brand-accent"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-border-default text-[13px] font-medium">
                                            <td className="pt-3.5">Total</td>
                                            <td className="pt-3.5 text-right tabular-nums">{fmt(data.eligibleApplications)}</td>
                                            <td className="pt-3.5 text-right tabular-nums text-brand">₹{fmt(totalEarned)}</td>
                                            <td className="hidden sm:table-cell" />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>

                        {/* Payout history */}
                        <Card delay={0.32} className="p-5 sm:p-6">
                            <SectionTitle>Payout history</SectionTitle>
                            {data.payouts.length === 0 ? (
                                <p className="mt-4 text-xs text-text-muted">No payouts yet. Your first one unlocks at ₹{MIN_PAYOUT}.</p>
                            ) : (
                                <ul className="mt-4 divide-y divide-border-subtle">
                                    {data.payouts.map((p) => (
                                        <li key={p.id} className="flex items-center gap-3 py-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                                                <Check size={14} />
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-[13px] font-medium">₹{fmt(p.amount)}</p>
                                                <p className="text-[11px] text-text-muted">{p.date}</p>
                                            </div>
                                            <span className="rounded-pill bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                                                {p.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">
                        {/* Payout card */}
                        <Card delay={0.22} className="p-5 sm:p-6">
                            <SectionTitle>Withdraw</SectionTitle>
                            <p className="mt-3 text-[32px] font-medium leading-none tracking-[-0.03em]">₹{fmt(available)}</p>
                            <p className="mt-1.5 text-xs text-text-muted">available now</p>

                            <div className="mt-5 h-1.5 overflow-hidden rounded-pill bg-surface-muted">
                                <motion.div
                                    initial={reduce ? false : { width: 0 }}
                                    animate={{ width: `${payoutProgress * 100}%` }}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    className="h-full rounded-pill bg-brand"
                                />
                            </div>
                            <p className="mt-2 text-[11px] text-text-muted">
                                {canPayout
                                    ? `You've reached the ₹${MIN_PAYOUT} minimum payout.`
                                    : `₹${fmt(MIN_PAYOUT - available)} more to reach the ₹${MIN_PAYOUT} minimum payout.`}
                            </p>

                            <button
                                type="button"
                                disabled={!canPayout}
                                onClick={onRequestPayout}
                                className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-muted disabled:shadow-none"
                            >
                                Request payout
                            </button>
                        </Card>

                        {/* Referral link */}
                        <Card delay={0.28} className="p-5 sm:p-6">
                            <SectionTitle>Your referral link</SectionTitle>
                            <div className="mt-4 flex items-center gap-2 rounded-control border border-border-default bg-surface-subtle p-1.5 pl-3">
                                <Link2 size={14} className="shrink-0 text-brand" />
                                <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{data.referralLink}</span>
                                <button
                                    type="button"
                                    onClick={copyLink}
                                    className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-control bg-surface-card px-3 text-xs font-semibold shadow-subtle ring-1 ring-border-default transition-colors hover:bg-brand-soft"
                                >
                                    {copied ? <Check size={13} className="text-brand" /> : <Copy size={13} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <a
                                    href={whatsappShare}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-control border border-border-default text-xs font-semibold transition-colors hover:bg-surface-subtle"
                                >
                                    <MessageCircle size={14} className="text-brand" /> WhatsApp
                                </a>
                                <a
                                    href={linkedinShare}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-control border border-border-default text-xs font-semibold transition-colors hover:bg-surface-subtle"
                                >
                                    <span className="text-brand">
                                        <LinkedInIcon />
                                    </span>
                                    LinkedIn
                                </a>
                            </div>
                        </Card>

                        {/* Program details */}
                        <Card delay={0.34} className="p-5 sm:p-6">
                            <SectionTitle>Program details</SectionTitle>
                            <dl className="mt-4 divide-y divide-border-subtle text-xs">
                                {[
                                    ["Reward", "₹2 per eligible application"],
                                    ["Minimum payout", `₹${MIN_PAYOUT}`],
                                    ["Launch offer", "First 3 months"],
                                    ["Tracking", "Through your referral link"],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                                        <dt className="text-text-muted">{k}</dt>
                                        <dd className="text-right font-medium">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                            <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-text-muted">
                                <BadgeCheck size={14} className="mt-0.5 shrink-0 text-brand" />
                                Zenoway is a premium job platform, not a free job portal. Rewards apply to eligible
                                applications only. Terms and conditions apply.
                            </p>
                        </Card>

                        {/* Support */}
                        <Card delay={0.4} className="bg-brand-soft p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-card text-brand">
                                    <FileText size={16} />
                                </span>
                                <div>
                                    <h2 className="text-[13px] font-medium">Questions about earnings?</h2>
                                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                                        Ask in the referral WhatsApp group for updates and support.
                                    </p>
                                    <Link
                                        href={WHATSAPP_GROUP_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover"
                                    >
                                        Open WhatsApp group
                                        <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}