import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-control text-sm font-medium transition-colors duration-normal ease-standard outline-none";
  const variants = {
    primary:
      "bg-brand text-text-inverse hover:bg-brand-hover shadow-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    secondary:
      "border border-border-default bg-surface-base text-text-primary hover:border-border-strong hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}
