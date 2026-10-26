
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Instagram } from "lucide-react";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      ["/jobs", "Browse jobs"],
      ["/jobs", "Browse by stack"],
      ["/join", "Join community"],
    ],
  },
  {
    title: "Zenoway",
    links: [
      ["/about", "About us"],
      ["/contact", "Get in touch"],
      ["/email", "Email guide"],
    ],
  },
  {
    title: "Information",
    links: [
      ["/privacy-policy", "Privacy policy"],
      ["/terms", "Terms of service"],
    ],
  },
] as const;

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/zenoway",
    Icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/zenoway_career/",
    Icon: Instagram,
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border-default bg-surface-base px-5 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              aria-label="Zenoway home"
              className="inline-flex items-center gap-2"
            >
             <Image
  src="/logo.png"
  alt="Zenoway logo"
  width={300}
  height={100}
  className="h-6 w-auto object-contain"
/>

              <span className="text-xl font-bold tracking-tight text-text-primary">
                zenoway
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-text-secondary">
              A job board for UI/UX designers, frontend developers, and
              creative technologists across India.
            </p>

            {/* Social links */}
            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Zenoway on ${label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle hover:text-brand"
                >
                  <Icon size={18} strokeWidth={1.7} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {COLUMNS.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h3 className="mb-4 text-sm font-semibold text-text-primary">
                {title}
              </h3>

              <ul className="space-y-3">
                {links.map(([href, label]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-text-secondary transition-colors hover:text-brand"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col gap-2 border-t border-border-default pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Zenoway. All rights reserved.
          </p>

          <p>Made for designers &amp; developers in India.</p>
        </div>
      </div>
    </footer>
  );
}
