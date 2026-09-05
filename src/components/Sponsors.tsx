"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { Sparkles } from "lucide-react";

const platinumSponsors = [
  { name: "Platinum Sponsor 1", initials: "PS" },
  { name: "Platinum Sponsor 2", initials: "PS" },
];

const goldSponsors = [
  { name: "Gold Sponsor 1", initials: "GS" },
  { name: "Gold Sponsor 2", initials: "GS" },
  { name: "Gold Sponsor 3", initials: "GS" },
];

export default function Sponsors() {
  return (
    <section className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1f3d]/30 to-[#0a1628]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Our Sponsors</h2>
            <p className="section-subtitle">Proudly supported by our amazing partners and sponsors</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Sparkles size={16} className="text-[#e5e4e2]" />
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#e5e4e2]">Platinum Sponsors</span>
              <Sparkles size={16} className="text-[#e5e4e2]" />
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {platinumSponsors.map((sponsor, i) => (
                <motion.div key={i} className="w-48 h-28 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:border-[#e5e4e2]/30 transition-all duration-300 cursor-pointer group" whileHover={{ y: -4, scale: 1.05 }}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#e5e4e2]/20 to-transparent flex items-center justify-center mb-2 group-hover:from-[#e5e4e2]/30 transition-colors">
                      <span className="text-lg font-black text-[#e5e4e2]/60">{sponsor.initials}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{sponsor.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#ffd700]/70">Gold Sponsors</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {goldSponsors.map((sponsor, i) => (
                <motion.div key={i} className="w-36 h-20 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:border-[#ffd700]/20 transition-all duration-300 cursor-pointer" whileHover={{ y: -3, scale: 1.05 }}>
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-[#ffd700]/10 flex items-center justify-center mb-1">
                      <span className="text-xs font-bold text-[#ffd700]/50">{sponsor.initials}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">{sponsor.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
