import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-text-inverse">
      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6">
        {/* Left Section */}
        <div>
          <h1 className="text-sm font-bold text-text-inverse leading-none">
            ZE<span className="text-brand-accent">NO</span>WAY
          </h1>
          <p className="text-text-muted mt-6 font-normal">
            Your curve to a better design career. We connect UI/UX designers
            with hiring teams worldwide.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:items-end">
          <div>
            <h3 className="text-text-inverse font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2 text-text-muted grid grid-cols-2 gap-x-6">
              <li>
                <Link href="/about" className="hover:text-brand-accent">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-accent">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-brand-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-accent">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link href="/post-job" className="hover:text-brand-accent">
                  Post Job
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-brand-accent">
                  Join Whatsapp
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="py-4 text-center text-xs text-text-muted border-t border-brand-dark/40">
        © {new Date().getFullYear()} zenoway. All rights reserved.
      </div>
    </footer>
  );
}
