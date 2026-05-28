"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function SharePage() {
  const groups = [
    {
      name: "Kerala Jobs Group",
      link: "https://chat.whatsapp.com/KZos56C8RXIAs1PsvwMeH4",
    },
    {
      name: "India Remote Jobs",
      link: "https://chat.whatsapp.com/KQh0RqyGEZY44sVhxikzX6",
    },
  ];

  return (
    <div className="h-full px-4 py-10">
      <div className="max-w-xl mx-auto">
        
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            Join Job Communities
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed">
            Get daily remote jobs, UI/UX openings, developer jobs, and startup
            opportunities directly on WhatsApp.
          </p>
        </div>

        {/* Group List */}
        <div className="space-y-4">
          {groups.map((group, index) => (
            <a
              key={index}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-green-500 transition-all duration-200"
            >
              <div>
                <h2 className="font-medium text-gray-900">
                  {group.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Join the WhatsApp community
                </p>
              </div>

              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                <FaWhatsapp className="text-green-600 text-xl" />
              </div>
            </a>
          ))}
        </div>
        {/* <div className="mt-8">
          <Link
            href="/o"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Back to jobs
          </Link>
        </div> */}
      </div>
    </div>
  );
}