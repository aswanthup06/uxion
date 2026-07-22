"use client";

import { useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { Eyebrow } from "../../components/Eyebrow";
import { CATEGORIES } from "./job-communities";
import { IoShareSocial } from "react-icons/io5";
import { BiSolidCopy } from "react-icons/bi";

const channel = {
  name: "Zenoway Updates Channel",
  description:
    "All job categories, alerts, and platform updates — one-way broadcast",
  link: "https://whatsapp.com/channel/0029VbC4AMcJpe8dy0vGfc1x",
};

function ChannelCard() {
  return (
    <a
      href={channel.link}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-10 flex flex-col items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 transition-shadow duration-300 hover:shadow-lg sm:flex-row sm:items-center sm:p-6"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600">
        <HiOutlineSpeakerphone className="text-2xl text-white" />
      </div>

      <div className="min-w-0">
        <span className="mb-1 inline-block rounded-full bg-green-100 px-2 py-0.5 font-mono text-[11px] text-green-700">
          All job categories
        </span>

        <h2 className="font-display text-lg font-semibold text-ink">
          {channel.name}
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-subtle">
          {channel.description}
        </p>
      </div>
    </a>
  );
}

export default function SharePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);

      setTimeout(() => {
        setCopied(null);
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const shareLink = async (group: {
    name: string;
    description: string;
    link: string;
  }) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: group.description,
          url: group.link,
        });
      } catch {}
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `${group.name}\n${group.link}`,
        )}`,
        "_blank",
      );
    }
  };

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);

  const active =
    CATEGORIES.find((c) => c.name === activeCategory) ?? CATEGORIES[0];

  const tabsRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({
    x: 0,
    scrollLeft: 0,
  });

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (e.deltaY === 0) return;

    e.currentTarget.scrollLeft += e.deltaY;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const el = tabsRef.current;

    if (!el) return;

    setIsDragging(true);

    dragStart.current = {
      x: e.pageX,
      scrollLeft: el.scrollLeft,
    };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging || !tabsRef.current) return;

    e.preventDefault();

    const delta = e.pageX - dragStart.current.x;

    tabsRef.current.scrollLeft = dragStart.current.scrollLeft - delta;
  }

  function stopDragging() {
    setIsDragging(false);
  }

  return (
    <div className="w-full bg-canvas">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:py-10 lg:px-8 lg:py-14 lg:pb-8">
        <div className="mb-8 max-w-2xl lg:mb-10">
          <Eyebrow>Community</Eyebrow>

          <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Join Job Communities
          </h1>

          <p className="text-base leading-relaxed text-subtle sm:text-lg">
            Pick your field, then find your state. Every group is a direct
            WhatsApp link — no sign-up required.
          </p>
        </div>

        <ChannelCard />

        <div className="mb-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">
            Choose your field
          </h2>

          <div
            ref={tabsRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            style={{ WebkitOverflowScrolling: "touch" }}
            className={`flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scroll-smooth select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {CATEGORIES.map((cat) => {
              const isActive = cat.name === activeCategory;

              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    const dragged =
                      tabsRef.current &&
                      Math.abs(
                        tabsRef.current.scrollLeft -
                          dragStart.current.scrollLeft,
                      ) > 5;

                    if (!dragged) {
                      setActiveCategory(cat.name);
                    }
                  }}
                  className={`shrink-0 rounded-full border px-4 py-2 font-mono text-sm transition-colors ${
                    isActive
                      ? "border-ink bg-ink text-canvas"
                      : "border-line bg-white text-subtle hover:border-accent hover:text-accent"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-10 rounded-2xl border border-line bg-white p-6">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Roles in {active.name}
          </p>

          <div className="flex flex-wrap gap-2">
            {active.subs.map((sub) => (
              <span
                key={sub}
                className="max-w-full break-words rounded-full bg-line-soft px-3 py-1.5 text-xs font-medium text-ink"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-ink">
            {active.name}
          </h2>

          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {active.groups.map((group) => (
            <a
              key={group.name}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className=" items-start rounded-xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg "
            >
              <div className=" flex justify-between items-center">
                <Eyebrow>{active.name}</Eyebrow>

                <div className="mb-3 flex gap-2">
                  <button
                    title="Share"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      shareLink(group);
                    }}
                    className="group relative flex h-7 w-7 items-center justify-center rounded-full border border-line bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white active:scale-95"
                  >
                    <IoShareSocial className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />

                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Share
                    </span>
                  </button>
                  <button
                    title="Copy Link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyLink(group.link);
                    }}
                    className="group relative flex h-7 w-7 items-center justify-center rounded-full border border-line bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-600 hover:bg-green-600 hover:text-white active:scale-95"
                  >
                    <BiSolidCopy className="h-3.5 w-3.5" />

                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {copied === group.link ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex  gap-3 ">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <FaWhatsapp className="text-lg text-gray-700" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-sm font-medium text-ink break-words">
                    {group.name}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-muted break-words">
                    {group.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center">
          <p className="text-sm text-muted">
            More job communities and state groups are being added regularly.
          </p>
        </div>
      </div>
    </div>
  );
}
