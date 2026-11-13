import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Job Communities | Zenoway",
  description:
    "Join verified WhatsApp job communities and get alerts for UI/UX, frontend, and tech opportunities across India.",
  alternates: {
    canonical: "https://www.zenoway.online/join",
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

