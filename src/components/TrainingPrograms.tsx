"use client";

import { motion } from "framer-motion";
import { trainingPrograms } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { Star, Trophy, Shield, Check } from "lucide-react";

const iconMap: Record<string, typeof Star> = { star: Star, trophy: Trophy, shield: Shield };
const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  green: { bg: "bg-[#00c853]/10", text: "text-[#00c853]", border: "border-[#00c853]/30", glow: "shadow-[#00c853]/20" },
  gold: { bg: "bg-[#ffd700]/10", text: "text-[#ffd700]", border: "border-[#ffd700]/30", glow: "shadow-[#ffd700]/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-400/30", glow: "shadow-blue-400/20" },
};

export default function TrainingPrograms() {
  return (
    <section id="training" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Training Programs</h2>
            <p className="section-subtitle">Develop your skills with our world-class coaching staff and comprehensive training curriculum</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {trainingPrograms.map((program, i) => {
            const Icon = iconMap[program.icon] || Star;
            const colors = colorMap[program.color] || colorMap.green;
            return (
              <AnimatedSection key={program.id} delay={i * 0.15}>
                <motion.div className={`relative card-glass p-6 sm:p-8 h-full flex flex-col ${program.popular ? `border-2 ${colors.border} shadow-lg ${colors.glow}` : ""}`} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  {program.popular && (<div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#ffd700] to-[#ffab00] text-[#0a1628]">Most Popular</span></div>)}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colors.bg} mb-5`}><Icon className={`w-6 h-6 ${colors.text}`} /></div>
                  <h3 className="text-xl font-bold text-white mb-1">{program.title}</h3>
                  <span className={`text-sm font-semibold ${colors.text} mb-3`}>{program.ageRange}</span>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{program.description}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {program.features.map((feature) => (<li key={feature} className="flex items-center gap-2.5 text-sm text-gray-300"><Check size={14} className={`${colors.text} shrink-0`} />{feature}</li>))}
                  </ul>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-4"><span className="text-3xl font-black text-white">${program.price}</span><span className="text-gray-400 text-sm">{program.currency}/{program.period}</span></div>
                    <button className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${program.popular ? "bg-gradient-to-r from-[#ffd700] to-[#ffab00] text-[#0a1628] hover:shadow-lg hover:shadow-[#ffd700]/25" : `${colors.bg} ${colors.text} border ${colors.border} hover:bg-opacity-20`}`} onClick={() => { const el = document.getElementById("contact"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>Register Now</button>
                  </div>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
