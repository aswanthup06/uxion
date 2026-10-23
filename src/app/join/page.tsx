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
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
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
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:rounded-xl sm:border sm:border-slate-200 sm:p-6"
          >
            <div className="mb-5 flex justify-end">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="cursor-pointer grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <FiX className="h-5 w-5" />
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
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3.5 pr-11 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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
      className="mt-5 rounded-lg bg-slate-50 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <FaWhatsapp className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            {category}
          </span>
          <h3 className="mt-2 break-words text-lg font-bold text-slate-900">
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
        className="cursor-pointer mt-4 inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <FaWhatsapp className="h-5 w-5" /> Join WhatsApp group{" "}
        <FiArrowUpRight className="h-4 w-4" />
      </a>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(group.link)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
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
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
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
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 sm:py-1">
        <header className="relative isolate bg-white px-0 py-8 text-slate-950 sm:py-12 lg:py-14">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-emerald-700">
            <FiUsers className="h-3.5 w-3.5" /> ZENOWAY COMMUNITY
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Your next opportunity starts{" "}
            <span className="text-emerald-700">with community.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Find job communities by category and state, or follow the channel
            for important alerts and updates.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7">
            <button
              type="button"
              onClick={openGroupModal}
              className="cursor-pointer group inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-sm bg-emerald-700 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <FaWhatsapp className="h-4 w-4" />
              <span>WhatsApp Groups</span>
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => setChannelModalOpen(true)}
              className="group inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-sm border border-slate-300 px-4 py-3 cursor-pointer text-xs font-semibold text-slate-800 transition-colors hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <HiOutlineSpeakerphone className="h-4 w-4 text-emerald-700" />
              <span>WhatsApp Channel</span>
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <FiCheckCircle className="h-4 w-4 text-emerald-700" /> Direct
              WhatsApp links
            </span>
            <span className="inline-flex items-center gap-2">
              <FiCheckCircle className="h-4 w-4 text-emerald-700" /> Pick your
              field
            </span>
            <span className="inline-flex items-center gap-2">
              <FiCheckCircle className="h-4 w-4 text-emerald-700" /> Easy to
              join
            </span>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-4 py-5 sm:px-5 sm:first:pl-0">
            <span className="text-2xl font-semibold tracking-tight text-slate-950">
              {categories.length}
            </span>
            <span className="text-sm text-slate-500">Job categories</span>
          </div>
          <div className="flex items-center gap-4 py-5 sm:px-5">
            <FiMapPin className="h-5 w-5 text-emerald-700" />
            <span className="text-sm text-slate-600">
              State-based communities
            </span>
          </div>
          <div className="flex items-center gap-4 py-5 sm:px-5">
            <FaWhatsapp className="h-5 w-5 text-emerald-700" />
            <span className="text-sm text-slate-600">
              Direct WhatsApp access
            </span>
          </div>
        </section>

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
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <FaWhatsapp className="h-7 w-7" />
          </span>
          <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Find your community
          </p>
          <h2
            id="group-modal-title"
            className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
          >
            Join a WhatsApp group
          </h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">
            Choose your job category, then select a state or group to see the
            join link.
          </p>
          <div className="mt-7 space-y-4">
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Or search available groups
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50">
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
                      className="block w-full border-b border-slate-100 px-3 py-3 text-left text-sm last:border-0 hover:bg-emerald-50"
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
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {availableGroups.length
                ? "Select a state or group above to see its details and join link."
                : "No groups have been added to this category yet."}
            </p>
          )}
          <button
            type="button"
            onClick={closeGroupModal}
            className="cursor-pointer mt-5 w-full rounded-md px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
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
            className="cursor-pointer mt-6 inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            <FaWhatsapp className="h-5 w-5" /> Join WhatsApp Channel{" "}
            <FiArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={closeChannelModal}
            className="cursor-pointer mt-3 w-full rounded-md px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Maybe later
          </button>
        </div>
      </Modal>


    </main>
  );
}
