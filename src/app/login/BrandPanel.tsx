
import Link from "next/link";

export default function BrandPanel() {
  return (
    <aside className="relative hidden h-full min-h-0 w-full overflow-hidden rounded-xl bg-[#123F32] p-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      {/* Subtle background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-white/10"
      />

      <Link
        href="/"
        className="relative z-10 w-fit text-2xl font-semibold tracking-tight"
      >
        zenoway
      </Link>

      <div className="relative z-10 my-8 max-w-lg">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-white/60">
          Your next chapter
        </p>

        <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
          Find work that
          <br />
          fits your life.
        </h2>

        <p className="mt-5 max-w-sm text-sm leading-6 text-white/65 xl:text-base">
          Discover meaningful opportunities and take the next
          step in your career, on your terms.
        </p>
      </div>

      <p className="relative z-10 text-xs text-white/45">
        A better way to find your next opportunity.
      </p>
    </aside>
  );
}
