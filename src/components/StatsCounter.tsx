"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { clubStats } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { Calendar, Target, Users, Trophy } from "lucide-react";

const icons = [Calendar, Target, Target, Users];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsCounter() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0f1f3d] to-[#0a1628]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {clubStats.map((stat, i) => {
            const Icon = icons[i] || Trophy;
            return (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="stat-card text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00c853]/20 transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00c853]/10 mb-4">
                    <Icon className="w-5 h-5 text-[#00c853]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
