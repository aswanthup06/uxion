"use client";

import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0F172A] text-white px-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-[#F97316] mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-2">404</h1>
        <p className="text-lg text-gray-400 mb-6">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white px-6 py-3 rounded-lg shadow-md transition"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
