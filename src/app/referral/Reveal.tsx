"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades/slides children in once when they scroll into view.
 *  Also exposes data-in="true" so children can react via group-data-[in=true]:. */
export default function Reveal({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { threshold: 0.2 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            data-in={inView}
            style={{ transitionDelay: `${delay}ms` }}
            className={`group transition-all duration-700 ease-[var(--ease-smooth)] ${inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                } ${className}`}
        >
            {children}
        </div>
    );
}
