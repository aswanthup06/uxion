"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { IoCheckmark, IoShareSocial } from "react-icons/io5";
import { BiSolidCopy } from "react-icons/bi";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBell,
  FiBriefcase,
  FiMessageCircle,
  FiCompass,
  FiCheckCircle,
  FiChevronDown,
  FiMapPin,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { CATEGORIES } from "./job-communities";
import SiteFooter from "../components/home/SiteFooter";

type Group = { name: string; description: string; link: string };
type Category = {
  name: string;
  description?: string;
  subs: string[];
  groups: Group[];
};

const channel = {
  name: "Zenoway Updates Channel",
  description:
    "Get job alerts, important announcements, new community launches, and platform updates in one quiet, one-way WhatsApp channel.",
  link: "https://whatsapp.com/channel/0029VbC4AMcJpe8dy0vGfc1x",
};
import SharedModal from "../components/Modal";

const EASE = [0.22, 1, 0.36, 1] as const;

function Modal({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy: string;
}) {
  return (
    <SharedModal
      isOpen={open}
      onClose={onClose}
      labelledBy={labelledBy}
      maxWidth="md"
      showCloseButton={false}
      bodyClassName="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:p-6"
    >
      {children}
    </SharedModal>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full cursor-pointer appearance-none rounded-control border border-border-default bg-surface-card px-3 py-3 pr-10 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </span>
    </label>
  );
}

