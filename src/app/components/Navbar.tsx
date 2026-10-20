"use client";

import React from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  let title: string | null = null;

  switch (true) {
    case pathname === "/home/jobs":
      title = "All Jobs";
      break;

    case pathname === "/home/join":
      title = "Community";
      break;

    case /^\/home\/jobs\/[^/]+$/.test(pathname):
      title = "Job Details";
      break;

    default:
      title = null; 
  }

  return (
    <div className="h-[48px] border-b border-gray-200 w-full bg-white flex justify-between items-center p-1">
      <div className="flex h-full items-center gap-2">
      <button className="h-full aspect-square hover:bg-gray-100 flex justify-center items-center cursor-pointer">
        <IoChevronBackSharp />
      </button>

      {title && <h2 className="font-medium text-sm">{title}</h2>}</div>

      <button className="h-full bg-black text-white px-7 text-sm">
        Login
      </button>
    </div>
  );
}