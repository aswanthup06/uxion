"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Check,
    GraduationCap,
    IndianRupee,
    Megaphone,
    MessageCircle,
    Share2,
    Users,
    Wallet,
} from "lucide-react";

const WHATSAPP_GROUP_URL =
    "https://chat.whatsapp.com/G3KSb5pZE01BHFmxKwA9oa?s=cl&p=a&mlu=4&ilr=4";
const ZENOWAY_URL = "https://www.zenoway.com";

const REWARD = 2;
const PRESETS = [25, 50, 100, 250, 500];
const DAYS = 30;

const STEPS = [
    {
        icon: BriefcaseBusiness,
        title: "Choose a job",
        text: "Pick a Zenoway listing that suits the people around you.",
    },
    {
        icon: Share2,
        title: "Share your link",
        text: "Post it in groups, stories or personal chats.",
    },
    {
        icon: Users,
        title: "People apply",
        text: "Applicants open the job through your link and apply.",
    },
    {
        icon: Wallet,
        title: "Earn rewards",
        text: "₹2 for every eligible application attributed to you.",
    },
];

const CHANNELS = [
    { icon: MessageCircle, title: "WhatsApp groups", text: "Job-seeker, locality and community groups." },
    { icon: LinkedInIcon, title: "LinkedIn", text: "Post jobs to your connections and followers." },
    { icon: GraduationCap, title: "Campus & alumni", text: "Final-year students and recent graduates." },
    { icon: Megaphone, title: "Social & friends", text: "Stories, channels and people you know." },
];

function LinkedInIcon({ size = 17 }: { size?: number }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
    );
}

const fmt = (n: number) => n.toLocaleString("en-IN");

