"use client";

import type { PosterTemplateId } from "@/lib/job-posters/poster-utils";

export function TemplateThumbnail({
  template,
  active,
}: {
  template: PosterTemplateId;
  active: boolean;
}) {
  const frameClass = `relative aspect-[4/5] w-11 shrink-0 overflow-hidden rounded-none border bg-white ${
    active ? "border-brand ring-1 ring-brand/30" : "border-border-default"
  }`;

  if (template === "bold") {
    return (
      <div
        className={`${frameClass} border-[#087F50] bg-[#077D4E]`}
        aria-hidden="true"
      >
        <div className="relative flex h-full flex-col justify-between p-1.5">
          <div className="flex items-center justify-between">
            <span className="h-1 w-4 rounded-[1px] bg-white" />
            <span className="h-0.5 w-2 bg-white/70" />
          </div>
          <div className="my-auto space-y-0.5">
            <span className="block h-1.5 w-5 rounded-[1px] bg-[#B8FF3B]" />
            <span className="block h-1.5 w-6 rounded-[1px] bg-[#B8FF3B]" />
            <span className="mt-1 block h-1 w-7 rounded-[1px] bg-white/90" />
            <div className="flex gap-1 pt-1">
              <span className="h-0.5 w-3 bg-[#B8FF3B]" />
              <span className="h-0.5 w-2.5 bg-white/80" />
            </div>
            <span className="mt-1 block h-0.5 w-4 bg-white/50" />
          </div>
          <span className="absolute right-1 top-5 h-3 w-3 rounded-full bg-white/20 ring-1 ring-white/40" />
          <div className="flex items-center justify-between border-t border-white/25 pt-1">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-[1px] bg-white" />
              <span className="h-1 w-2.5 rounded-[1px] bg-[#B8FF3B]" />
            </div>
            <span className="h-1 w-2 rounded-[1px] bg-white/70" />
          </div>
        </div>
      </div>
    );
  }

  if (template === "portrait") {
    return (
      <div className={`${frameClass} bg-[#D8CFCA]`} aria-hidden="true">
        <div className="flex h-full w-full">
          {/* Left: Warm editorial text column */}
          <div className="flex w-1/2 h-full flex-col justify-between p-1 border-r border-[#C5BCB6]">
            <div>
              <span className="block h-1 w-2.5 rounded-[1px] bg-[#102B20]" />
              <span className="mt-1 block h-0.5 w-3 bg-[#064E3B]" />
            </div>
            <div className="space-y-0.5">
              <span className="block h-1.5 w-4 rounded-[1px] bg-[#102B20]" />
              <span className="block h-1.5 w-3.5 rounded-[1px] bg-[#102B20]" />
              <span className="block h-0.5 w-4 bg-[#384B40]" />
            </div>
            <div>
              <span className="block h-1 w-3.5 rounded-full bg-[#064E3B]" />
            </div>
          </div>
          {/* Right: Studio portrait representation */}
          <div className="relative w-1/2 h-full bg-[#9B8C82] flex items-center justify-center overflow-hidden">
            <div className="h-3.5 w-3.5 rounded-full bg-[#DFD6CE]/80" />
            <div className="absolute -bottom-1 h-3.5 w-5 rounded-t-full bg-[#064E3B]" />
          </div>
        </div>
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div className={`${frameClass} bg-[#FAFDFB]`} aria-hidden="true">
        <div className="flex h-full flex-col justify-between p-1.5">
          <div className="flex items-center justify-between border-b border-[#DDE8DF] pb-1">
            <span className="h-1 w-4 rounded-[1px] bg-[#12231B]" />
            <span className="h-1 w-1 rounded-full bg-[#0FA968]" />
          </div>
          <div className="my-auto space-y-1">
            <span className="block h-1.5 w-4 rounded-[1px] bg-[#12231B]" />
            <span className="block h-1.5 w-6 rounded-[1px] bg-[#087F50]" />
            <span className="block h-1 w-7 rounded-[1px] bg-[#12231B]/70" />
            <span className="block h-2 w-0.5 bg-[#087F50]" />
          </div>
          <div className="flex items-center justify-between border-t border-[#DDE8DF] pt-1">
            <span className="h-2 w-2 rounded-[1px] bg-[#12231B]/85" />
            <span className="h-1 w-3 rounded-[1px] bg-[#087F50]/70" />
          </div>
        </div>
      </div>
    );
  }

  if (template === "corporate") {
    return (
      <div className={`${frameClass} bg-[#F8FBF9]`} aria-hidden="true">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-[#0FA968] bg-[#0C2D20] px-1.5 py-1.5">
            <span className="h-1.5 w-4 rounded-[1px] bg-white" />
            <span className="h-1 w-2 rounded-[1px] bg-[#9DD6B9]" />
          </div>
          <div className="space-y-1 px-1.5">
            <span className="block h-1.5 w-4 rounded-[1px] bg-[#12231B]" />
            <span className="block h-1.5 w-6 rounded-[1px] bg-[#087F50]" />
            <span className="block h-1 w-7 rounded-[1px] bg-[#12231B]/75" />
            <div className="grid grid-cols-3 border-y border-[#B7D1BE] py-1">
              <span className="h-1.5 border-r border-[#C8DDD0]" />
              <span className="h-1.5 border-r border-[#C8DDD0]" />
              <span className="h-1.5" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#B7D1BE] bg-[#E8F4ED] px-1.5 py-1">
            <span className="h-2 w-2 rounded-[1px] bg-[#0C2D20]" />
            <span className="h-1 w-3 rounded-[1px] bg-[#087F50]/75" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${frameClass} bg-[#0B241A]`} aria-hidden="true">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between bg-[#087F50] px-1.5 py-1">
          <span className="h-1 w-3 rounded-[1px] bg-white" />
          <span className="h-1 w-2.5 rounded-[1px] bg-[#34F09A]" />
        </div>
        <div className="space-y-1 px-1.5">
          <span className="block h-1.5 w-4 rounded-[1px] bg-[#34F09A]" />
          <span className="block h-1.5 w-6 rounded-[1px] bg-[#34F09A]" />
          <span className="block h-1 w-7 rounded-[1px] bg-white" />
          <div className="flex gap-1 border-t border-white/15 pt-1">
            <span className="h-0.5 w-3.5 bg-white/80" />
            <span className="h-0.5 w-3.5 bg-[#34F09A]" />
          </div>
        </div>
        <div className="flex items-center justify-between bg-white px-1.5 py-1">
          <span className="h-2 w-2 rounded-[1px] bg-[#0B241A]" />
          <span className="h-1 w-3 rounded-[1px] bg-[#087F50]" />
        </div>
      </div>
    </div>
  );
}
