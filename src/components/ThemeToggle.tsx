"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const iconSize = size === "sm" ? 17 : 19;
  const buttonDimensions = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-control bg-transparent text-text-muted opacity-40 ${buttonDimensions} ${className}`}
        aria-hidden="true"
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex items-center justify-center rounded-control bg-transparent text-text-secondary transition-colors duration-150 hover:bg-surface-subtle hover:text-text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${buttonDimensions} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Moon size={iconSize} strokeWidth={1.8} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Sun size={iconSize} strokeWidth={1.8} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