export default function ZenowayReferralPage() {
    const [apps, setApps] = useState(100);
    const reduceMotion = useReducedMotion();

    const daily = apps * REWARD;
    const monthly = daily * DAYS;

    return (
        <main className="bg-surface-base text-text-primary">
            {/* ================= HERO ================= */}
            <section className="overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 pb-12 pt-4 sm:px-10 sm:pt-6 lg:px-12">
                    <div className="grid items-center gap-8 lg:min-h-[540px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
                        {/* LEFT */}
                        <div className="relative z-10 py-5 lg:py-8">
                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6 flex items-center gap-2.5"
                            >
                                <span className="h-2 w-2 rounded-pill bg-brand" />
                                <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                                    Referral partner program
                                </span>
                            </motion.div>

                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <h1 className="max-w-[590px] text-[40px] font-medium leading-[1.12] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
                                    Share jobs.
                                    <br />
                                    <span className="text-brand">Earn on every apply.</span>
                                </h1>

                                <p className="mt-5 max-w-[460px] text-[15px] leading-7 text-text-secondary sm:text-base">
                                    Help people discover job opportunities across India. Share Zenoway jobs on
                                    WhatsApp, LinkedIn or anywhere your network is, and earn a reward when people
                                    apply through your referral link.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.12 }}
                                className="mt-7 flex flex-wrap items-center gap-4"
                            >
                                <Link
                                    href={WHATSAPP_GROUP_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group inline-flex h-9 items-center gap-3 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                                >
                                    Join referral WhatsApp group
                                    <ArrowUpRight
                                        size={15}
                                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    />
                                </Link>
                                <Link
                                    href={ZENOWAY_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group inline-flex h-9 items-center gap-2 text-xs font-semibold text-text-secondary transition-colors hover:text-brand"
                                >
                                    Explore jobs
                                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </motion.div>

                            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-border-default pt-5">
                                {["₹2 per eligible application", "100 a day ≈ ₹6,000 a month", "Minimum payout ₹200"].map(
                                    (item) => (
                                        <span key={item} className="flex items-center gap-1.5 text-xs text-text-secondary">
                                            <Check size={13} className="text-brand" />
                                            {item}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="relative mx-auto flex min-h-[380px] w-full max-w-[500px] items-center justify-center sm:min-h-[440px]">
                            {/* dotted texture */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-3 opacity-40"
                                style={{
                                    backgroundImage: "radial-gradient(#b9c8ba 0.7px, transparent 0.7px)",
                                    backgroundSize: "17px 17px",
                                    maskImage: "radial-gradient(ellipse at center, black 15%, transparent 75%)",
                                }}
                            />

                            {/* orbital paths */}
                            <motion.svg
                                viewBox="0 0 500 420"
                                fill="none"
                                className="absolute inset-0 h-full w-full"
                                aria-hidden="true"
                                animate={reduceMotion ? undefined : { rotate: [0, 2, 0] }}
                                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ellipse cx="250" cy="210" rx="180" ry="140" stroke="#dce7dc" strokeDasharray="3 7" />
                                <ellipse
                                    cx="250"
                                    cy="210"
                                    rx="135"
                                    ry="175"
                                    stroke="#e7ede5"
                                    transform="rotate(-28 250 210)"
                                />
                                <path
                                    d="M70 280 C150 280 155 120 230 145 S350 275 430 95"
                                    stroke="#b9d1bc"
                                    strokeDasharray="4 6"
                                />
                                <circle cx="70" cy="280" r="4" fill="#0fa968" />
                                <circle cx="230" cy="145" r="4" fill="#0fa968" />
                                <circle cx="430" cy="95" r="4" fill="#0fa968" />
                            </motion.svg>

                            {/* earnings card */}
                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="relative z-10 w-[90%] max-w-[380px] rounded-panel border border-border-default bg-surface-card p-5 shadow-card sm:p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand">
                                            Your referral earnings
                                        </p>
                                        <h2 className="mt-2 text-xl font-medium tracking-tight">See your monthly income.</h2>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand">
                                        <IndianRupee size={19} />
                                    </div>
                                </div>

                                {/* input */}
                                <p className="mt-5 text-xs font-medium text-text-primary">
                                    Applications you get per day
                                </p>
                                <div
                                    role="group"
                                    aria-label="Applications per day"
                                    className="mt-2 flex items-center gap-1 rounded-control border border-border-default bg-surface-subtle p-1"
                                >
                                    {PRESETS.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setApps(p)}
                                            aria-pressed={apps === p}
                                            className={`flex-1 cursor-pointer rounded-control px-1 py-2 text-xs font-medium transition-colors ${apps === p
                                                    ? "bg-surface-card text-brand shadow-subtle ring-1 ring-border-default"
                                                    : "text-text-muted hover:text-text-primary"
                                                }`}
                                        >
                                            {fmt(p)}
                                        </button>
                                    ))}
                                </div>

                                <div className="my-5 h-px bg-border-subtle" />

                                {/* result */}
                                <p className="text-xs font-medium text-text-muted">You earn per month</p>
                                <div className="mt-1 overflow-hidden">
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.p
                                            key={monthly}
                                            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-[44px] font-medium leading-none tracking-[-0.04em] text-brand"
                                        >
                                            ₹{fmt(monthly)}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                {/* how it adds up */}
                                <dl className="mt-5 space-y-2 rounded-control bg-surface-subtle px-3.5 py-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-text-secondary">{fmt(apps)} applications × ₹{REWARD}</dt>
                                        <dd className="font-medium text-text-primary">₹{fmt(daily)} per day</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-text-secondary">₹{fmt(daily)} × {DAYS} days</dt>
                                        <dd className="font-medium text-brand">₹{fmt(monthly)} per month</dd>
                                    </div>
                                </dl>
                                <p className="mt-3 text-[10px] leading-4 text-text-muted">
                                    Example only. Rewards apply to eligible applications.
                                </p>
                            </motion.div>

                            {/* floating details */}
                            <motion.div
                                animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-[6%] left-0 z-20 hidden rounded-card border border-border-default bg-surface-card px-3.5 py-3 shadow-subtle sm:block"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-brand-soft text-brand">
                                        <Check size={14} />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-medium">+₹2 per apply</p>
                                        <p className="mt-0.5 text-[10px] text-text-muted">Tracked via your link</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute right-0 top-[6%] z-20 hidden rounded-card border border-border-default bg-surface-card px-3.5 py-2.5 text-[11px] text-text-secondary shadow-subtle sm:block"
                            >
                                <span className="mr-2 text-brand">✳</span>
                                WhatsApp · LinkedIn · Friends
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section className="border-t border-border-subtle bg-surface-subtle">
                <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20 lg:px-12">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand">Simple to start</p>
                    <h2 className="mt-3 max-w-md text-[30px] font-medium leading-[1.15] tracking-[-0.04em] sm:text-[38px]">
                        Four steps from link to reward.
                    </h2>

                    <div className="relative mt-10">
                        <div
                            aria-hidden="true"
                            className="absolute left-0 right-0 top-[38px] hidden border-t border-dashed border-border-strong lg:block"
                        />
                        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {STEPS.map(({ icon: Icon, title, text }, i) => (
                                <motion.article
                                    key={title}
                                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.08 }}
                                    className="rounded-panel border border-border-default bg-surface-card p-5 shadow-subtle transition-shadow hover:shadow-card"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand">
                                            <Icon size={19} />
                                        </div>
                                        <span className="text-[11px] font-medium tracking-[0.12em] text-text-muted">
                                            0{i + 1}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-[15px] font-medium tracking-tight">{title}</h3>
                                    <p className="mt-1.5 text-xs leading-5 text-text-secondary">{text}</p>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= WHERE TO SHARE ================= */}
            <section>
                <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20 lg:px-12">
                    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand">Reach the right people</p>
                            <h2 className="mt-3 max-w-sm text-[30px] font-medium leading-[1.15] tracking-[-0.04em] sm:text-[38px]">
                                Share where people already look for jobs.
                            </h2>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-text-secondary">
                                Applications come from people who need the role. A short note on who it suits
                                works better than a bare link.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {CHANNELS.map(({ icon: Icon, title, text }, i) => (
                                <motion.div
                                    key={title}
                                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : i * 0.07 }}
                                    className="group flex items-start gap-3 rounded-panel border border-border-default bg-surface-card p-4 transition-colors hover:border-border-strong hover:bg-surface-subtle"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
                                        <Icon size={17} />
                                    </span>
                                    <div>
                                        <p className="text-[13px] font-medium">{title}</p>
                                        <p className="mt-1 text-xs leading-5 text-text-muted">{text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="mx-auto max-w-7xl px-6 pb-14 sm:px-10 sm:pb-20 lg:px-12">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-panel border border-border-default bg-brand-soft px-6 py-10 sm:px-12 sm:py-14"
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 400 400"
                        fill="none"
                        className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] opacity-70"
                    >
                        <circle cx="200" cy="200" r="60" stroke="#b7d1be" />
                        <circle cx="200" cy="200" r="110" stroke="#b7d1be" strokeDasharray="3 8" />
                        <circle cx="200" cy="200" r="160" stroke="#cfe0d3" />
                        <circle cx="200" cy="40" r="5" fill="#0fa968" />
                        <circle cx="311" cy="311" r="4" fill="#0fa968" />
                    </svg>

                    <div className="relative max-w-lg">
                        <h2 className="text-[28px] font-medium leading-[1.15] tracking-[-0.04em] sm:text-[36px]">
                            Join the Zenoway referral community.
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                            Get your referral link, program updates and support in the WhatsApp group.
                        </p>
                        <Link
                            href={WHATSAPP_GROUP_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="group mt-6 inline-flex h-9 items-center gap-3 rounded-control bg-brand px-5 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        >
                            Join WhatsApp group
                            <ArrowUpRight
                                size={15}
                                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>
                </motion.div>

                <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-5 text-text-muted">
                    Zenoway is a premium job platform, not a free job portal. Referral rewards apply to eligible
                    applications tracked through your referral link. Terms and conditions apply.
                </p>
            </section>
        </main>
    );
}