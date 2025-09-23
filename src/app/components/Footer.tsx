import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0B1F38] ">
      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6">
        {/* Left Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            UX<span className="text-[#F97316]">Curve</span>
          </h2>
          <p className="text-gray-200/60 mt-2 font-extralight">
            Your curve to a better design career. We connect UI/UX designers
            with hiring teams worldwide.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:items-end">
          <div>
            <h3 className="text-gray-200 font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2 text-gray-200/60 grid grid-cols-2">
              <li>
                <Link href="/about" className="hover:text-blue-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link href="/post-job" className="hover:text-blue-600">
                  Post Job
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-blue-600">
                  Join Whatsapp
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="py-4 text-center text-xs font-extralight text-gray-300/30">
        © {new Date().getFullYear()} UXCurve. All rights reserved.
      </div>
    </footer>
  );
}
