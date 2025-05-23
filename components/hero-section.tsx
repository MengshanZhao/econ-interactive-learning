'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative py-56 md:py-64 overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {isClient && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/Roadmap.mp4" type="video/mp4" />
          </video>
        )}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white tracking-tight">Hello! <span className="block text-white">I'm Mengshan Zhao.</span></h1>
              <p className="text-xl md:text-2xl mb-2 text-white font-medium">PhD Candidate in Agricultural Economics, Washington State University.</p>
            </div>
            <div className="flex gap-4 mt-6">
              <Link href="/research">
                <span className="bg-[#FFC107] hover:bg-[#FFA000] text-black px-6 py-2 rounded-full font-semibold transition-colors">Research</span>
              </Link>
              <Link href="/teaching">
                <span className="bg-[#FFC107] hover:bg-[#FFA000] text-black px-6 py-2 rounded-full font-semibold transition-colors">Teaching</span>
              </Link>
              <Link href="/cv">
                <span className="bg-[#FFC107] hover:bg-[#FFA000] text-black px-6 py-2 rounded-full font-semibold transition-colors">CV</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 