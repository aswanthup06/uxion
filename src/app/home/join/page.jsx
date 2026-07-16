"use client";

import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineSpeakerphone } from "react-icons/hi";

export default function SharePage() {
  const channel = {
    name: "Zenoway Updates Channel",
    description: "All job categories, alerts, and platform updates — one-way broadcast",
    link: "https://whatsapp.com/channel/0029VbC4AMcJpe8dy0vGfc1x",
  };

  const groups = [
    {
      name: "Kerala Jobs Group",
      description: "Kochi, Kozhikode, Thiruvananthapuram, Thrissur, Kollam",
      link: "https://chat.whatsapp.com/KZos56C8RXIAs1PsvwMeH4",
    },
    {
      name: "India Remote Jobs",
      description: "Remote openings across India",
      link: "https://chat.whatsapp.com/KQh0RqyGEZY44sVhxikzX6",
    },
    {
      name: "Tamil Nadu Jobs Group",
      description: "Chennai, Coimbatore, Tirunelveli, Madurai, Trichy, Salem",
      link: "https://chat.whatsapp.com/I8UpuixA5g27hFnISqPFo1",
    },
    {
      name: "Uttar Pradesh Jobs Group",
      description: "Noida, Greater Noida, Ghaziabad, Lucknow, Kanpur, Agra, Prayagraj",
      link: "https://chat.whatsapp.com/Had2rAA9b7eDMC3nvMktW7",
    },
    {
      name: "Karnataka Jobs Group",
      description: "Bangalore, Mangalore, Mysore, Hubli-Dharwad, Belgaum",
      link: "https://chat.whatsapp.com/Foelmp0RLPWAEHw7YEygUJ",
    },
    {
      name: "Maharashtra Jobs Group",
      description: "Pune, Mumbai, Navi Mumbai, Thane, Nagpur, Nashik",
      link: "https://chat.whatsapp.com/EkscWFIRJ0iIlsuH20zQY3",
    },
    {
      name: "Telangana Jobs Group",
      description: "Hyderabad, Warangal, Nizamabad, Khammam",
      link: "https://chat.whatsapp.com/E2OPbNEiDJbEzJ8EsmKkHb",
    },
    {
      name: "Delhi NCR Jobs Group",
      description: "Delhi, Gurgaon, Faridabad",
      link: "https://chat.whatsapp.com/K9IrBwMERm2LSnFYU7YvAT",
    },
  ];

  return (
    <div className="min-h-full px-6 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-900">
            Join Job Communities
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Get daily remote jobs, UI/UX openings, developer jobs, and startup
            opportunities directly on WhatsApp.
          </p>
        </div>

        {/* Channel - full width, distinct treatment */}
            <a
          href={channel.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between hover:border-green-500 transition-all duration-200 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <HiOutlineSpeakerphone className="text-white text-2xl" />
            </div>
            <div>
              <span className="inline-block text-[11px] font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5 mb-1">
                All job categories
              </span>
              <h2 className="font-semibold text-gray-900 text-lg">
                {channel.name}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {channel.description}
              </p>
            </div>
          </div>
        </a>

        {/* Groups section header */}
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            UI/UX designer job groups
          </h2>
          <span className="text-xs text-gray-400">
            More categories coming soon
          </span>
        </div>

        {/* Group List - responsive grid, uses the extra width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => (
            <a
              key={index}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 hover:border-green-500 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <FaWhatsapp className="text-green-600 text-lg" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {group.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {group.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}