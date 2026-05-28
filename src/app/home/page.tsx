"use client";

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

// Sample job data
const featuredJobs = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "Linear",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$140k - $180k",
    tags: ["Figma", "UI/UX", "Design Systems"],
    featured: true,
    logo: "L",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 2,
    title: "Frontend Engineer",
    company: "Vercel",
    location: "Remote (US)",
    type: "Full-time",
    salary: "$150k - $200k",
    tags: ["React", "Next.js", "TypeScript"],
    featured: false,
    logo: "V",
    color: "from-black to-gray-800",
  },
  {
    id: 3,
    title: "Product Manager",
    company: "Notion",
    location: "New York, NY",
    type: "Hybrid",
    salary: "$160k - $220k",
    tags: ["Strategy", "Analytics", "Agile"],
    featured: false,
    logo: "N",
    color: "from-green-500 to-emerald-500",
  },
];

const companies = [
  { name: "Google", jobs: 234, logo: "G" },
  { name: "Meta", jobs: 187, logo: "M" },
  { name: "Apple", jobs: 156, logo: "A" },
  { name: "Microsoft", jobs: 142, logo: "W" },
  { name: "Netflix", jobs: 98, logo: "N" },
  { name: "Stripe", jobs: 76, logo: "S" },
];

const categories = [
  { name: "Engineering", count: 3421, icon: BriefcaseBusiness },
  { name: "Design", count: 1856, icon: Sparkles },
  { name: "Product", count: 1243, icon: TrendingUp },
  { name: "Marketing", count: 987, icon: Users },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Engineer at Stripe",
    content:
      "Found my dream job in just 2 weeks. The platform is incredibly intuitive!",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Michael Rodriguez",
    role: "Product Designer",
    content:
      "The verification system saved me from so many spam listings. Best job platform out there.",
    rating: 5,
    avatar: "M",
  },
  {
    name: "Emma Watson",
    role: "Recent Graduate",
    content:
      "Landing my first role was seamless. The resources and job matches were spot on.",
    rating: 5,
    avatar: "E",
  },
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
      <span>Connecting talented people with modern companies</span>
    </li>

    <li className="flex items-center gap-3 text-gray-700">
      <FiCheckCircle className="text-green-600 text-xl shrink-0" />
      <span>Remote, hybrid, and on-site opportunities in one place</span>
    </li>

    <li className="flex items-center gap-3 text-gray-700">
      <FiCheckCircle className="text-green-600 text-xl shrink-0" />
      <span>Simple and clean experience for job seekers</span>
    </li>

    <li className="flex items-center gap-3 text-gray-700">
      <FiCheckCircle className="text-green-600 text-xl shrink-0" />
      <span>Helping people build better careers and better lives</span>
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
      We believe a good job creates a happier life. When people enjoy their
      work, they can enjoy better weekends, peaceful vacations, and more
      meaningful moments with family and friends. Every opportunity we create
      is focused on helping people build a satisfying and balanced life.
    </p>
  </div>

  <div className="grid grid-cols-5 gap-4">
    <img
      src="/happy/1.jpg"
      className="aspect-square object-cover rounded-2xl"
      alt=""
    />
    <img
      src="/happy/6.jpg"
      className="aspect-square object-cover rounded-2xl"
      alt=""
    />
    <img
      src="/happy/5.jpg"
      className="aspect-square object-cover rounded-2xl"
      alt=""
    />
    <img
      src="/happy/3.jpg"
      className="aspect-square object-cover rounded-2xl"
      alt=""
    />
    <img
      src="/happy/7.jpg"
      className="aspect-square object-cover rounded-2xl"
      alt=""
    />
  </div>
</section>

        {/* Companies Section */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Trusted by Industry Leaders
            </h2>
            <p className="text-gray-500 mt-4">
              Join thousands of companies hiring on Zenoway
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {companies.map((company) => (
              <div
                key={company.name}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {company.logo}
                </div>
                <h3 className="font-medium text-gray-900 mt-2">
                  {company.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {company.jobs} open roles
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-24">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <p className="text-gray-500 mt-2">
                Find roles that match your expertise
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <cat.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {cat.count.toLocaleString()} jobs
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-24">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Why Top Talent Chooses Zenoway
              </h2>
              <p className="text-gray-500 mt-4">
                We're redefining the job search experience
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified Listings",
                  desc: "Every job is manually reviewed and verified for authenticity",
                },
                {
                  icon: Zap,
                  title: "Lightning Fast Apply",
                  desc: "Apply in seconds with your profile — no repetitive forms",
                },
                {
                  icon: TrendingUp,
                  title: "Career Growth",
                  desc: "Personalized recommendations based on your career path",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Loved by Job Seekers
            </h2>
            <p className="text-gray-500 mt-4">
              See what our community has to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "{t.content}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
              Join thousands of professionals who found their dream job through
              Zenoway
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                Find Your Dream Job
              </button>
              <button className="border border-white/30 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
                Post a Job →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
