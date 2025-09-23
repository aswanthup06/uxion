"use client";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const router = useRouter();

  const groups = [
    {
      name: "Kerala Group",
      link: "https://chat.whatsapp.com/KZos56C8RXIAs1PsvwMeH4", // replace with real link
    },
    {
      name: "Other States Group",
      link: "https://chat.whatsapp.com/KQh0RqyGEZY44sVhxikzX6", // replace with real link
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className=" rounded-xl max-w-md w-full text-center">
        <img
          className="mb-6 h-52 w-full object-cover rounded-sm"
          src="https://images.unsplash.com/photo-1719204718581-5c95889c8ec9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
        />

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-4">Remote job</h1>

          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className=" px-6 py-3 text-sm font-light bg-green-600 text-white rounded-sm hover:bg-green-800 flex items-center justify-center gap-2"
          >
            Remote Job india
          </a>
        </div>

        <h1 className="text-xl font-bold text-white mb-4">
          Join Our WhatsApp Groups
        </h1>
        <p className="text-gray-300 mb-6 text-sm md:text-base">
          Stay updated with the latest job postings and discussions by joining
          our official WhatsApp groups.
        </p>

        <div className="space-y-4">
          {groups.map((group, index) => (
            <a
              key={index}
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              className=" px-6 py-3 text-sm font-light bg-green-600 text-white rounded-sm hover:bg-green-800 flex items-center justify-center gap-2"
            >
              {group.name}
            </a>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-light text-blue-600 rounded-sm hover:bg-gray-100"
          >
            Back to Job
          </button>
        </div>
      </div>
    </div>
  );
}
