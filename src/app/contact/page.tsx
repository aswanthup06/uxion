"use client";

import { Mail, Globe, MessageCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* Nav */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 pl-2.5 pr-4 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span>Back</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 pl-2.5 pr-4 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
        >
          <Home size={15} strokeWidth={2} />
          <span>Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
          Get in touch
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-3 text-gray-900">
          Contact Us
        </h1>
        <p className="text-gray-500 leading-7 max-w-xl">
          We&apos;d love to hear from you. Whether it&apos;s a question, feedback,
          or a partnership idea — reach out and our team will get back to you
          soon.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <a
          href="mailto:support@zenoway.com"
          className="group flex items-start gap-4 p-5 border border-gray-200 rounded-sm hover:border-amber-600 transition-colors"
        >
          <div className="p-2.5 bg-amber-50 rounded-sm text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Mail size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Email</h2>
            <p className="text-sm text-gray-500 break-all">
              support@zenoway.com
            </p>
          </div>
        </a>

        <a
          href="https://zenoway.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 p-5 border border-gray-200 rounded-sm hover:border-amber-600 transition-colors"
        >
          <div className="p-2.5 bg-amber-50 rounded-sm text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Globe size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Website</h2>
            <p className="text-sm text-gray-500">www.zenoway.com</p>
          </div>
        </a>
      </div>

      {/* Optional community link */}
      <Link
        href="/home/join"
        className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-100 transition mb-10"
      >
        <MessageCircle size={16} strokeWidth={1.75} />
        <span>Join our Community</span>
      </Link>

      <p className="text-sm text-gray-400 text-center">
        Our team typically responds within 24–48 hours.
      </p>
    </main>
  );
}