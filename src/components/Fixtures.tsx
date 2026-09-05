"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fixtures } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { Calendar, MapPin } from "lucide-react";

export default function Fixtures() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const filtered =
    filter === "all" ? fixtures : fixtures.filter((f) => f.status === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section id="fixtures" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Match Fixtures</h2>
            <p className="section-subtitle">
              Follow our journey through the Primer League season
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex justify-center gap-2 mb-10">
            {(["all", "upcoming", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                  filter === f
                    ? "bg-[#00c853] text-white shadow-lg shadow-[#00c853]/25"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          {filtered.map((match, i) => (
            <AnimatedSection key={match.id} delay={i * 0.08} direction="left">
              <motion.div className="card-glass p-4 sm:p-6" whileHover={{ scale: 1.01 }}>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm sm:w-36 shrink-0">
                    <Calendar size={14} className="text-[#00c853]" />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6">
                    <div className="text-right flex-1">
                      <span className={`font-bold text-sm sm:text-base ${match.homeTeam.includes("Ooty") ? "text-[#00c853]" : "text-white"}`}>
                        {match.homeTeam}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.status === "completed" ? (
                        <div className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5">
                          <span className="text-xl font-black text-white">{match.homeScore}</span>
                          <span className="text-gray-500 mx-1">-</span>
                          <span className="text-xl font-black text-white">{match.awayScore}</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-lg bg-[#00c853]/10 border border-[#00c853]/20">
                          <span className="text-xs font-bold text-[#00c853] uppercase">{match.time}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <span className={`font-bold text-sm sm:text-base ${match.awayTeam.includes("Ooty") ? "text-[#00c853]" : "text-white"}`}>
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:w-36 shrink-0">
                    <MapPin size={12} className="text-gray-500" />
                    <span>{match.venue}</span>
                  </div>
                </div>
                {match.status === "completed" && (
                  <div className="mt-3 sm:mt-0 sm:absolute sm:top-3 sm:right-3 relative">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-700/50 text-gray-400">Full Time</span>
                  </div>
                )}
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
