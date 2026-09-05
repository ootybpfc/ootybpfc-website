"use client";

import { motion } from "framer-motion";
import { players } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { Star } from "lucide-react";

const positionColors: Record<string, string> = {
  Forward: "text-red-400 bg-red-400/10",
  Midfielder: "text-[#00c853] bg-[#00c853]/10",
  Defender: "text-blue-400 bg-blue-400/10",
  Goalkeeper: "text-[#ffd700] bg-[#ffd700]/10",
};

const positionIcons: Record<string, string> = {
  Forward: "\u26a1",
  Midfielder: "\ud83c\udfaf",
  Defender: "\ud83d\udee1\ufe0f",
  Goalkeeper: "\ud83e\udde4",
};

export default function PlayerSpotlight() {
  return (
    <section id="players" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1f3d]/40 to-[#0a1628]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Rising Starlets</h2>
            <p className="section-subtitle">Meet the players making waves this season for Ooty Black Pearl FC</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player, i) => (
            <AnimatedSection key={player.id} delay={i * 0.12}>
              <motion.div className="card-glass overflow-hidden group cursor-pointer" whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <div className="relative h-44 bg-gradient-to-br from-[#162a4a] to-[#0f1f3d] flex items-center justify-center overflow-hidden">
                  <span className="text-8xl font-black text-white/[0.04] absolute right-2 top-0 select-none">{player.number}</span>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00c853]/20 to-[#162a4a] border-2 border-[#00c853]/30 flex items-center justify-center mb-2 group-hover:border-[#00c853] transition-colors">
                      <span className="text-3xl">{positionIcons[player.position] || "\u26bd"}</span>
                    </div>
                    {player.isCaptain && (<div className="absolute -top-1 -right-1"><div className="w-6 h-6 rounded-full bg-[#ffd700] flex items-center justify-center"><span className="text-[10px] font-black text-[#0a1628]">C</span></div></div>)}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm"><Star size={10} className="text-[#ffd700] fill-[#ffd700]" /><span className="text-xs font-bold text-white">{player.rating}</span></div>
                  <div className="absolute bottom-3 left-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${positionColors[player.position] || "text-gray-400 bg-gray-400/10"}`}>{player.position}</span></div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div><h3 className="text-base font-bold text-white leading-tight">{player.name}</h3><span className="text-xs text-gray-400">{player.nationality}</span></div>
                    <span className="text-2xl font-black text-white/10">#{player.number}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-white/[0.03]"><div className="text-lg font-bold text-[#00c853]">{player.goals}</div><div className="text-[9px] text-gray-500 uppercase tracking-wider">Goals</div></div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.03]"><div className="text-lg font-bold text-[#ffd700]">{player.assists}</div><div className="text-[9px] text-gray-500 uppercase tracking-wider">Assists</div></div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.03]"><div className="text-lg font-bold text-blue-400">{player.appearances}</div><div className="text-[9px] text-gray-500 uppercase tracking-wider">Apps</div></div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
