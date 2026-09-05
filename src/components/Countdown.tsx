"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { nextMatch } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { MapPin, Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-16 h-20 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-b from-[#162a4a] to-[#0f1f3d] border border-white/10 flex items-center justify-center shadow-lg"
      >
        <span className="countdown-digit">
          {String(value).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
      </motion.div>
      <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(nextMatch.date));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(nextMatch.date));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1f3d]/80 to-[#0a1628]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00c853]/5 rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/10 text-[#ffd700] text-xs font-bold uppercase tracking-widest mb-6">
            <Clock size={12} />
            Upcoming Match
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">
            {nextMatch.homeTeam}{" "}
            <span className="text-gray-500">vs</span>{" "}
            {nextMatch.awayTeam}
          </h2>

          <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-10">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#00c853]" />
              {nextMatch.venue}
            </span>
            <span className="text-gray-600">|</span>
            <span>{nextMatch.league}</span>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <FlipDigit value={timeLeft.days} label="Days" />
            <div className="text-2xl sm:text-3xl font-bold text-[#00c853] mt-[-1rem]">:</div>
            <FlipDigit value={timeLeft.hours} label="Hours" />
            <div className="text-2xl sm:text-3xl font-bold text-[#00c853] mt-[-1rem]">:</div>
            <FlipDigit value={timeLeft.minutes} label="Mins" />
            <div className="text-2xl sm:text-3xl font-bold text-[#00c853] mt-[-1rem]">:</div>
            <FlipDigit value={timeLeft.seconds} label="Secs" />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
