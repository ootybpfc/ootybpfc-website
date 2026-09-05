"use client";

import { motion } from "framer-motion";
import { clubInfo, nextMatch } from "@/lib/data";
import ParticleBackground from "./ParticleBackground";
import { ChevronDown, Play } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1628]" />
      <ParticleBackground />
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00c853]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00c853]/3 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00c853]/30 bg-[#00c853]/10 text-[#00c853] text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
            Canadian Professional Football
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-4"
        >
          <span className="text-white">Ooty</span>{" "}
          <span className="bg-gradient-to-r from-[#00c853] to-[#00e676] bg-clip-text text-transparent">
            Black Pearl
          </span>
          <br />
          <span className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">FC</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300 mb-2 tracking-wide"
        >
          {clubInfo.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-gray-400 text-sm sm:text-base mb-10 max-w-2xl mx-auto"
        >
          {clubInfo.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 mb-10"
        >
          <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Next Match</span>
          <span className="text-white font-bold text-sm">{nextMatch.homeTeam} vs {nextMatch.awayTeam}</span>
          <span className="text-[#00c853] text-xs font-medium">{nextMatch.venue}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#fixtures" className="btn-primary flex items-center gap-2 text-base">View Fixtures</a>
          <a href="#training" className="btn-outline flex items-center gap-2 text-base">
            <Play size={16} />
            Join Academy
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
