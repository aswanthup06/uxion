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
  FiCheckCircle,
  FiChevronDown,
  FiMapPin,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { CATEGORIES } from "./job-communities";

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
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-lg border border-slate-200 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-h-[88dvh] sm:rounded-lg sm:p-6"
          >
            <div className="sticky top-0 z-10 -mx-1 mb-1 flex justify-end bg-white/95 pb-1 backdrop-blur-sm sm:mb-2">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <FiX className="h-[18px] w-[18px]" />
              </button>
            </div>
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
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
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full cursor-pointer appearance-none rounded-md border border-slate-300 bg-white px-3 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
      className="mt-4 border-t border-slate-200 pt-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700">
          <FaWhatsapp className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            {category}
          </span>
          <h3 className="mt-1 break-words text-base font-semibold leading-6 text-slate-900">
            {group.name}
          </h3>
          <p className="mt-1 break-words text-sm leading-6 text-slate-600">
            {group.description}
          </p>
        </div>
      </div>
      <a
        href={group.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <FaWhatsapp className="h-5 w-5" /> Join WhatsApp group{" "}
        <FiArrowUpRight className="h-4 w-4" />
      </a>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(group.link)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          {copied ? (
            <IoCheckmark className="h-4 w-4 text-emerald-600" />
          ) : (
            <BiSolidCopy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={() => onShare(group)}
          className="flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
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
    <main className="min-h-full w-full overflow-y-auto bg-white pb-16 text-slate-900 selection:bg-emerald-100">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 sm:py-1">
        <header className="relative isolate bg-white py-4 text-[#202820] sm:py-6 lg:py-7">
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
                className="relative z-10 w-[78%] max-w-[250px] border border-[#e8ece6] bg-white p-4 shadow-[0_16px_50px_-30px_rgba(25,60,35,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <FaWhatsapp className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">Zenoway community</p>
                    <p className="mt-1 text-sm font-medium text-[#202820]">Find your people.</p>
                  </div>
                </div>
                <div className="my-4 h-px bg-[#edf0eb]" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="h-2 w-24 bg-[#e7ece6]" />
                    <span className="ml-auto text-[10px] text-[#737971]">Jobs</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    <span className="h-2 w-16 bg-[#e7ece6]" />
                    <span className="ml-auto text-[10px] text-[#737971]">Groups</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#b9d1bc]" />
                    <span className="h-2 w-20 bg-[#e7ece6]" />
                    <span className="ml-auto text-[10px] text-[#737971]">Updates</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <div className="order-first min-w-0 lg:py-4">
              <motion.span initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#657267]">
                <FiUsers className="h-3.5 w-3.5 text-emerald-700" /> ZENOWAY COMMUNITY
              </motion.span>
              <motion.h1 initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.04, ease: EASE }} className="mt-4 max-w-[680px] text-[40px] font-medium leading-[1.12] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
                Your next opportunity starts{" "}
                <span className="text-emerald-700">with community.</span>
              </motion.h1>
              <motion.p initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1, ease: EASE }} className="mt-4 max-w-[510px] text-[15px] leading-7 text-[#737971] sm:text-base">
                Find job communities by category and state, or follow the channel
                for important alerts and updates.
              </motion.p>
              <motion.div initial={reduce ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.16, ease: EASE }} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <button
                  type="button"
                  onClick={openGroupModal}
                  className="group inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 self-start rounded-sm bg-emerald-700 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span>WhatsApp Groups</span>
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={() => setChannelModalOpen(true)}
                  className="group inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 self-start rounded-sm border border-slate-300 px-4 py-3 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <HiOutlineSpeakerphone className="h-4 w-4 text-emerald-700" />
                  <span>WhatsApp Channel</span>
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
              <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.22 }} className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#7b8179]">
                <span className="inline-flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-emerald-700" /> Direct WhatsApp links</span>
                <span className="inline-flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-emerald-700" /> Pick your field</span>
                <span className="inline-flex items-center gap-2"><FiCheckCircle className="h-4 w-4 text-emerald-700" /> Easy to join</span>
              </motion.div>
            </div>
          </div>
        </header>

        <motion.section initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.18, ease: EASE }} className="mt-7 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-4 py-5 sm:px-5 sm:first:pl-0">
            <span className="text-2xl font-semibold tracking-tight text-[#202820]">
              {categories.length}
            </span>
            <span className="text-sm text-[#737971]">Job categories</span>
          </div>
          <div className="flex items-center gap-4 py-5 sm:px-5">
            <FiMapPin className="h-5 w-5 text-emerald-700" />
            <span className="text-sm text-[#737971]">
              State-based communities
            </span>
          </div>
          <div className="flex items-center gap-4 py-5 sm:px-5">
            <FaWhatsapp className="h-5 w-5 text-emerald-700" />
            <span className="text-sm text-[#737971]">
              Direct WhatsApp access
            </span>
          </div>
        </motion.section>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-slate-500">
            More job communities and state groups are being added regularly.
          </p>
          <span className="text-xs font-medium text-slate-400">
            Built for your next step
          </span>
        </footer>
      </div>

      <Modal
        open={groupModalOpen}
        onClose={closeGroupModal}
        labelledBy="group-modal-title"
      >
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700">
              <FaWhatsapp className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Find your community</p>
              <h2 id="group-modal-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">Join a WhatsApp group</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-5 text-slate-500">
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
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Or search available groups
              </label>
              <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-50">
                <FiSearch className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search state or group"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              {query.trim() && (
                <div className="mt-2 max-h-36 overflow-y-auto border-y border-slate-200">
                  {filteredGroups.map((group) => (
                    <button
                      key={group.link}
                      type="button"
                      onClick={() => {
                        setSelectedGroupName(group.name);
                        setQuery("");
                      }}
                      className="block w-full cursor-pointer border-b border-slate-100 px-3 py-3 text-left text-sm last:border-0 hover:bg-emerald-50"
                    >
                      {group.name}
                    </button>
                  ))}
                  {filteredGroups.length === 0 && (
                    <p className="p-3 text-sm text-slate-500">
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
            <p className="mt-4 bg-slate-50 px-3 py-3 text-sm leading-5 text-slate-600">
              {availableGroups.length
                ? "Select a state or group above to see its details and join link."
                : "No groups have been added to this category yet."}
            </p>
          )}
          <button
            type="button"
            onClick={closeGroupModal}
            className="mt-3 w-full cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
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
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <HiOutlineSpeakerphone className="h-8 w-8" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Stay in the loop
          </p>
          <h2
            id="channel-modal-title"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
          >
            {channel.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {channel.description}
          </p>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left">
            <p className="text-sm font-semibold text-slate-800">
              What you’ll get
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{" "}
                Job alerts and announcements
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{" "}
                New category and community updates
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{" "}
                One-way updates without group chat noise
              </li>
            </ul>
          </div>
          <a
            href={channel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <FaWhatsapp className="h-5 w-5" /> Join WhatsApp Channel{" "}
            <FiArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={closeChannelModal}
            className="mt-3 w-full cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Maybe later
          </button>
        </div>
      </Modal>


    </main>
  );
}
