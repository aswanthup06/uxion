"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HiOutlineHome,
  HiHome,
  HiOutlineBriefcase,
  HiBriefcase,
  HiOutlineUserGroup,
  HiUserGroup,
} from "react-icons/hi2";
import { RiHome9Fill } from "react-icons/ri";

import { CgAlignBottom } from "react-icons/cg";
import { RiHome9Line } from "react-icons/ri";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: <RiHome9Line className="text-lg" />,
      activeIcon: <RiHome9Fill className="text-lg" />,
    },
    {
      name: "Jobs",
      href: "/home/jobs",
      icon: <HiOutlineBriefcase className="text-lg" />,
      activeIcon: <HiBriefcase className="text-lg" />,
    },
    {
      name: "Community",
      href: "/home/join",
      icon: <HiOutlineUserGroup className="text-lg" />,
      activeIcon: <HiUserGroup className="text-lg" />,
    },
  ];

  return (
<nav
  className="
    fixed bottom-0 left-0 z-50
    w-full h-16 bg-white border-t border-gray-200
    flex items-center justify-around

    lg:static lg:h-auto lg:w-62 lg:border-0
    lg:block lg:py-2 lg:pl-2
    transition-all duration-300
  "
>
  {/* Logo */}
  <div className="hidden lg:flex items-center justify-between px-4 lg:px-6 py-4">
    <Link href="/home">
      <div className="flex items-center gap-2 cursor-pointer">
        <CgAlignBottom className="text-xl shrink-0" />

        <span className="text-sm font-bold tracking-wide">
          ZE<span className="text-[#F97316]">NO</span>WAY
        </span>
      </div>
    </Link>
  </div>

  {/* Welcome */}
  <div className="hidden lg:block px-6 py-6">
    <h2 className="font-semibold text-xl leading-snug text-gray-900">
      Find work that fits your life
    </h2>

    <p className="text-xs mt-3 text-gray-500 leading-relaxed">
      Discover remote jobs and modern career opportunities.
    </p>
  </div>

  {/* Navigation */}
  <div
    className="
      flex items-center justify-around w-full

      lg:flex-col lg:gap-1 lg:px-3
    "
  >
    {navItems.map((item) => {
      const isActive =
        item.href === "/home"
          ? pathname === "/home"
          : pathname.startsWith(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`
            flex flex-col items-center justify-center gap-1
            text-xs transition-all duration-200
            w-full h-16

            lg:h-12 lg:px-4 lg:rounded-full
            lg:flex-row lg:justify-start lg:gap-3

            ${
              isActive
                ? "text-black lg:bg-black lg:text-white"
                : "text-gray-500 hover:text-black"
            }
          `}
        >
          {isActive ? item.activeIcon : item.icon}

          <span className="text-[11px] lg:text-sm font-medium leading-none">
            {item.name}
          </span>
        </Link>
      );
    })}
  </div>
</nav>
  );
}