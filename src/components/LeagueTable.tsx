"use client";

import { motion } from "framer-motion";
import { leagueTable } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { Trophy } from "lucide-react";

export default function LeagueTable() {
  return (
    <section id="league" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">League Table</h2>
            <p className="section-subtitle">Primer League standings, updated after every matchday</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <div className="card-glass overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00c853]/10 flex items-center justify-center"><Trophy size={16} className="text-[#00c853]" /></div>
              <div><h3 className="text-sm font-bold text-white">Primer League</h3><span className="text-[10px] text-gray-400 uppercase tracking-widest">2026 Season</span></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/5">
                    <th className="text-left py-3 px-4 w-10">#</th>
                    <th className="text-left py-3 px-4">Team</th>
                    <th className="text-center py-3 px-2">P</th><th className="text-center py-3 px-2">W</th>
                    <th className="text-center py-3 px-2">D</th><th className="text-center py-3 px-2">L</th>
                    <th className="text-center py-3 px-2 hidden sm:table-cell">GF</th>
                    <th className="text-center py-3 px-2 hidden sm:table-cell">GA</th>
                    <th className="text-center py-3 px-2">GD</th>
                    <th className="text-center py-3 px-4 font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueTable.map((row, i) => {
                    const isOOTY = row.team.includes("Ooty");
                    return (
                      <motion.tr key={row.team} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`border-b border-white/[0.03] transition-colors ${isOOTY ? "bg-[#00c853]/[0.06] hover:bg-[#00c853]/10" : "hover:bg-white/[0.02]"}`}>
                        <td className="py-3.5 px-4"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${row.pos === 1 ? "bg-[#ffd700]/20 text-[#ffd700]" : row.pos === 2 ? "bg-gray-400/20 text-gray-300" : row.pos === 3 ? "bg-orange-400/20 text-orange-400" : "bg-white/5 text-gray-500"}`}>{row.pos}</div></td>
                        <td className="py-3.5 px-4"><span className={`font-semibold text-sm ${isOOTY ? "text-[#00c853]" : "text-white"}`}>{row.team}</span></td>
                        <td className="text-center py-3.5 px-2 text-sm text-gray-300">{row.played}</td>
                        <td className="text-center py-3.5 px-2 text-sm text-gray-300">{row.won}</td>
                        <td className="text-center py-3.5 px-2 text-sm text-gray-300">{row.drawn}</td>
                        <td className="text-center py-3.5 px-2 text-sm text-gray-300">{row.lost}</td>
                        <td className="text-center py-3.5 px-2 text-sm text-gray-300 hidden sm:table-cell">{row.gf}</td>
                        <td className="text-center py-3.5 px-2 text-sm text-gray-300 hidden sm:table-cell">{row.ga}</td>
                        <td className="text-center py-3.5 px-2 text-sm"><span className={row.gd > 0 ? "text-[#00c853]" : row.gd < 0 ? "text-red-400" : "text-gray-400"}>{row.gd > 0 ? `+${row.gd}` : row.gd}</span></td>
                        <td className="text-center py-3.5 px-4"><span className={`font-black text-base ${isOOTY ? "text-[#00c853]" : "text-white"}`}>{row.points}</span></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