function GroupResult({
  group,
  category,
  onCopy,
  copied,
  onShare,
}: {
  group: Group;
  category: string;
  onCopy: (link: string) => void;
  copied: boolean;
  onShare: (group: Group) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 border-t border-border-default pt-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
          <FaWhatsapp className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            {category}
          </span>
          <h3 className="mt-1 break-words text-base font-semibold leading-6 text-text-primary">
            {group.name}
          </h3>
          <p className="mt-1 break-words text-sm leading-6 text-text-secondary">
            {group.description}
          </p>
        </div>
      </div>
      <a
        href={group.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-3 py-2.5 text-sm font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
      >
        <FaWhatsapp className="h-5 w-5" /> Join WhatsApp group{" "}
        <FiArrowUpRight className="h-4 w-4" />
      </a>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(group.link)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-brand hover:bg-brand-soft"
        >
          {copied ? (
            <IoCheckmark className="h-4 w-4 text-brand" />
          ) : (
            <BiSolidCopy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={() => onShare(group)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-brand hover:bg-brand-soft"
        >
          <IoShareSocial className="h-4 w-4" /> Share
        </button>
      </div>
    </motion.article>
  );
}

export default function SharePage() {
  const reduce = useReducedMotion();
  const categories = CATEGORIES as Category[];
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCategoryData = categories.find(
    (category) => category.name === selectedCategory,
  );
  const availableGroups = selectedCategoryData?.groups ?? [];
  const selectedGroup = availableGroups.find(
    (group) => group.name === selectedGroupName,
  );
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableGroups.filter(
      (group) =>
        !q || `${group.name} ${group.description}`.toLowerCase().includes(q),
    );
  }, [availableGroups, query]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const openGroupModal = () => {
    setGroupModalOpen(true);
    setChannelModalOpen(false);
    setSelectedCategory("");
    setSelectedGroupName("");
    setQuery("");
  };

  const openGroupModalForCategory = (categoryName: string) => {
    setGroupModalOpen(true);
    setChannelModalOpen(false);
    setSelectedCategory(categoryName);
    setSelectedGroupName("");
    setQuery("");
  };
  const closeGroupModal = () => setGroupModalOpen(false);
  const closeChannelModal = () => setChannelModalOpen(false);

  const copyLink = async (link: string) => {
    let success = false;
    try {
      await navigator.clipboard.writeText(link);
      success = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        success = document.execCommand("copy");
      } catch {
        success = false;
      }
      document.body.removeChild(textarea);
    }
    if (success) {
      setCopied(link);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 1800);
    }
  };

  const shareLink = async (group: Group) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: group.description,
          url: group.link,
        });
      } catch {
        /* Share dismissed. */
      }
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${group.name}\n${group.link}`)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <>
      <div className="w-full bg-surface-page text-text-primary selection:bg-brand-soft">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <header className="relative isolate bg-surface-base py-4 text-text-primary sm:py-6 lg:py-7">
            <div className="grid items-center gap-8 lg:grid-cols-[1.22fr_0.78fr] lg:gap-12">
              {/* Animated visual inspired by the Zenoway home hero */}
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative mx-auto flex min-h-[210px] w-full max-w-[340px] items-center justify-center sm:min-h-[250px] order-last lg:min-h-[330px]"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-2 opacity-50"
                  style={{
                    backgroundImage: "radial-gradient(#b9c8ba 0.7px, transparent 0.7px)",
                    backgroundSize: "17px 17px",
                    maskImage: "radial-gradient(ellipse at center, black 15%, transparent 75%)",
                  }}
                />
                <motion.svg
                  viewBox="0 0 340 300"
                  fill="none"
                  className="absolute inset-0 h-full w-full"
                  animate={reduce ? undefined : { rotate: [0, 2, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ellipse cx="170" cy="150" rx="125" ry="94" stroke="#dce7dc" strokeDasharray="3 7" />
                  <ellipse cx="170" cy="150" rx="88" ry="120" stroke="#e7ede5" transform="rotate(-28 170 150)" />
                  <path d="M45 195 C95 195 105 90 160 112 S235 210 295 72" stroke="#b9d1bc" strokeDasharray="4 6" />
                  <circle cx="45" cy="195" r="4" fill="#059669" />
                  <circle cx="160" cy="112" r="4" fill="#059669" />
                  <circle cx="295" cy="72" r="4" fill="#059669" />
                </motion.svg>
                <motion.div
                  animate={reduce ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-card z-10 w-[78%] max-w-[250px] border border-[#e8ece6] bg-white p-4 shadow-[0_16px_50px_-30px_rgba(25,60,35,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                      <FaWhatsapp className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand">Zenoway community</p>
                      <p className="mt-1 text-sm font-medium text-text-primary">Find your people.</p>
                    </div>
                  </div>
                  <div className="my-4 h-px bg-border-subtle" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-pill bg-brand" />
                      <span className="h-2 w-24 bg-surface-muted" />
                      <span className="ml-auto text-[10px] text-text-muted">Jobs</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-pill bg-brand-accent" />
                      <span className="h-2 w-16 bg-surface-muted" />
                      <span className="ml-auto text-[10px] text-text-muted">Groups</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-pill bg-border-strong" />
                      <span className="h-2 w-20 bg-surface-muted" />
                      <span className="ml-auto text-[10px] text-text-muted">Updates</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="order-first min-w-0 lg:py-4">
                <motion.span initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                  <FiUsers className="h-3.5 w-3.5 text-brand" /> ZENOWAY COMMUNITY
                </motion.span>
                <motion.h1 initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.04, ease: EASE }} className="mt-4 max-w-[680px] text-[40px] font-medium leading-[1.12] tracking-[-0.045em] sm:text-[48px] lg:text-[54px] text-text-primary">
                  Your next opportunity starts{" "}
                  <span className="text-brand">with community.</span>
                </motion.h1>
                <motion.p initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1, ease: EASE }} className="mt-4 max-w-[510px] text-[15px] leading-7 text-text-secondary sm:text-base">
                  Find job communities by category and state, or follow the channel
                  for important alerts and updates.
                </motion.p>
                <motion.div initial={reduce ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.16, ease: EASE }} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    onClick={openGroupModal}
                    className="group inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 self-start rounded-control bg-brand px-4 py-3 text-xs font-semibold text-text-inverse shadow-subtle transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <FaWhatsapp className="h-4 w-4" />
                    <span>WhatsApp Groups</span>
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannelModalOpen(true)}
                    className="group inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 self-start rounded-control border border-border-default px-4 py-3 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <HiOutlineSpeakerphone className="h-4 w-4 text-brand" />
                    <span>WhatsApp Channel</span>
                    <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
                <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.22 }} className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-text-secondary">
                  <span className="inline-flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-brand" /> Direct WhatsApp links</span>
                  <span className="inline-flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-brand" /> Pick your field</span>
                  <span className="inline-flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-brand" /> Easy to join</span>
                </motion.div>
              </div>
            </div>
          </header>

          <motion.section initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.18, ease: EASE }} className="mt-7 grid grid-cols-1 divide-y divide-border-default border-y border-border-default sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-4 py-5 sm:px-5 sm:first:pl-0">
              <span className="text-2xl font-semibold tracking-tight text-text-primary">
                {categories.length}
              </span>
              <span className="text-sm text-text-secondary">Job categories</span>
            </div>
            <div className="flex items-center gap-4 py-5 sm:px-5">
              <FiMapPin className="h-5 w-5 text-brand" />
              <span className="text-sm text-text-secondary">
                State-based communities
              </span>
            </div>
            <div className="flex items-center gap-4 py-5 sm:px-5">
              <FaWhatsapp className="h-5 w-5 text-brand" />
              <span className="text-sm text-text-secondary">
                Direct WhatsApp access
              </span>
            </div>
          </motion.section>

          {/* Community benefits */}
          <section className="py-14 sm:py-16 lg:py-20" aria-labelledby="benefits-title">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">A community that moves you forward</p>
              <h2 id="benefits-title" className="mt-3 text-2xl font-medium tracking-tight text-text-primary sm:text-3xl">
                More than job links. A place to find your next step.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
                Find relevant opportunities and stay connected with updates that match your career interests.
              </p>
            </div>

            <div className="mt-8 grid gap-7 border-y border-border-default py-7 sm:grid-cols-3 sm:gap-8">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand"><FiBriefcase className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-semibold text-text-primary">Relevant opportunities</h3><p className="mt-1.5 text-sm leading-6 text-text-secondary">Explore job communities connected to your field and interests.</p></div>
              </div>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand"><FiBell className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-semibold text-text-primary">Useful updates</h3><p className="mt-1.5 text-sm leading-6 text-text-secondary">Follow the channel for job alerts and important Zenoway announcements.</p></div>
              </div>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand"><FiMessageCircle className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-semibold text-text-primary">A focused community</h3><p className="mt-1.5 text-sm leading-6 text-text-secondary">Choose a group by category and state, then join directly on WhatsApp.</p></div>
              </div>
            </div>
          </section>

          {/* Find your community */}
          <section className="pb-14 sm:pb-16 lg:pb-20" aria-labelledby="categories-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Explore by interest</p>
                <h2 id="categories-title" className="mt-3 text-2xl font-medium tracking-tight text-text-primary sm:text-3xl">Find your community</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary sm:text-base">Start with a field that fits you. You can choose an available state or group next.</p>
              </div>
              <button type="button" onClick={openGroupModal} className="cursor-pointer inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-control border border-border-default px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand hover:text-brand sm:self-auto">
                View all communities <FiArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-7 grid gap-0 border-y border-border-default sm:grid-cols-2 sm:border-b-0 lg:grid-cols-3">
              {categories.slice(0, 6).map((category, index) => (
                <button key={category.name} type="button" onClick={() => openGroupModalForCategory(category.name)} className={`group flex min-h-[126px] cursor-pointer items-start gap-4 border-b border-border-default py-5 text-left transition-colors hover:bg-brand-subtle sm:px-4 ${index % 2 === 0 ? "sm:border-r lg:border-r" : ""} lg:border-r ${index % 3 === 2 ? "lg:border-r-0" : ""}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand transition-colors group-hover:bg-brand-soft-hover"><FiCompass className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-text-primary">{category.name}</span>
                    <span className="mt-1.5 block text-sm leading-6 text-text-secondary">{category.description || `Explore ${category.name.toLowerCase()} communities and available groups.`}</span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">Explore community <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </button>
              ))}
            </div>
            {categories.length > 6 && <p className="mt-4 text-xs text-text-muted">Showing a selection of categories. Use “View all communities” to browse every available option.</p>}
          </section>

          {/* Groups vs channel */}
          <section className="border-y border-border-default py-12 sm:py-14" aria-labelledby="choose-title">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Choose what works for you</p>
              <h2 id="choose-title" className="mt-3 text-2xl font-medium tracking-tight text-text-primary sm:text-3xl">WhatsApp group or channel?</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary sm:text-base">Both keep you connected to Zenoway. Pick the experience you prefer.</p>
            </div>
            <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-control bg-brand-soft text-brand"><FaWhatsapp className="h-5 w-5" /></span><h3 className="text-base font-semibold text-text-primary">Community groups</h3></div>
                <p className="mt-3 text-sm leading-6 text-text-secondary">Best when you want to find a community for a particular job category or state.</p>
                <button type="button" onClick={openGroupModal} className="cursor-pointer mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover">Find a group <FiArrowRight className="h-4 w-4" /></button>
              </div>
              <div>
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-control bg-brand-soft text-brand"><HiOutlineSpeakerphone className="h-6 w-6" /></span><h3 className="text-base font-semibold text-text-primary">Updates channel</h3></div>
                <p className="mt-3 text-sm leading-6 text-text-secondary">Best for one-way job alerts, platform announcements, and new community updates without group chat noise.</p>
                <button type="button" onClick={() => setChannelModalOpen(true)} className="cursor-pointer mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover">Explore the channel <FiArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </section>

          {/* How to get started */}
          <section className="py-14 sm:py-16 lg:py-20" aria-labelledby="steps-title">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Simple to join</p>
              <h2 id="steps-title" className="mt-3 text-2xl font-medium tracking-tight text-text-primary sm:text-3xl">Your community is three steps away</h2>
            </div>
            <div className="mt-8 grid gap-7 sm:grid-cols-3 sm:gap-8">
              {[
                { number: "01", title: "Choose your field", description: "Pick the career category that best matches your interests." },
                { number: "02", title: "Select a group", description: "Choose an available state or community from the list." },
                { number: "03", title: "Join on WhatsApp", description: "Open the direct invite link and join the community." },
              ].map((step) => (
                <div key={step.number} className="border-t border-border-default pt-4">
                  <span className="text-xs font-semibold tracking-[0.12em] text-brand">{step.number}</span>
                  <h3 className="mt-3 text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4 border-t border-border-default pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-6 text-text-secondary">Ready to find your people? Explore the available groups and choose the one that fits.</p>
              <button type="button" onClick={openGroupModal} className="cursor-pointer inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover">Find a community <FiArrowRight className="h-4 w-4" /></button>
            </div>
          </section>

          <footer className="mt-2 mb-8 flex flex-col items-center justify-between gap-3 border-t border-border-default pt-5 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-text-muted">More job communities and state groups are being added regularly.</p>
            <span className="text-xs font-medium text-text-muted">Built for your next step</span>
          </footer>
        </div>
      </div>

      <Modal
        open={groupModalOpen}
        onClose={closeGroupModal}
        labelledBy="group-modal-title"
      >
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
              <FaWhatsapp className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand">Find your community</p>
              <h2 id="group-modal-title" className="mt-1 text-lg font-semibold tracking-tight text-text-primary sm:text-xl">Join a WhatsApp group</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-5 text-text-muted">
            Choose a job category and state to find the right group.
          </p>
          <div className="mt-5 space-y-4">
            <FieldSelect
              label="1. Choose a job category"
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setSelectedGroupName("");
                setQuery("");
              }}
              placeholder="Select category"
              options={categories.map((category) => ({
                label: category.name,
                value: category.name,
              }))}
            />
            <FieldSelect
              label="2. Choose a state / group"
              value={selectedGroupName}
              onChange={setSelectedGroupName}
              placeholder={
                selectedCategory
                  ? "Select state or group"
                  : "Choose a category first"
              }
              disabled={!selectedCategory}
              options={availableGroups.map((group) => ({
                label: group.name,
                value: group.name,
              }))}
            />
          </div>
          {selectedCategory && availableGroups.length > 5 && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-text-primary">
                Or search available groups
              </label>
              <div className="flex items-center gap-2 rounded-control border border-border-default px-3 py-2.5 focus-within:border-border-focus focus-within:ring-2 focus-within:ring-focus-ring">
                <FiSearch className="h-4 w-4 text-text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search state or group"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
              {query.trim() && (
                <div className="mt-2 max-h-36 overflow-y-auto border-y border-border-default">
                  {filteredGroups.map((group) => (
                    <button
                      key={group.link}
                      type="button"
                      onClick={() => {
                        setSelectedGroupName(group.name);
                        setQuery("");
                      }}
                      className="block w-full cursor-pointer border-b border-border-subtle px-3 py-3 text-left text-sm last:border-0 hover:bg-surface-subtle hover:text-brand"
                    >
                      {group.name}
                    </button>
                  ))}
                  {filteredGroups.length === 0 && (
                    <p className="p-3 text-sm text-text-muted">
                      No matching groups found.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {selectedCategory && selectedGroup && (
            <GroupResult
              group={selectedGroup}
              category={selectedCategory}
              onCopy={copyLink}
              copied={copied === selectedGroup.link}
              onShare={shareLink}
            />
          )}
          {selectedCategory && !selectedGroup && (
            <p className="mt-4 bg-surface-subtle px-3 py-3 text-sm leading-5 text-text-secondary rounded-control">
              {availableGroups.length
                ? "Select a state or group above to see its details and join link."
                : "No groups have been added to this category yet."}
            </p>
          )}
          <button
            type="button"
            onClick={closeGroupModal}
            className="mt-3 w-full cursor-pointer rounded-control px-3 py-2.5 text-sm font-medium text-text-muted transition hover:bg-surface-subtle hover:text-text-primary"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal
        open={channelModalOpen}
        onClose={closeChannelModal}
        labelledBy="channel-modal-title"
      >
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-pill bg-brand-soft text-brand">
            <HiOutlineSpeakerphone className="h-8 w-8" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Stay in the loop
          </p>
          <h2
            id="channel-modal-title"
            className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
          >
            {channel.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            {channel.description}
          </p>
          <div className="mt-6 rounded-panel bg-surface-subtle p-4 text-left border border-border-default">
            <p className="text-sm font-semibold text-text-primary">
              What you’ll get
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{" "}
                Job alerts and announcements
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{" "}
                New category and community updates
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{" "}
                One-way updates without group chat noise
              </li>
            </ul>
          </div>
          <a
            href={channel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-subtle transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            <FaWhatsapp className="h-5 w-5" /> Join WhatsApp Channel{" "}
            <FiArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={closeChannelModal}
            className="mt-3 w-full cursor-pointer rounded-control px-3 py-2.5 text-sm font-medium text-text-muted transition hover:bg-surface-subtle hover:text-text-primary"
          >
            Maybe later
          </button>
        </div>
      </Modal>

      <SiteFooter />
    </>
  );
}
