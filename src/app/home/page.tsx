"use client";
import Image from "next/image";

import Link from "next/link";
import {
  ArrowRight,
  Search,
  BriefcaseBusiness,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Clock,
  Building2,
  CheckCircle2,
  Eye,
  BookmarkPlus,
  Star,
  Calendar,
  Zap,
  Globe,
  DollarSign,
  GraduationCap,
  Heart,
} from "lucide-react";

import { FiCheckCircle } from "react-icons/fi";

const images = [
  "/happy/1.jpg",
  "/happy/6.jpg",
  "/happy/5.jpg",
  "/happy/3.jpg",
  "/happy/7.jpg",
];

const stats = [
  { value: "45K+", label: "Active Jobs", icon: BriefcaseBusiness },
  { value: "15K+", label: "Companies", icon: Building2 },
  { value: "200K+", label: "Job Seekers", icon: Users },
  { value: "92%", label: "Satisfaction Rate", icon: Star },
];

export default function Home() {
  return (
    <main className="h-full overflow-scroll ">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Hero Section */}

        <section className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2  py-2 ">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  ZENOWAY
                </span>
              </div>

              <h1 className="text-5xl lg:text-5xl font-bold tracking-tight">
                Find Your
                <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent mt-2">
                  Perfect Career
                </span>
              </h1>

              <p className="mt-6 text-md text-gray-600 leading-relaxed max-w-2xl">
                Join millions of professionals finding their next opportunity.
                Get matched with roles at world-class companies.
              </p>

              <div className="mt-10">
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-700">
                    <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                    <span>
                      Connecting talented people with modern companies
                    </span>
                  </li>

                  <li className="flex items-center gap-3 text-gray-700">
                    <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                    <span>
                      Remote, hybrid, and on-site opportunities in one place
                    </span>
                  </li>

                  <li className="flex items-center gap-3 text-gray-700">
                    <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                    <span>Simple and clean experience for job seekers</span>
                  </li>

                  <li className="flex items-center gap-3 text-gray-700">
                    <FiCheckCircle className="text-green-600 text-xl shrink-0" />
                    <span>
                      Helping people build better careers and better lives
                    </span>
                  </li>
                </ul>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-blue-500" />
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Job Cards */}
            <div className="flex justify-center">
              <img
                className="h-120 w-90 object-cover rounded-2xl"
                src="/341.jpg"
                alt=""
              />
            </div>
          </div>
        </section>
        <section className="mb-24">
          <div className="mb-8 max-w-4xl">
            <h2 className="text-3xl font-semibold mb-3">
              Building Happy Work Experiences
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We believe a good job creates a happier life. When people enjoy
              their work, they can enjoy better weekends, peaceful vacations,
              and more meaningful moments with family and friends. Every
              opportunity we create is focused on helping people build a
              satisfying and balanced life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`happy-${index}`}
                width={500}
                height={500}
                className="aspect-square object-cover rounded-xl w-full h-full"
              />
            ))}
          </div>
        </section>

        <section>
          <div className="bg-black rounded-xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold">
              We&apos;re Still Under Development 🚧
            </h2>

            <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
              Zenoway is currently in active development. If you find any bugs,
              technical issues, UI problems, or unexpected behavior while using
              the platform, please cooperate with us by reporting them.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
