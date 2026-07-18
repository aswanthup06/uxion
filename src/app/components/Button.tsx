import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-ink text-canvas hover:bg-accent",
    secondary: "border border-line hover:border-ink",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}
