"use client";
import Link from "next/link";
import LatestJobs from "../components/LatestJobs";
import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-[100dvh] overflow-hidden py-8 relative">
      <div className="h-full">
        <div className="container mx-auto px-4">
          {/* Header */}

          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/home" className="">
                <div className="h-10 w-10 rounded-lg bgco flex items-center justify-center">
                  <img src="favicon.png" alt=" " className="h-4" />
                </div>
              </Link>

              <div>
                <h1 className="text-lg font-bold text-[#8491a5]">
                  zeno<span className="text-[#F97316]">way</span>
                </h1>
                <h1 className="text-[#7691bd] text-xs font-light">
                  Job Portal
                </h1>
              </div>
            </div>
            <Link href="/home/jobs" className="">
              <div className="h-10 w-10 rounded-full flex justify-center items-center border border-white/10">
                <Search className="text-white" size={16} strokeWidth={1.5} />
              </div>
            </Link>
          </div>

          {/* post card */}

          <div className="bg-[#0B1F38] flex justify-between rounded-xl overflow-hidden border border-b-2 border-white/10">
            <div className="p-4">
              <h2 className="text-white/80 font-bold">
                Are you <span className="text-blue-500">hiring?</span>{" "}
              </h2>
              <h2 className="text-white/80 font-bold">Share your job here</h2>
              <h2 className="text-white/80 font-bold"> for free!</h2>

              <Link
                href="/home/post-job"
                className="text-blue-500 flex items-center gap-2 mt-4 text-sm"
              >
                Post Now <ArrowRight size={20} strokeWidth={0.75} />
              </Link>
            </div>

            <div>
              <div className="relative h-36 w-36">
                <Image
                  width={600}
                  height={400}
                  className="h-36 w-36 object-cover object-top"
                  src="/home.jpg"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F38] to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="px-4">
            <LatestJobs />
          </div>
        </div>
      </div>
    </div>
  );
}
