"use client";

import { useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { Eyebrow } from "../../components/Eyebrow";
import { CATEGORIES } from "./job-communities";

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
    <div className="w-full">
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
                          dragStart.current.scrollLeft
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

          {activeCategory !== "UI/UX & Design" && (
            <span className="whitespace-nowrap font-mono text-xs text-warn">
              links not added
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {active.groups.map((group) => (
            <a
              key={group.name}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <FaWhatsapp className="text-lg text-green-600" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-medium text-ink break-words">
                  {group.name}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-muted break-words">
                  {group.description}
                </p>
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